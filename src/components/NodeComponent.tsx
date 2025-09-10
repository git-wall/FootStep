import { useState, useRef, useEffect } from 'react';
import type { Node } from '../types';
import { technologies, nodeTypes } from '../constants';
import { TechIconWithFallback } from './TechIcon';

interface NodeComponentProps {
  node: Node;
  isSelected: boolean;
  isMultiSelected?: boolean;
  isConnecting: boolean;
  isDragging?: boolean;
  showProgressBars?: boolean;
  showIpAddress?: boolean;
  onSelect: (nodeId: string, event?: React.MouseEvent) => void;
  onTitleChange: (nodeId: string, title: string) => void;
  onEndConnection: (nodeId: string) => void;
  onPositionChange: (nodeId: string, mouseEvent: React.MouseEvent) => void;
}

export function NodeComponent({
  node,
  isSelected,
  isMultiSelected = false,
  isConnecting,
  isDragging = false,
  showProgressBars = false,
  showIpAddress = false,
  onSelect,
  onTitleChange,
  onEndConnection,
  onPositionChange
}: NodeComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // SAFETY: Validate node has required fields
  if (!node.id || !node.technologyId || !node.position) {
    console.error('NodeComponent: Invalid node data:', node); // Debug log
    return null;
  }

  const technology = technologies.find(t => t.id === node.technologyId);
  console.log('NodeComponent render:', { nodeId: node.id, technologyId: node.technologyId, technology }); // Debug log
  if (!technology) {
    console.error('Technology not found for node:', node.id, 'technologyId:', node.technologyId); // Debug log
    return null;
  }

  // Get node type (default to cube if not specified)
  const nodeType = nodeTypes.find(nt => nt.id === (node.nodeType || 'cube')) || nodeTypes[0];

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    onTitleChange(node.id, title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(node.title);
      setIsEditing(false);
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onEndConnection(node.id);
    } else {
      onSelect(node.id, e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) return; // Ignore double clicks

    // Check if it's a right click or ctrl+click for connection
    if (e.button === 2 || e.ctrlKey) {
      return;
    }

    // Don't start dragging if clicking on title input
    const target = e.target as HTMLElement;
    if (target.closest('.title-input')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    console.log('Node mouse down:', node.id, 'isMultiSelected:', isMultiSelected); // Debug log

    // Start dragging by calling the position change handler
    onPositionChange(node.id, e);
  };

  return (
    <div
      className={`node ${isSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isConnecting ? 'connecting' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={handleNodeClick}
      onMouseDown={handleMouseDown}
    >
      <div className="node-content">
        <div className="cube-container">
          <div className="cube-icon">
            <img src={nodeType.icon} alt={nodeType.name} />
          </div>

          {/* Technology icon badge */}
          <div
            className="tech-badge"
            style={{ backgroundColor: technology.color }}
          >
            <TechIconWithFallback technology={technology} size={24} />
          </div>
        </div>

        <div className="node-title">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyPress}
              className="title-input"
            />
          ) : (
            <span onClick={handleTitleClick} className="title-text">
              {node.title}
            </span>
          )}

          {/* IP Address - only show if node has IP and showIpAddress is true */}
          {node.ip && showIpAddress && (
            <div className="node-ip">
              {node.ip}
            </div>
          )}
        </div>
      </div>



      {/* Progress Bars */}
      {showProgressBars && (
        <div className="progress-bars">
          <div className="progress-bar">
            <div className="progress-label">CPU</div>
            <div className="progress-track">
              <div className="progress-fill cpu" style={{ width: `${node.cpu || 0}%` }}></div>
            </div>
            <div className="progress-value">{node.cpu || 0}%</div>
          </div>

          <div className="progress-bar">
            <div className="progress-label">Memory</div>
            <div className="progress-track">
              <div className="progress-fill memory" style={{ width: `${node.memory || 0}%` }}></div>
            </div>
            <div className="progress-value">{node.memory || 0}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
