interface BottomMenuProps {
  isArrowDrawMode: boolean;
  selectedConnectionIds?: string[];
  connectionsCount?: number;
  onToggleArrowDrawMode?: () => void;
  onShowArrowManagement?: () => void;
}

export function BottomMenu({
  isArrowDrawMode,
  selectedConnectionIds = [],
  connectionsCount = 0,
  onToggleArrowDrawMode,
  onShowArrowManagement
}: BottomMenuProps) {
  const selectedCount = selectedConnectionIds.length;

  return (
    <div className="bottom-menu-content">
      {/* Arrow Draw Mode Button */}
      <button
        className={`menu-btn arrow-draw-btn ${isArrowDrawMode ? 'active' : ''}`}
        onClick={onToggleArrowDrawMode}
        title={isArrowDrawMode ? "Stop drawing arrows" : "Start drawing arrows - Click nodes to connect them"}
      >
        {isArrowDrawMode ? '🎯' : '↗️'} {isArrowDrawMode ? 'Stop Drawing' : 'Draw Arrows'}
      </button>

      {/* Manage All Arrows Button */}
      <button
        className="menu-btn manage-arrows-btn"
        onClick={onShowArrowManagement}
        title="Manage all arrows - Select, modify, and delete connections"
        disabled={connectionsCount === 0}
      >
        🔗 Manage All ({connectionsCount})
        {selectedCount > 0 && (
          <span className="selection-badge">{selectedCount}</span>
        )}
      </button>
    </div>
  );
}
