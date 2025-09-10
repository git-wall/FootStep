import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Group, Circle } from 'react-konva';
import type { Node, Connection } from '../types';

interface SimpleSelectionLayerProps {
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

export function SimpleSelectionLayer({
  nodes,
  connections,
  selectedNodeIds,
  canvasSize,
  zoomLevel,
  canvasOffset,
  isDragging = false,
  onSelectionComplete,
  onNodesMove
}: SimpleSelectionLayerProps) {
  const stageRef = useRef<any>(null);
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const groupRef = useRef<any>(null);

  // Don't render during drag operations to avoid conflicts
  if (isDragging) {
    return null;
  }

  // Handle mouse down on empty area
  const handleMouseDown = (e: any) => {
    // Check if we clicked on a DOM node element (not Konva shapes)
    const domEvent = e.evt;
    if (domEvent) {
      const domTarget = domEvent.target;

      // If clicking on a node element or any interactive element, don't start selection
      if (domTarget.closest('.node') ||
          domTarget.closest('.node-component') ||
          domTarget.closest('.technology-item') ||
          domTarget.closest('button') ||
          domTarget.closest('input') ||
          domTarget.tagName === 'CANVAS') {
        return;
      }
    }

    // Only start selection if clicking on empty stage
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnLayer = e.target.getType && e.target.getType() === 'Layer';

    if (clickedOnEmpty || clickedOnLayer) {
      const pos = e.target.getStage().getPointerPosition();
      setStartPos(pos);
      setIsSelecting(true);
      setSelectionRect({
        visible: false,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0
      });
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: any) => {
    if (!isSelecting) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    const newRect = {
      visible: true,
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y)
    };

    setSelectionRect(newRect);
  };

  // Handle mouse up
  const handleMouseUp = () => {
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
  };

  // Handle group dragging
  const handleGroupDragStart = () => {
    setIsDraggingGroup(true);
  };

  const handleGroupDragMove = (e: any) => {
    if (!isDraggingGroup || !onNodesMove) return;

    const group = e.target;
    const pos = group.position();

    // Calculate delta from initial position (0,0) in canvas coordinates
    const deltaX = pos.x / zoomLevel;
    const deltaY = pos.y / zoomLevel;

    // Move nodes in React state
    onNodesMove(selectedNodeIds, deltaX, deltaY);

    // Reset group position to prevent double movement
    group.position({ x: 0, y: 0 });
  };

  const handleGroupDragEnd = () => {
    setIsDraggingGroup(false);
    if (groupRef.current) {
      groupRef.current.position({ x: 0, y: 0 });
    }
  };

  // Get selected nodes for rendering
  const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1 // Lower z-index to not interfere with nodes
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          pointerEvents: 'auto',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <Layer>
          {/* Selection Rectangle */}
          {selectionRect.visible && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(96, 165, 250, 0.1)"
              stroke="#60A5FA"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}

          {/* Draggable Group for Selected Nodes */}
          {selectedNodes.length > 1 && onNodesMove && (
            <Group
              ref={groupRef}
              draggable={true}
              onDragStart={handleGroupDragStart}
              onDragMove={handleGroupDragMove}
              onDragEnd={handleGroupDragEnd}
            >
              {selectedNodes.map(node => (
                <Circle
                  key={node.id}
                  x={(node.position.x + canvasOffset.x) * zoomLevel}
                  y={(node.position.y + canvasOffset.y) * zoomLevel}
                  radius={30 * zoomLevel}
                  fill="rgba(96, 165, 250, 0.2)"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              ))}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
