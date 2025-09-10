import React, { useState, useRef, useCallback } from 'react';
import type { Node, Connection } from '../types';

interface DOMSelectionLayerProps {
  nodes: Node[];
  connections: Connection[];
  selectedNodeIds: string[];
  canvasSize: { width: number; height: number };
  zoomLevel: number;
  canvasOffset: { x: number; y: number };
  isDragging?: boolean;
  onSelectionComplete: (selectedNodeIds: string[], selectedConnectionIds: string[]) => void;
  onNodesMove?: (nodeIds: string[], deltaX: number, deltaY: number) => void;
}

export function DOMSelectionLayer({
  nodes,
  // connections,
  selectedNodeIds,
  // canvasSize,
  zoomLevel,
  canvasOffset,
  isDragging = false,
  onSelectionComplete,
  onNodesMove
}: DOMSelectionLayerProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const layerRef = useRef<HTMLDivElement>(null);

  // Don't render during drag operations to avoid conflicts
  if (isDragging) {
    return null;
  }

  // Calculate bounding box for selected nodes
  const getBoundingBox = () => {
    if (selectedNodeIds.length === 0) return null;

    const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));
    if (selectedNodes.length === 0) return null;

    // Get actual node positions on screen (accounting for transform)
    const positions = selectedNodes.map(node => ({
      x: node.position.x * zoomLevel + canvasOffset.x * zoomLevel,
      y: node.position.y * zoomLevel + canvasOffset.y * zoomLevel
    }));

    // Node dimensions (approximate)
    const nodeWidth = 120 * zoomLevel;  // Actual node width
    const nodeHeight = 100 * zoomLevel; // Actual node height
    const padding = 10 * zoomLevel;     // Padding around selection

    const minX = Math.min(...positions.map(p => p.x)) - padding;
    const maxX = Math.max(...positions.map(p => p.x)) + nodeWidth + padding;
    const minY = Math.min(...positions.map(p => p.y)) - padding;
    const maxY = Math.max(...positions.map(p => p.y)) + nodeHeight + padding;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const boundingBox = getBoundingBox();

  // Handle mouse down for selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't start selection if clicking on nodes or other interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.node') ||
        target.closest('.node-component') ||
        target.closest('.connection-component') ||
        target.closest('.technology-item') ||
        target.closest('.tech-icon') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('.bounding-box') ||
        target.closest('.top-menu') ||
        target.closest('.sidebar') ||
        target.classList.contains('node') ||
        target.classList.contains('node-component')) {
      return;
    }

    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsSelecting(true);
    setSelectionRect({
      visible: false,
      x,
      y,
      width: 0,
      height: 0
    });
  }, []);

  // Handle mouse move for selection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;

    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRect = {
      visible: true,
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    };

    setSelectionRect(newRect);
  }, [isSelecting, startPos]);

  // Handle mouse up for selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    setIsSelecting(false);

    // Only complete selection if rectangle is visible and large enough
    if (selectionRect.visible && selectionRect.width > 5 && selectionRect.height > 5) {
      // Find nodes within selection rectangle
      const selectedNodes = nodes.filter(node => {
        const nodeX = (node.position.x + canvasOffset.x) * zoomLevel;
        const nodeY = (node.position.y + canvasOffset.y) * zoomLevel;
        
        return nodeX >= selectionRect.x && 
               nodeX <= selectionRect.x + selectionRect.width &&
               nodeY >= selectionRect.y && 
               nodeY <= selectionRect.y + selectionRect.height;
      });

      // Call selection callback
      onSelectionComplete(
        selectedNodes.map(node => node.id),
        [] // No connection selection for now
      );
    }

    // Hide selection rectangle
    setSelectionRect({
      visible: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
  }, [isSelecting, selectionRect, nodes, canvasOffset, zoomLevel, onSelectionComplete]);

  // Handle bounding box drag start
  const handleBoundingBoxMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onNodesMove || selectedNodeIds.length === 0) return;
    
    e.stopPropagation();
    setIsDraggingGroup(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  }, [onNodesMove, selectedNodeIds.length]);

  // Handle bounding box drag move
  const handleBoundingBoxMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingGroup || !onNodesMove) return;

    const deltaX = (e.clientX - dragStartPos.x) / zoomLevel;
    const deltaY = (e.clientY - dragStartPos.y) / zoomLevel;

    onNodesMove(selectedNodeIds, deltaX, deltaY);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  }, [isDraggingGroup, dragStartPos, zoomLevel, onNodesMove, selectedNodeIds]);

  // Handle bounding box drag end
  const handleBoundingBoxMouseUp = useCallback(() => {
    setIsDraggingGroup(false);
  }, []);

  // Add global mouse events for bounding box dragging
  React.useEffect(() => {
    if (isDraggingGroup) {
      document.addEventListener('mousemove', handleBoundingBoxMouseMove);
      document.addEventListener('mouseup', handleBoundingBoxMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleBoundingBoxMouseMove);
        document.removeEventListener('mouseup', handleBoundingBoxMouseUp);
      };
    }
  }, [isDraggingGroup, handleBoundingBoxMouseMove, handleBoundingBoxMouseUp]);

  return (
    <div
      ref={layerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 1
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Selection Rectangle */}
      {selectionRect.visible && (
        <div
          style={{
            position: 'absolute',
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
            border: '2px dashed #60A5FA',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Bounding Box for Selected Nodes */}
      {boundingBox && selectedNodeIds.length > 1 && (
        <div
          className="bounding-box"
          style={{
            position: 'absolute',
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
            border: '2px solid #60A5FA',
            backgroundColor: 'rgba(96, 165, 250, 0.05)',
            cursor: isDraggingGroup ? 'grabbing' : 'grab',
            pointerEvents: 'auto'
          }}
          onMouseDown={handleBoundingBoxMouseDown}
        >
          {/* Corner handles */}
          <div style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 8,
            height: 8,
            backgroundColor: '#60A5FA',
            border: '1px solid white',
            cursor: 'nw-resize'
          }} />
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            backgroundColor: '#60A5FA',
            border: '1px solid white',
            cursor: 'ne-resize'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            width: 8,
            height: 8,
            backgroundColor: '#60A5FA',
            border: '1px solid white',
            cursor: 'sw-resize'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 8,
            height: 8,
            backgroundColor: '#60A5FA',
            border: '1px solid white',
            cursor: 'se-resize'
          }} />
        </div>
      )}
    </div>
  );
}
