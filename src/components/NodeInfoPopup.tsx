import React, { useState, useRef, useCallback } from 'react';
import type { Node } from '../types';
import { technologies, nodeTypes } from '../constants';
import { NodeTypeSelectionPopup } from './NodeTypeSelectionPopup';

interface NodeInfoPopupProps {
  node: Node;
  onClose: () => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<Node>) => void;
}

export function NodeInfoPopup({ node, onClose, onNodeUpdate }: NodeInfoPopupProps) {
  console.log('NodeInfoPopup rendered with node:', node); // Debug log
  const technology = technologies.find(tech => tech.id === node.technologyId);

  // Technology search state
  const [technologySearch, setTechnologySearch] = useState(technology?.name || '');
  const [showTechnologyDropdown, setShowTechnologyDropdown] = useState(false);
  const [filteredTechnologies, setFilteredTechnologies] = useState(technologies);

  // Node type selection state
  const [showNodeTypeSelection, setShowNodeTypeSelection] = useState(false);

  // Auto-save editable state (like draw.io)
  const [editedNode, setEditedNode] = useState<Partial<Node>>({
    title: node.title,
    status: node.status,
    environment: node.environment,
    nodeType: node.nodeType,
    cpu: node.cpu,
    memory: node.memory,
    storage: node.storage,
    ip: node.ip,
    port: node.port,
    hostname: node.hostname,
    description: node.description
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Sync editedNode with node prop when node changes from outside
  React.useEffect(() => {
    setEditedNode({
      title: node.title,
      status: node.status,
      environment: node.environment,
      nodeType: node.nodeType,
      cpu: node.cpu,
      memory: node.memory,
      storage: node.storage,
      ip: node.ip,
      port: node.port,
      hostname: node.hostname,
      description: node.description
    });

    // Sync technology search with current technology
    const currentTech = technologies.find(tech => tech.id === node.technologyId);
    setTechnologySearch(currentTech?.name || '');

    setHasChanges(false);
  }, [node.id]); // Only sync when node ID changes (new node)

  // Dragging state
  const [position, setPosition] = useState({ x: 20, y: 50 }); // Initial position from right edge
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

    const newX = window.innerWidth - (e.clientX - dragOffset.x + 320); // 320 is popup width
    const newY = e.clientY - dragOffset.y;

    // Keep popup within viewport bounds
    const boundedX = Math.max(20, Math.min(newX, window.innerWidth - 340));
    const boundedY = Math.max(20, Math.min(newY, window.innerHeight - 100));

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

  // Auto-save on blur for inputs
  const handleAutoSave = useCallback(() => {
    console.log('Auto-save triggered, hasChanges:', hasChanges, 'editedNode:', editedNode); // Debug log
    if (hasChanges && onNodeUpdate) {
      try {
        // Filter out undefined/null values to prevent node corruption
        // IMPORTANT: Never overwrite critical fields like technologyId, id, position
        const validUpdates: Partial<Node> = {};
        Object.entries(editedNode).forEach(([key, value]) => {
          // Skip critical fields that should never be overwritten
          if (key === 'technologyId' || key === 'id' || key === 'position') {
            return;
          }

          // Allow empty strings for important fields like title
          const allowEmptyFields = ['title', 'description', 'hostname', 'ip'];
          const isValidValue = value !== undefined && value !== null &&
            (allowEmptyFields.includes(key) || value !== '');

          if (isValidValue) {
            (validUpdates as any)[key] = value;
          }
        });

        console.log('Filtered updates:', validUpdates); // Debug log
        onNodeUpdate(node.id, validUpdates);
        setHasChanges(false);
        console.log('Auto-save successful'); // Debug log
      } catch (error) {
        console.error('Auto-save failed:', error); // Debug log
      }
    }
  }, [hasChanges, node.id, editedNode, onNodeUpdate]);

  // Handle technology search
  const handleTechnologySearch = useCallback((searchValue: string) => {
    setTechnologySearch(searchValue);

    // Filter technologies based on search
    const filtered = technologies.filter(tech =>
      tech.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      tech.category.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredTechnologies(filtered);
    setShowTechnologyDropdown(searchValue.length > 0 && filtered.length > 0);
  }, []);

  // Handle technology selection from dropdown
  const handleTechnologySelect = useCallback((selectedTech: typeof technologies[0]) => {
    setTechnologySearch(selectedTech.name);
    setShowTechnologyDropdown(false);

    // Update node with new technology
    if (onNodeUpdate) {
      onNodeUpdate(node.id, { technologyId: selectedTech.id });
    }

    console.log('Technology selected:', selectedTech); // Debug log
  }, [node.id, onNodeUpdate]);

  // Handle node type selection
  const handleNodeTypeSelect = useCallback((nodeTypeId: string) => {
    setEditedNode(prev => ({ ...prev, nodeType: nodeTypeId }));
    setHasChanges(true);

    // Update node with new type
    if (onNodeUpdate) {
      onNodeUpdate(node.id, { nodeType: nodeTypeId });
    }

    console.log('Node type selected:', nodeTypeId); // Debug log
  }, [node.id, onNodeUpdate]);

  // Auto-save logic (like draw.io)
  const handleInputChange = useCallback((field: keyof Node, value: unknown) => {
    console.log('Input changed:', field, value); // Debug log
    setEditedNode(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // Auto-save when clicking outside popup
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as HTMLElement)) {
      if (hasChanges && onNodeUpdate) {
        // Filter out undefined/null values to prevent node corruption
        // IMPORTANT: Never overwrite critical fields like technologyId, id, position
        const validUpdates: Partial<Node> = {};
        Object.entries(editedNode).forEach(([key, value]) => {
          // Skip critical fields that should never be overwritten
          if (key === 'technologyId' || key === 'id' || key === 'position') {
            return;
          }

          // Allow empty strings for important fields like title
          const allowEmptyFields = ['title', 'description', 'hostname', 'ip'];
          const isValidValue = value !== undefined && value !== null &&
            (allowEmptyFields.includes(key) || value !== '');

          if (isValidValue) {
            (validUpdates as any)[key] = value;
          }
        });

        console.log('Click outside - filtered updates:', validUpdates); // Debug log
        onNodeUpdate(node.id, validUpdates);
        setHasChanges(false);
      }
    }
  }, [hasChanges, node.id, editedNode, onNodeUpdate]);

  // Add click outside listener for auto-save
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      ref={popupRef}
      className={`node-info-popup ${isDragging ? 'dragging' : ''}`}
      style={{
        right: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'none' // Override default transform
      }}
    >
      <div
        className="node-info-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="header-content">
          <div className="drag-indicator">⋮⋮</div>
          <h3>Node Information</h3>
          {hasChanges && <span className="changes-indicator">●</span>}
        </div>
        <div className="header-actions">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>
      
      <div className="node-info-content">
        {/* Node Icon */}
        <div
          className="node-info-icon"
          style={{
            background: technology?.color || 'rgba(51, 65, 85, 0.5)',
            borderColor: 'white' // Always white border
          }}
        >
          {technology ? (
            technology.iconUrl ? (
              <img src={technology.iconUrl} alt={technology.name} />
            ) : (
              <span className="icon-text">{technology.icon}</span>
            )
          ) : (
            <div className="default-icon">📦</div>
          )}
        </div>

        {/* Node Type Section */}
        <div className="node-type-section">
          <h4>Node Type</h4>
          <div
            className="node-type-selector"
            onClick={() => setShowNodeTypeSelection(true)}
          >
            <div className="current-node-type">
              <img
                src={nodeTypes.find(nt => nt.id === (editedNode.nodeType || node.nodeType || 'cube'))?.icon || nodeTypes[0].icon}
                alt="Current node type"
              />
              <span>{nodeTypes.find(nt => nt.id === (editedNode.nodeType || node.nodeType || 'cube'))?.name || 'Cube'}</span>
            </div>
            <span className="change-hint">Click to change</span>
          </div>
        </div>

        {/* Node Details */}
        <div className="node-info-details">
          {/* Basic Information */}
          <div className="info-section">
            <h4>Basic Information</h4>
            <div className="info-group">
              <label>Name:</label>
              <input
                type="text"
                value={editedNode.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-input"
                placeholder="Enter node name..."
              />
            </div>

            <div className="info-group technology-search-group">
              <label>Technology:</label>
              <div className="technology-search-container">
                <input
                  type="text"
                  value={technologySearch}
                  onChange={(e) => handleTechnologySearch(e.target.value)}
                  onFocus={() => setShowTechnologyDropdown(filteredTechnologies.length > 0)}
                  onBlur={() => setTimeout(() => setShowTechnologyDropdown(false), 200)}
                  className="edit-input technology-search-input"
                  placeholder="Search technologies..."
                />

                {showTechnologyDropdown && (
                  <div className="technology-dropdown">
                    {filteredTechnologies.slice(0, 10).map((tech) => (
                      <div
                        key={tech.id}
                        className="technology-option"
                        onClick={() => handleTechnologySelect(tech)}
                      >
                        <div className="tech-option-icon">
                          {tech.iconUrl ? (
                            <img src={tech.iconUrl} alt={tech.name} />
                          ) : (
                            <span className="icon-text">{tech.icon}</span>
                          )}
                        </div>
                        <div className="tech-option-info">
                          <span className="tech-name">{tech.name}</span>
                          <span className="tech-category">{tech.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="info-group">
              <label>Status:</label>
              <select
                value={editedNode.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-select"
              >
                <option value="">Select status</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="info-group">
              <label>Environment:</label>
              <select
                value={editedNode.environment || ''}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-select"
              >
                <option value="">Select environment</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>


          </div>

          {/* System Information */}
          <div className="info-section">
            <h4>System Information</h4>
            <div className="info-group">
              <label>Position:</label>
              <span>X: {Math.round(node.position.x)}, Y: {Math.round(node.position.y)}</span>
            </div>

            <div className="info-group">
              <label>CPU Cores:</label>
              <input
                type="number"
                value={editedNode.cpu || ''}
                onChange={(e) => handleInputChange('cpu', parseInt(e.target.value) || undefined)}
                onBlur={handleAutoSave}
                className="edit-input"
                min="1"
                max="64"
                placeholder="Enter CPU cores..."
              />
            </div>

            <div className="info-group">
              <label>Memory (GB):</label>
              <input
                type="number"
                value={editedNode.memory || ''}
                onChange={(e) => handleInputChange('memory', parseInt(e.target.value) || undefined)}
                onBlur={handleAutoSave}
                className="edit-input"
                min="1"
                max="1024"
                placeholder="Enter memory in GB..."
              />
            </div>

            <div className="info-group">
              <label>Storage (GB):</label>
              <input
                type="number"
                value={editedNode.storage || ''}
                onChange={(e) => handleInputChange('storage', parseInt(e.target.value) || undefined)}
                onBlur={handleAutoSave}
                className="edit-input"
                min="1"
                max="10000"
                placeholder="Enter storage in GB..."
              />
            </div>

            <div className="info-group">
              <label>IP Address:</label>
              <input
                type="text"
                value={editedNode.ip || ''}
                onChange={(e) => handleInputChange('ip', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-input"
                placeholder="192.168.1.1"
              />
            </div>

            <div className="info-group">
              <label>Port:</label>
              <input
                type="number"
                value={editedNode.port || ''}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || undefined)}
                onBlur={handleAutoSave}
                className="edit-input"
                min="1"
                max="65535"
                placeholder="Enter port number..."
              />
            </div>

            <div className="info-group">
              <label>Hostname:</label>
              <input
                type="text"
                value={editedNode.hostname || ''}
                onChange={(e) => handleInputChange('hostname', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-input"
                placeholder="server-name"
              />
            </div>
          </div>



          {/* Infrastructure */}
          {(node.region || node.zone || node.cluster || node.namespace) && (
            <div className="info-section">
              <h4>Infrastructure</h4>

              {node.region && (
                <div className="info-group">
                  <label>Region:</label>
                  <span>{node.region}</span>
                </div>
              )}

              {node.zone && (
                <div className="info-group">
                  <label>Zone:</label>
                  <span>{node.zone}</span>
                </div>
              )}

              {node.cluster && (
                <div className="info-group">
                  <label>Cluster:</label>
                  <span>{node.cluster}</span>
                </div>
              )}

              {node.namespace && (
                <div className="info-group">
                  <label>Namespace:</label>
                  <span>{node.namespace}</span>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="info-section">
            <h4>Metadata</h4>

            <div className="info-group">
              <label>Node ID:</label>
              <span className="node-id">{node.id}</span>
            </div>

            <div className="info-group">
              <label>Description:</label>
              <textarea
                value={editedNode.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={handleAutoSave}
                className="edit-textarea"
                placeholder="Enter description..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Node Type Selection Popup */}
      {showNodeTypeSelection && (
        <NodeTypeSelectionPopup
          currentNodeType={editedNode.nodeType || node.nodeType || 'cube'}
          onClose={() => setShowNodeTypeSelection(false)}
          onSelectNodeType={handleNodeTypeSelect}
        />
      )}
    </div>
  );
}
