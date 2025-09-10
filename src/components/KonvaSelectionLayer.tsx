import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Connection } from '../types';

interface KonvaSelectionLayerProps {
  nodes: Node[];
  connections: Connection[];
  selectedNodeIds: string[];
  canvasSize: { width: number; height: number };
  zoomLevel: number;
  canvasOffset: { x: number; y: number };
  isPanning: boolean;
  isSpacePressed: boolean;
  isShiftPressed?: boolean; // Add this to track SHIFT key state
  isDraggingNode?: boolean; // Add this to detect when nodes are being dragged
  onSelectionComplete: (selectedNodeIds: string[], selectedConnectionIds: string[]) => void;
  onNodesMove: (nodeIds: string[], deltaX: number, deltaY: number) => void;
}

// Improved selection layer based on your Konva example
export function KonvaSelectionLayer({
  nodes,
  connections,
  selectedNodeIds,
  zoomLevel,
  canvasOffset,
  isPanning,
  isSpacePressed,
  isShiftPressed = false,
  isDraggingNode = false,
  onSelectionComplete
}: KonvaSelectionLayerProps) {
  // Selection rectangle state (like your example)
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Add global mouse event listeners when dragging to prevent node interference
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isShiftPressed) return;

      // Convert global mouse position to canvas coordinates
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const pos = {
        x: (e.clientX - rect.left - canvasOffset.x) / zoomLevel,
        y: (e.clientY - rect.top - canvasOffset.y) / zoomLevel
      };

      // Update selection rectangle
      const newRect = {
        visible: true,
        x: Math.min(dragStart.x, pos.x),
        y: Math.min(dragStart.y, pos.y),
        width: Math.abs(pos.x - dragStart.x),
        height: Math.abs(pos.y - dragStart.y)
      };

      setSelectionRect(newRect);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        // Only complete selection if rectangle is large enough
        if (selectionRect.width > 5 && selectionRect.height > 5) {
          // Select nodes within rectangle
          const selectedNodes = nodes.filter(node => {
            const nodeRect = {
              x: node.position.x,
              y: node.position.y,
              width: 160, // Node width
              height: 100 // Node height
            };

            return (
              nodeRect.x < selectionRect.x + selectionRect.width &&
              nodeRect.x + nodeRect.width > selectionRect.x &&
              nodeRect.y < selectionRect.y + selectionRect.height &&
              nodeRect.y + nodeRect.height > selectionRect.y
            );
          });

          // Find connections where both nodes are selected
          const selectedConnections = connections.filter(connection => {
            const fromNode = nodes.find(n => n.id === connection.fromNodeId);
            const toNode = nodes.find(n => n.id === connection.toNodeId);

            if (!fromNode || !toNode) return false;

            const fromSelected = selectedNodes.some(n => n.id === fromNode.id);
            const toSelected = selectedNodes.some(n => n.id === toNode.id);

            return fromSelected && toSelected;
          });

          // Update selection
          onSelectionComplete(
            selectedNodes.map(node => node.id),
            selectedConnections.map(conn => conn.id)
          );
        }

        // Hide selection rectangle
        setIsDragging(false);
        setSelectionRect({ visible: false, x: 0, y: 0, width: 0, height: 0 });
      }
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isShiftPressed, dragStart, selectionRect, nodes, connections, canvasOffset, zoomLevel, onSelectionComplete]);

  // Get canvas coordinates (accounting for canvas transform)
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();

    // Account for canvas transform (scale and translate)
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Convert screen coordinates to canvas coordinates
    const canvasX = (rawX / zoomLevel) - canvasOffset.x;
    const canvasY = (rawY / zoomLevel) - canvasOffset.y;

    return { x: canvasX, y: canvasY };
  }, [zoomLevel, canvasOffset]);



  // Handle mouse down on empty area - ONLY with SHIFT key
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start selection if:
    // - Not left click
    // - Currently panning or space is pressed
    // - A node is being dragged
    // - SHIFT key is NOT pressed (this prevents conflict with single node clicks)
    if (e.button !== 0 || isPanning || isSpacePressed || isDraggingNode || !e.shiftKey) return;

    const pos = getCanvasCoordinates(e);

    // Clear existing selection if not holding Ctrl/Cmd
    if (!e.ctrlKey && !e.metaKey) {
      onSelectionComplete([], []);
    }

    // Start selection rectangle
    setIsDragging(true);
    setDragStart({ x: pos.x, y: pos.y });
    setSelectionRect({
      visible: true,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0
    });
  }, [isPanning, isSpacePressed, isDraggingNode, getCanvasCoordinates, onSelectionComplete]);

  // Handle mouse move - continue selection only if SHIFT is still pressed
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isPanning || isSpacePressed || isDraggingNode) return;

    // Stop selection if SHIFT key is released during drag
    if (!e.shiftKey) {
      setIsDragging(false);
      setSelectionRect({ visible: false, x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    const pos = getCanvasCoordinates(e);

    // Update selection rectangle
    const newRect = {
      visible: true,
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      width: Math.abs(pos.x - dragStart.x),
      height: Math.abs(pos.y - dragStart.y)
    };

    setSelectionRect(newRect);
  }, [isDragging, dragStart, isPanning, isSpacePressed, isDraggingNode, getCanvasCoordinates]);

  // Handle mouse up - finalize selection
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Only complete selection if rectangle is large enough
      if (selectionRect.width > 5 && selectionRect.height > 5) {
        // Select nodes within rectangle
        const selectedNodes = nodes.filter(node => {
          const nodeRect = {
            x: node.position.x,
            y: node.position.y,
            width: 160, // Node width
            height: 100 // Node height
          };

          return (
            nodeRect.x < selectionRect.x + selectionRect.width &&
            nodeRect.x + nodeRect.width > selectionRect.x &&
            nodeRect.y < selectionRect.y + selectionRect.height &&
            nodeRect.y + nodeRect.height > selectionRect.y
          );
        });

        // Find connections where both nodes are selected
        const selectedConnections = connections.filter(connection => {
          const fromNode = nodes.find(n => n.id === connection.fromNodeId);
          const toNode = nodes.find(n => n.id === connection.toNodeId);

          if (!fromNode || !toNode) return false;

          const fromSelected = selectedNodes.some(n => n.id === fromNode.id);
          const toSelected = selectedNodes.some(n => n.id === toNode.id);

          return fromSelected && toSelected;
        });

        // Update selection
        onSelectionComplete(
          selectedNodes.map(node => node.id),
          selectedConnections.map(conn => conn.id)
        );
      }

      // Hide selection rectangle
      setIsDragging(false);
      setSelectionRect({ visible: false, x: 0, y: 0, width: 0, height: 0 });
    }
  }, [isDragging, selectionRect, nodes, connections, onSelectionComplete]);

  // Render selection rectangle (like your example)
  const renderSelectionBox = () => {
    if (!selectionRect.visible || selectionRect.width < 5 || selectionRect.height < 5) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: (selectionRect.x + canvasOffset.x) * zoomLevel,
          top: (selectionRect.y + canvasOffset.y) * zoomLevel,
          width: selectionRect.width * zoomLevel,
          height: selectionRect.height * zoomLevel,
          border: '2px dashed #60A5FA',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Don't block node clicks
        zIndex: 1,
        cursor: isDragging ? 'crosshair' : isShiftPressed ? 'crosshair' : 'default'
      }}
    >
      {/* Invisible overlay that captures events on empty areas only */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // Disable pointer events when panning, space pressed, or dragging nodes
          pointerEvents: (isPanning || isSpacePressed || isDraggingNode) ? 'none' : 'auto',
          zIndex: 2,
          backgroundColor: 'transparent'
        }}
        onMouseDown={(e) => {
          // Only handle if clicking on empty area (this div) and not dragging nodes
          if (e.target === e.currentTarget && !isDraggingNode) {
            handleMouseDown(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* High-priority overlay when SHIFT + dragging to prevent node interference */}
      {isDragging && isShiftPressed && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 9999, // Very high z-index to capture all events
            backgroundColor: 'transparent',
            cursor: 'crosshair'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}

      {/* SHIFT Mode Indicator */}
      {isShiftPressed && !isDragging && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(96, 165, 250, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1001,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          🔲 SHIFT + Drag to select multiple nodes
        </div>
      )}

      {/* Selection rectangle */}
      {renderSelectionBox()}

      {/* Selection info */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(96, 165, 250, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 15
          }}
        >
          Selecting... ({selectedNodeIds.length} nodes)
        </div>
      )}
    </div>
  );
}
