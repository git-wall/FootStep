import React, { useState, useRef, useCallback, useEffect } from 'react'; 
import { X, Trash2 } from 'lucide-react';
import type { Connection } from '../types';

interface ArrowPopupProps {
  connection: Connection;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: (connectionId: string) => void;
  onTypeChange: (connectionId: string, type: Connection['type'], arrowType?: string, pathStyle?: string, animated?: boolean) => void;
  onOpenCustomArrowEditor: (connection: Connection) => void;
}

interface ConnectionSettings {
  arrowType: 'default' | 'split' | 'dotted';
  pathStyle: 'straight' | 'curve' | 'curve-network' | 'cubic-bezier' | 'square-rounded' | 'custom';
  animated: boolean;
}

export function ArrowPopup({ connection, position, onClose, onDelete, onTypeChange, onOpenCustomArrowEditor }: ArrowPopupProps) {
  // Parse current connection to extract individual settings
  const getCurrentSettings = useCallback((): ConnectionSettings => {
    // Use extended properties if available, otherwise extract from type
    if (connection.arrowType && connection.pathStyle && connection.animated !== undefined) {
      return {
        arrowType: connection.arrowType,
        pathStyle: connection.pathStyle,
        animated: connection.animated
      };
    }

    // Fallback: Extract from connection type
    let settings: ConnectionSettings = {
      arrowType: 'default',
      pathStyle: 'straight',
      animated: false
    };

    switch (connection.type) {
      case 'animated':
        settings = { arrowType: 'split', pathStyle: 'straight', animated: true };
        break;
      case 'split':
        settings = { arrowType: 'split', pathStyle: 'straight', animated: false };
        break;
      case 'dotted':
        settings = { arrowType: 'dotted', pathStyle: 'straight', animated: false };
        break;
      case 'curve':
        settings = { arrowType: 'default', pathStyle: 'curve', animated: false };
        break;
      case 'curve-network':
        settings = { arrowType: 'default', pathStyle: 'curve-network', animated: false };
        break;
      case 'cubic-bezier':
        settings = { arrowType: 'default', pathStyle: 'cubic-bezier', animated: false };
        break;
      case 'custom':
        settings = { arrowType: 'default', pathStyle: 'custom', animated: false };
        break;
      default:
        settings = { arrowType: 'default', pathStyle: 'straight', animated: false };
    }

    return settings;
  }, [connection]); // Dependency on connection ensures settings update when connection object changes

  const [currentSettings, setCurrentSettings] = React.useState<ConnectionSettings>(getCurrentSettings());

  // Dragging state
  const [dragPosition, setDragPosition] = useState(position); // Use the initial prop position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Update local state when connection changes or position prop changes
  useEffect(() => {
    setCurrentSettings(getCurrentSettings());
    setDragPosition(position); // Update dragPosition if the prop changes
  }, [connection, position, getCurrentSettings]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault(); // Prevent text selection
  }, []);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep popup within viewport bounds
    const popupWidth = popupRef.current?.offsetWidth || 320; // Approx. popup width
    const popupHeight = popupRef.current?.offsetHeight || 400; // Approx. popup height

    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - popupWidth));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - popupHeight));

    setDragPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragOffset]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners for dragging
  useEffect(() => {
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

  // Update local state when connection changes
  // React.useEffect(() => {
  //   setCurrentSettings(getCurrentSettings());
  // }, [connection.type, connection.arrowType, connection.pathStyle, connection.animated]);

  // Update settings and apply combined CSS
  const handleSettingsChange = (newArrowType?: string, newPathStyle?: string, newAnimated?: boolean) => {
    // Get current settings first to ensure we have the latest state
    const current = getCurrentSettings();

    const updatedSettings: ConnectionSettings = {
      arrowType: (newArrowType as ConnectionSettings['arrowType']) || current.arrowType,
      pathStyle: (newPathStyle as ConnectionSettings['pathStyle']) || current.pathStyle,
      animated: newAnimated !== undefined ? newAnimated : current.animated
    };

    setCurrentSettings(updatedSettings);

    // Create combined connection type based on settings
    let combinedType: Connection['type'] = 'default';

    // Map combinations to existing connection types
    // Priority: Animation > Path Style > Arrow Type
    if (updatedSettings.animated && updatedSettings.arrowType !== 'default') {
      // Animated split types (regardless of path)
      combinedType = 'animated';
    } else if (updatedSettings.pathStyle === 'curve') {
      // Curve paths (any arrow type)
      combinedType = 'curve';
    } else if (updatedSettings.pathStyle === 'curve-network') {
      // Network paths (any arrow type)
      combinedType = 'curve-network';
    } else if (updatedSettings.pathStyle === 'cubic-bezier') {
      // Cubic Bézier paths (any arrow type)
      combinedType = 'cubic-bezier';
    } else if (updatedSettings.pathStyle === 'custom') {
      // Custom paths (any arrow type)
      combinedType = 'custom';
    } else if (updatedSettings.arrowType === 'split') {
      // Split straight lines
      combinedType = 'split';
    } else if (updatedSettings.arrowType === 'dotted') {
      // Dotted straight lines
      combinedType = 'dotted';
    } else {
      // Default straight lines
      combinedType = 'default';
    }

    onTypeChange(connection.id, combinedType, updatedSettings.arrowType, updatedSettings.pathStyle, updatedSettings.animated);
  };

  const handleDelete = () => {
    onDelete(connection.id);
    onClose();
  };



  return (
    <div 
      ref={popupRef}
      className={`arrow-popup ${isDragging ? 'dragging' : ''}`}
      style={{
        left: dragPosition.x,
        top: dragPosition.y,
        position: 'fixed', // Ensure it's positioned relative to the viewport
        transform: 'none' // Override default transform if any
      }}
    >
      <div
        className="popup-header"
        onMouseDown={handleMouseDown} // Add mouse down listener to header
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }} // Change cursor
      >
        <h4>Connection Settings</h4>
        <button onClick={onClose} className="close-button">
          <X size={16} />
        </button>
      </div>
      
      <div className="popup-content">
        <div className="connection-settings-grid">
          {/* Column 1: Arrow Types */}
          <div className="settings-column">
            <label>Arrow Type:</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${currentSettings.arrowType === 'default' ? 'active' : ''}`}
                onClick={() => handleSettingsChange('default')}
              >
                <span className="option-preview" style={{color: '#60A5FA'}}>━━→</span>
                <span>Default</span>
              </button>

              <button
                className={`option-btn ${currentSettings.arrowType === 'split' ? 'active' : ''}`}
                onClick={() => handleSettingsChange('split')}
              >
                <span className="option-preview" style={{color: '#F59E0B'}}>╱╱→</span>
                <span>Split Line</span>
              </button>

              <button
                className={`option-btn ${currentSettings.arrowType === 'dotted' ? 'active' : ''}`}
                onClick={() => handleSettingsChange('dotted')}
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
                className={`option-btn ${currentSettings.pathStyle === 'straight' ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, 'straight')}
              >
                <span className="option-preview" style={{color: '#60A5FA'}}>━━→</span>
                <span>Straight</span>
              </button>

              <button
                className={`option-btn ${currentSettings.pathStyle === 'curve' ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, 'curve')}
              >
                <span className="option-preview curve-border" style={{color: '#8b5cf6'}}>⤴→</span>
                <span>Curve</span>
              </button>

              <button
                className={`option-btn ${currentSettings.pathStyle === 'curve-network' ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, 'curve-network')}
              >
                <span className="option-preview rainbow" style={{color: '#06b6d4'}}>🌈→</span>
                <span>Network</span>
              </button>

              <button
                className={`option-btn ${currentSettings.pathStyle === 'cubic-bezier' ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, 'cubic-bezier')}
              >
                <span className="option-preview" style={{color: '#10b981'}}>⤵→</span>
                <span>Cubic Bézier</span>
              </button>

              <button
                className={`option-btn ${currentSettings.pathStyle === 'square-rounded' ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, 'square-rounded')}
              >
                <span className="option-preview" style={{color: '#f59e0b'}}>⬜→</span>
                <span>Square</span>
              </button>

              <button
                className={`option-btn ${currentSettings.pathStyle === 'custom' ? 'active' : ''}`}
                onClick={() => onOpenCustomArrowEditor(connection)}
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
                className={`option-btn ${!currentSettings.animated ? 'active' : ''}`}
                onClick={() => handleSettingsChange(undefined, undefined, false)}
              >
                <span className="option-preview" style={{color: '#94a3b8'}}>━━→</span>
                <span>OFF</span>
              </button>

              <button
                className={`option-btn ${currentSettings.animated ? 'active' : ''} ${currentSettings.arrowType === 'default' ? 'disabled' : ''}`}
                onClick={() => currentSettings.arrowType !== 'default' && handleSettingsChange(undefined, undefined, true)}
                disabled={currentSettings.arrowType === 'default'}
                title={currentSettings.arrowType === 'default' ? 'Animation not available for default lines' : 'Enable animation'}
              >
                <span className="option-preview animated" style={{color: currentSettings.arrowType === 'default' ? '#6b7280' : '#34D399'}}>╌╌→</span>
                <span>ON</span>
              </button>
            </div>
            {currentSettings.arrowType === 'default' && (
              <div className="animation-note">
                <small style={{color: '#94a3b8', fontSize: '10px'}}>
                  ⚠️ Animation only works with Split types
                </small>
              </div>
            )}
          </div>
        </div>
        
        <div className="popup-actions">
          <button onClick={handleDelete} className="delete-button">
            <Trash2 size={16} />
            Delete Connection
          </button>
        </div>
      </div>

    </div>
  );
}
