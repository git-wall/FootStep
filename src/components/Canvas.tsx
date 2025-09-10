import { useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { NodeComponent } from './NodeComponent';
import { ConnectionComponent } from './ConnectionComponent';
import { ArrowPopup } from './ArrowPopup';
import { MagicButton } from './MagicButton';
import type { Node, Connection, ArrowPopupData } from '../types';

interface ImportJsonData {
  nodes?: Array<{
    name: string;
    technology?: string;
    position?: { x: number; y: number };
  }>;
  connections?: Array<{
    from: string;
    to: string;
  }>;
}

interface CanvasProps {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  connectingFromNodeId: string | null;
  arrowPopup: ArrowPopupData | null;
  isDragOver?: boolean;
  draggedNodeId?: string | null;
  isPanning?: boolean;
  isConnectMode?: boolean;
  canvasSize?: { width: number; height: number };
  showAllProgressBars: boolean;
  showAllIpAddresses: boolean;
  onNodeSelect: (nodeId: string | null, event?: React.MouseEvent) => void;
  onNodeTitleChange: (nodeId: string, title: string) => void;
  onEndConnection: (fromNodeId: string, toNodeId: string) => void;
  onCancelConnection: () => void;
  onConnectionClick: (connection: Connection, event: React.MouseEvent) => void;
  onConnectionDelete: (connectionId: string) => void;
  onConnectionTypeChange: (connectionId: string, type: Connection['type'], arrowType?: string, pathStyle?: string, animated?: boolean) => void;
  onArrowPopupClose: () => void;
  onOpenCustomArrowEditor: (connection: Connection) => void;
  onNodePositionChange: (nodeId: string, mouseEvent: React.MouseEvent) => void;
  onToggleConnectMode?: () => void;
  onImportJson?: (jsonData: ImportJsonData) => void;
}

export function Canvas({
  nodes,
  connections,
  selectedNodeId,
  selectedNodeIds,
  selectedConnectionIds,
  connectingFromNodeId,
  arrowPopup,
  isDragOver = false,
  draggedNodeId = null,
  isPanning = false,
  isConnectMode = false,
  canvasSize = { width: 2000, height: 1500 },
  showAllProgressBars,
  showAllIpAddresses,
  onNodeSelect,
  onNodeTitleChange,
  onEndConnection,
  onCancelConnection,
  onConnectionClick,
  onConnectionDelete,
  onConnectionTypeChange,
  onArrowPopupClose,
  onOpenCustomArrowEditor,
  onNodePositionChange,
  onToggleConnectMode,
  onImportJson
}: CanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas'
  });

  // Check if canvas is expanded beyond default size
  const defaultCanvasSize = { width: 2000, height: 1500 };
  const isExpanded = canvasSize.width > defaultCanvasSize.width || canvasSize.height > defaultCanvasSize.height;



  const handleCanvasClick = useCallback(() => {
    if (connectingFromNodeId) {
      onCancelConnection();
    } else {
      onNodeSelect(null);
    }

    // If in connect mode and clicking on empty canvas, exit connect mode
    if (isConnectMode && onToggleConnectMode) {
      onToggleConnectMode();
    }

    onArrowPopupClose();
  }, [connectingFromNodeId, onCancelConnection, onNodeSelect, onArrowPopupClose, isConnectMode, onToggleConnectMode]);

  const handleNodeEndConnection = useCallback((toNodeId: string) => {
    if (connectingFromNodeId && connectingFromNodeId !== toNodeId) {
      onEndConnection(connectingFromNodeId, toNodeId);
    }
  }, [connectingFromNodeId, onEndConnection]);

  return (
    <div
      ref={setNodeRef}
      className={`canvas ${isDragOver ? 'drag-over' : ''} ${isPanning ? 'panning' : ''} ${isConnectMode ? 'connect-mode' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`
        // REMOVED: transform that was breaking click interactions
      }}
      onClick={handleCanvasClick}
    >
      {/* SVG for connections */}
      <svg className="connections-svg">
        <defs>
          {/* Arrow markers - improved visibility */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#60A5FA"
              stroke="#60A5FA"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-animated"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#34D399"
              stroke="#34D399"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-split"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#F59E0B"
              stroke="#F59E0B"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-curve"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#8b5cf6"
              stroke="#8b5cf6"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-sketch"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#f97316"
              stroke="#f97316"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-curve-network"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#06b6d4"
              stroke="#06b6d4"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-cubic-bezier"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#10b981"
              stroke="#10b981"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-square-rounded"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 3, 9 6, 0 9"
              fill="#f59e0b"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-dotted"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 2, 8 5, 0 8"
              fill="#a855f7"
              stroke="#a855f7"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-custom"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 3, 9 6, 0 9"
              fill="#f59e0b"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </marker>
        </defs>
        {connections.map(connection => (
          <ConnectionComponent
            key={connection.id}
            connection={connection}
            nodes={nodes}
            isSelected={selectedConnectionIds.includes(connection.id)}
            onConnectionClick={onConnectionClick}
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          isMultiSelected={selectedNodeIds.includes(node.id)}
          isConnecting={!!connectingFromNodeId}
          isDragging={draggedNodeId === node.id}
          showProgressBars={showAllProgressBars}
          showIpAddress={showAllIpAddresses}
          onSelect={onNodeSelect}
          onTitleChange={onNodeTitleChange}
          onEndConnection={handleNodeEndConnection}
          onPositionChange={onNodePositionChange}
        />
      ))}

      {/* Arrow popup */}
      {arrowPopup && (
        <ArrowPopup
          connection={arrowPopup.connection}
          position={arrowPopup.position}
          onClose={onArrowPopupClose}
          onDelete={onConnectionDelete}
          onTypeChange={onConnectionTypeChange}
          onOpenCustomArrowEditor={onOpenCustomArrowEditor}
        />
      )}

      {/* Konva.js SelectionLayer handles bounding box and group dragging */}

      {/* Magic Button */}
      {onImportJson && (
        <MagicButton onImportJson={onImportJson} />
      )}
    </div>
  );
}
