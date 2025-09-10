import { X } from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react'; // Import React hooks
import type { Connection } from '../types';

// Updated with square-rounded path support

interface ArrowManagementPopupProps {
  connection: Connection;
  selectedCount: number;
  totalCount: number;
  onClose: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onChangeType: (type: Connection['type']) => void;
  onChangeCombination?: (arrowType?: string, pathStyle?: string, animated?: boolean) => void;
  onOpenCustomArrowEditor: (connection: Connection) => void;
}

export function ArrowManagementPopup({
  connection,
  selectedCount,
  totalCount,
  onClose,
  onClearSelection,
  onDeleteSelected,
  onChangeType,
  onChangeCombination,
  onOpenCustomArrowEditor
}: ArrowManagementPopupProps) {
  // Dragging state
  const [position, setPosition] = useState({ x: 700, y: 200 }); // Initial position (e.g., from top-left)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);

    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep popup within viewport bounds (adjust 320 and 100 based on your popup's approximate width and height)
    const popupWidth = popupRef.current?.offsetWidth || 320; // Default or calculated width
    const popupHeight = popupRef.current?.offsetHeight || 100; // Default or calculated height

    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - popupWidth));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - popupHeight));

    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragOffset]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);


  // const handleTypeChange = (type: Connection['type']) => {
  //   onChangeType(type);
  // };

  const handleCombinationChange = (arrowType?: string, pathStyle?: string, animated?: boolean) => {
    if (onChangeCombination) {
      onChangeCombination(arrowType, pathStyle, animated);
    } else {
      // Fallback to old system if combination handler not provided
      let type: Connection['type'] = 'default';

      if (animated) {
        type = 'animated';
      } else if (pathStyle === 'curve') {
        type = 'curve';
      } else if (pathStyle === 'curve-network') {
        type = 'curve-network';
      } else if (pathStyle === 'cubic-bezier') {
        type = 'cubic-bezier';
      } else if (pathStyle === 'square-rounded') {
        type = 'default'; // Use default type for square-rounded
      } else if (pathStyle === 'custom') {
        type = 'custom';
      } else if (arrowType === 'split') {
        type = 'split';
      } else if (arrowType === 'dotted') {
        type = 'dotted';
      }

      onChangeType(type);
    }
  };

  return (
    <div
      ref={popupRef}
      className={`arrow-management-popup ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed', // Ensure it's positioned relative to the viewport
        transform: 'none' // Override default transform if any
      }}
    >
      <div
        className="popup-header"
        onMouseDown={handleMouseDown} // Add mouse down listener to header
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }} // Change cursor
      >
          <h3>Arrow Management</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="popup-content">
        <div className="selection-info">
          <span className="selection-count">
            {selectedCount} of {totalCount} arrows selected
          </span>
        </div>

        <div className="action-section">
          <h4>Change Arrow Settings</h4>
          <div className="connection-settings-grid">
            {/* Column 1: Arrow Types */}
            <div className="settings-column">
              <label>Arrow Type:</label>
              <div className="option-buttons">
                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange('default', undefined, undefined)}
                  title="Default arrow"
                >
                  <span className="option-preview" style={{color: '#60A5FA'}}>━━→</span>
                  <span>Default</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange('split', undefined, undefined)}
                  title="Split line arrow"
                >
                  <span className="option-preview" style={{color: '#F59E0B'}}>╱╱→</span>
                  <span>Split Line</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange('dotted', undefined, undefined)}
                  title="Split dot arrow"
                >
                  <span className="option-preview" style={{color: '#a855f7'}}>···→</span>
                  <span>Split Dot</span>
                </button>
              </div>
            </div>

            {/* Column 2: Path Styles */}
            <div className="settings-column">
              <label>Path Style:</label>
              <div className="option-buttons">
                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, 'straight', undefined)}
                  title="Straight line"
                >
                  <span className="option-preview" style={{color: '#60A5FA'}}>━━→</span>
                  <span>Straight</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, 'curve', undefined)}
                  title="Curve line"
                >
                  <span className="option-preview curve-border" style={{color: '#8b5cf6'}}>⤴→</span>
                  <span>Curve</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, 'cubic-bezier', undefined)}
                  title="Cubic Bézier curve"
                >
                  <span className="option-preview" style={{color: '#10b981'}}>⤵→</span>
                  <span>Cubic Bézier</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, 'curve-network', undefined)}
                  title="Curve network like rainbow"
                >
                  <span className="option-preview rainbow" style={{color: '#06b6d4'}}>🌈→</span>
                  <span>Network</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, 'square-rounded', undefined)}
                  title="Square rounded path with rounded square in middle"
                >
                  <span className="option-preview" style={{color: '#f59e0b'}}>⬜→</span>
                  <span>Square</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() =>{
                    handleCombinationChange(undefined, 'custom', undefined); // Mark as custom internally
                    onOpenCustomArrowEditor(connection); // Open the editor for the current connection
                  }}
                  title="Custom arrow shapes with React Flow editor"
                >
                  <span className="option-preview" style={{color: '#f59e0b'}}>✨→</span>
                  <span>Custom</span>
                </button>
              </div>
            </div>

            {/* Column 3: Animation Toggle */}
            <div className="settings-column">
              <label>Animation:</label>
              <div className="option-buttons">
                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, undefined, false)}
                  title="Animation OFF"
                >
                  <span className="option-preview" style={{color: '#94a3b8'}}>━━→</span>
                  <span>OFF</span>
                </button>

                <button
                  className="option-btn"
                  onClick={() => handleCombinationChange(undefined, undefined, true)}
                  title="Animation ON"
                >
                  <span className="option-preview animated" style={{color: '#34D399'}}>╌╌→</span>
                  <span>ON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="action-section">
          <h4>Actions</h4>
          <div className="action-buttons">
            <button 
              className="action-btn clear-btn"
              onClick={onClearSelection}
              title="Clear selection"
            >
              🔄 Clear Selection
            </button>
            
            <button 
              className="action-btn delete-btn"
              onClick={onDeleteSelected}
              title="Delete selected arrows"
            >
              🗑️ Delete Selected ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
