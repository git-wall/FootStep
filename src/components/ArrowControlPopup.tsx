import { X } from 'lucide-react';

interface ArrowControlPopupProps {
  isArrowDrawMode: boolean;
  selectedConnectionIds?: string[];
  connectionsCount?: number;
  onClose: () => void;
  onToggleArrowDrawMode?: () => void;
  onShowArrowManagement?: () => void;
  onDeleteSelectedArrows?: () => void;
  onClearArrowSelection?: () => void;
}

export function ArrowControlPopup({
  isArrowDrawMode,
  selectedConnectionIds = [],
  connectionsCount = 0,
  onClose,
  onToggleArrowDrawMode,
  onShowArrowManagement,
  onDeleteSelectedArrows,
  onClearArrowSelection
}: ArrowControlPopupProps) {
  const selectedCount = selectedConnectionIds.length;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="arrow-management-backdrop" onClick={handleBackdropClick}>
      <div className="arrow-control-popup">
        <div className="popup-header">
          <h3>Arrow Controls</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className="popup-content">
          <div className="info-section">
            <p>Control arrow drawing and manage existing connections.</p>
            {connectionsCount > 0 && (
              <p className="connection-count">
                📊 {connectionsCount} connection{connectionsCount > 1 ? 's' : ''} total
              </p>
            )}
          </div>

          <div className="action-section">
            <h4>Arrow Drawing</h4>
            <div className="control-buttons">
              <button
                className={`control-btn arrow-draw-btn ${isArrowDrawMode ? 'active' : ''}`}
                onClick={onToggleArrowDrawMode}
                title={isArrowDrawMode ? "Exit arrow drawing mode" : "Enter arrow drawing mode - Click nodes to connect them"}
              >
                {isArrowDrawMode ? '🎯' : '↗️'} {isArrowDrawMode ? 'Stop Drawing' : 'Start Drawing'}
              </button>
              
              {isArrowDrawMode && (
                <div className="draw-mode-info">
                  <small>✨ Click on nodes to connect them with arrows</small>
                </div>
              )}
            </div>

            <h4>Connection Management</h4>
            <div className="control-buttons">
              <button
                className="control-btn"
                onClick={onShowArrowManagement}
                title="Open advanced arrow management"
                disabled={connectionsCount === 0}
              >
                🔗 Manage All Arrows ({connectionsCount})
              </button>
              
              {selectedCount > 0 && (
                <>
                  <button
                    className="control-btn delete-btn"
                    onClick={onDeleteSelectedArrows}
                    title={`Delete ${selectedCount} selected arrow${selectedCount > 1 ? 's' : ''}`}
                  >
                    🗑️ Delete Selected ({selectedCount})
                  </button>
                  
                  <button
                    className="control-btn"
                    onClick={onClearArrowSelection}
                    title="Clear arrow selection"
                  >
                    ❌ Clear Selection
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={onClose} className="cancel-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
