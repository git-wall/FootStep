import { X } from 'lucide-react';
import type { Node } from '../types';
import { technologies } from '../constants';

interface NodeListPopupProps {
  nodes: Node[];
  onClose: () => void;
  onCenterNode: (nodeId: string) => void;
}

export function NodeListPopup({ nodes, onClose, onCenterNode }: NodeListPopupProps) {
  const handleNodeClick = (nodeId: string) => {
    onCenterNode(nodeId);
  };

  const getTechnologyInfo = (technologyId: string) => {
    return technologies.find(tech => tech.id === technologyId);
  };

  return (
    <div className="node-list-popup-overlay" onClick={onClose}>
      <div className="node-list-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Canvas Nodes ({nodes.length})</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="popup-content">
          {nodes.length === 0 ? (
            <div className="empty-state">
              <p>No nodes in canvas</p>
              <span>Drag technologies from the sidebar to add nodes</span>
            </div>
          ) : (
            <div className="node-list">
              {nodes.map(node => {
                const tech = getTechnologyInfo(node.technologyId);
                return (
                  <div
                    key={node.id}
                    className="node-item"
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div className="node-item-icon" style={{ backgroundColor: tech?.color || '#6B7280' }}>
                      <div className="tech-icon-text">
                        {tech?.icon || tech?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                    
                    <div className="node-item-info">
                      <div className="node-item-title">{node.title}</div>
                      <div className="node-item-details">
                        <span className="tech-name">{tech?.name}</span>
                        {node.ip && (
                          <span className="node-ip-badge">{node.ip}</span>
                        )}
                      </div>
                      {(node.cpu !== undefined || node.memory !== undefined) && (
                        <div className="node-item-stats">
                          {node.cpu !== undefined && (
                            <span className="stat cpu">CPU: {node.cpu}%</span>
                          )}
                          {node.memory !== undefined && (
                            <span className="stat memory">Memory: {node.memory}%</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="node-item-position">
                      <span>({Math.round(node.position.x)}, {Math.round(node.position.y)})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
