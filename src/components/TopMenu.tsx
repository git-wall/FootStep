interface TopMenuProps {
  showAllProgressBars: boolean;
  showAllIpAddresses: boolean;
  isConnectMode: boolean;

  onDeleteNode?: (nodeId: string) => void;
  onAddText?: () => void;
  onCapture?: () => void;
  onToggleAllProgressBars?: () => void;
  onToggleAllIpAddresses?: () => void;
  onToggleNodeList?: () => void;
  onToggleConnectMode?: () => void;
  selectedNodeId?: string | null;
}

export function TopMenu({
  showAllProgressBars,
  showAllIpAddresses,
  isConnectMode,
  onDeleteNode,
  onAddText,
  onCapture,
  onToggleAllProgressBars,
  onToggleAllIpAddresses,
  onToggleNodeList,
  onToggleConnectMode,
  selectedNodeId
}: TopMenuProps) {
  return (
    <div className="top-menu-content">
      {/* All menu buttons in one row */}
      <button
        className={`menu-btn delete-btn ${!selectedNodeId ? 'disabled' : ''}`}
        onClick={() => selectedNodeId && onDeleteNode?.(selectedNodeId)}
        disabled={!selectedNodeId}
        title={selectedNodeId ? "Delete selected node" : "Select a node to delete"}
      >
        🗑️ Delete
      </button>



      <button
        className="menu-btn text-btn"
        onClick={onAddText}
        title="Add text label"
      >
        📝 Add Text
      </button>

      <button
        className="menu-btn capture-btn"
        onClick={onCapture}
        title="Capture canvas"
      >
        📷 Capture
      </button>









      <button
        className={`menu-btn progress-bars-btn ${showAllProgressBars ? 'active' : ''}`}
        onClick={onToggleAllProgressBars}
        title="Toggle progress bars for all nodes"
      >
        📊 Progress
      </button>

      <button
        className={`menu-btn ip-addresses-btn ${showAllIpAddresses ? 'active' : ''}`}
        onClick={onToggleAllIpAddresses}
        title="Toggle IP addresses for all nodes"
      >
        🌐 IP
      </button>

      <button
        className="menu-btn node-list-btn"
        onClick={onToggleNodeList}
        title="Show node list"
      >
        📋 Nodes
      </button>
    </div>
  );
}
