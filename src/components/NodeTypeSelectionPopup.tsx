import { X } from 'lucide-react';
import { nodeTypes } from '../constants';

interface NodeTypeSelectionPopupProps {
  currentNodeType: string;
  onClose: () => void;
  onSelectNodeType: (nodeTypeId: string) => void;
}

export function NodeTypeSelectionPopup({
  currentNodeType,
  onClose,
  onSelectNodeType
}: NodeTypeSelectionPopupProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNodeTypeSelect = (nodeTypeId: string) => {
    onSelectNodeType(nodeTypeId);
    onClose();
  };

  return (
    <div className="node-type-selection-backdrop" onClick={handleBackdropClick}>
      <div className="node-type-selection-popup">
        <div className="popup-header">
          <h3>Select Node Type</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className="popup-content">
          <div className="node-types-grid">
            {nodeTypes.map(nodeType => (
              <div
                key={nodeType.id}
                className={`node-type-option ${currentNodeType === nodeType.id ? 'selected' : ''}`}
                onClick={() => handleNodeTypeSelect(nodeType.id)}
              >
                <div className="node-type-icon">
                  <img src={nodeType.icon} alt={nodeType.name} />
                </div>
                <div className="node-type-info">
                  <h4>{nodeType.name}</h4>
                  <p>{nodeType.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
