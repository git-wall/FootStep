import { Trash2, ArrowRight, Type, Camera } from 'lucide-react';

interface NodeToolbarProps {
  nodeId: string;
  onDelete: (nodeId: string) => void;
  onConnect: (nodeId: string) => void;
  onAddText: () => void;
  onCapture: () => void;
  onClose: () => void;
}

export function NodeToolbar({ 
  nodeId, 
  onDelete, 
  onConnect, 
  onAddText, 
  onCapture, 
  onClose 
}: NodeToolbarProps) {
  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };

  const handleConnect = () => {
    onConnect(nodeId);
    onClose();
  };

  const handleAddText = () => {
    onAddText();
    onClose();
  };

  const handleCapture = () => {
    onCapture();
    onClose();
  };

  return (
    <div className="node-toolbar">
      <div className="toolbar-content">
        <button 
          className="toolbar-button delete-btn"
          onClick={handleDelete}
          title="Delete Node"
        >
          <Trash2 size={16} />
        </button>
        
        <button 
          className="toolbar-button connect-btn"
          onClick={handleConnect}
          title="Connect to Another Node"
        >
          <ArrowRight size={16} />
        </button>
        
        <button 
          className="toolbar-button text-btn"
          onClick={handleAddText}
          title="Add Text"
        >
          <Type size={16} />
        </button>
        
        <button 
          className="toolbar-button capture-btn"
          onClick={handleCapture}
          title="Capture Canvas"
        >
          <Camera size={16} />
        </button>
      </div>
      
      {/* Close overlay */}
      <div className="toolbar-overlay" onClick={onClose}></div>
    </div>
  );
}
