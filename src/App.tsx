import { useState, useCallback, useEffect } from 'react';
import { DndContext, DragOverlay, useDroppable, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import html2canvas from 'html2canvas';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { TechnologyPanel } from './components/TechnologyPanel';
import { Canvas } from './components/Canvas';
import { TopMenu } from './components/TopMenu';
import { BottomMenu } from './components/BottomMenu';
import { NodeListPopup } from './components/NodeListPopup';
import { TextLabelComponent } from './components/TextLabel';
import { ArrowManagementPopup } from './components/ArrowManagementPopup';
import { CustomArrowEditor } from './components/CustomArrowEditor';

import { KonvaSelectionLayer } from './components/KonvaSelectionLayer';
import { NodeInfoPopup } from './components/NodeInfoPopup';

// import { DebugPanel } from './components/DebugPanel';
import type { Node, Connection, Technology, ArrowPopupData, TextLabel } from './types';
import { technologies } from './constants';

interface ImportJsonData {
  nodes?: Array<{
    name: string;
    technology?: string;
    position?: { x: number; y: number };
  }>;
  connections?: Array<{
    from: string;
    to: string;
  }>;
}
import './App.css';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [showArrowManagementPopup, setShowArrowManagementPopup] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);


  const [showAllProgressBars, setShowAllProgressBars] = useState(false);
  const [showAllIpAddresses, setShowAllIpAddresses] = useState(false);
  const [showNodeListPopup, setShowNodeListPopup] = useState(false);
  const [nodeInfoPopup, setNodeInfoPopup] = useState<Node | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [arrowPopup, setArrowPopup] = useState<ArrowPopupData | null>(null);
  const [showCustomArrowEditor, setShowCustomArrowEditor] = useState(false);
  const [customArrowConnection, setCustomArrowConnection] = useState<Connection | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [isArrowDrawMode, setIsArrowDrawMode] = useState(false);

  const [textLabels, setTextLabels] = useState<TextLabel[]>([]);
  const [selectedTextLabelId, setSelectedTextLabelId] = useState<string | null>(null);
  const [draggedTextLabel, setDraggedTextLabel] = useState<TextLabel | null>(null);


  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<Technology | null>(null);
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlayOffset, setOverlayOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomLevel = 1; // Fixed zoom level - no zoom controls
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 2000, height: 1500 });
  const defaultCanvasSize = { width: 2000, height: 1500 }; // Original default size
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 11);



  // COMPLETELY REBUILT: Unified Auto-Scaling System
  useEffect(() => {
    // Only reset to default when no nodes
    if (nodes.length === 0) {
      setCanvasSize(defaultCanvasSize);
      return;
    }

    // DISABLED: Auto-shrinking moved to dedicated function to prevent conflicts
    // All auto-scaling now happens in handleMouseMove during dragging
  }, [nodes.length, defaultCanvasSize]);

  // Handle selection from Konva selection layer
  const handleSelectionComplete = useCallback((selectedNodeIds: string[], selectedConnectionIds: string[]) => {
    if (selectedNodeIds.length > 0) {
      setIsMultiSelectMode(true);
      setSelectedNodeIds(selectedNodeIds);
      setSelectedConnectionIds(selectedConnectionIds);
      setSelectedNodeId(null);
    }
  }, []);

  // FIXED: Group movement with unified auto-scaling
  const handleNodesMove = useCallback((nodeIds: string[], deltaX: number, deltaY: number) => {
    // Use the same auto-scaling logic as single node movement
    setNodes(prev => prev.map(node => {
      if (nodeIds.includes(node.id)) {
        const newX = node.position.x + deltaX;
        const newY = node.position.y + deltaY;

        // Apply the same edge constraints as single node movement
        return {
          ...node,
          position: {
            x: Math.max(50, newX), // Consistent edge threshold
            y: Math.max(50, newY)
          }
        };
      }
      return node;
    }));
  }, []);



  const addNode = useCallback((technology: Technology, position: { x: number; y: number }) => {
    // Generate rich sample data based on technology type
    const generateRichSampleData = () => {
      const isServerTech = ['node', 'express', 'nginx', 'apache', 'docker', 'kubernetes', 'redis', 'mongodb', 'postgresql', 'mysql'].includes(technology.id);
      const isCloudTech = ['aws', 'azure', 'gcp', 'vercel', 'netlify'].includes(technology.id);
      const isFrontendTech = ['react', 'vue', 'angular', 'svelte', 'nextjs'].includes(technology.id);
      const isDatabaseTech = ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'].includes(technology.id);

      // Determine appropriate node type based on technology
      const getNodeType = () => {
        if (isDatabaseTech) return 'database';
        if (isServerTech && !isDatabaseTech) return 'service';
        if (isCloudTech) return 'device';
        if (isFrontendTech) return 'service';
        return 'cube'; // default
      };

      // Base data
      const environments = ['development', 'staging', 'production'] as const;
      const statuses = ['running', 'stopped', 'error', 'pending'] as const;
      const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
      const teams = ['frontend', 'backend', 'devops', 'data', 'platform'];
      const owners = ['john.doe', 'jane.smith', 'mike.wilson', 'sarah.chen', 'alex.brown'];

      // Generate realistic data based on tech type
      if (isServerTech || isCloudTech) {
        return {
          // System specs
          cpu: Math.floor(Math.random() * 8) + 2, // 2-10 cores
          memory: [4, 8, 16, 32, 64][Math.floor(Math.random() * 5)], // Common memory sizes
          storage: [50, 100, 250, 500, 1000][Math.floor(Math.random() * 5)], // GB

          // Network
          ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: isServerTech ? [3000, 8080, 9000, 5432, 6379][Math.floor(Math.random() * 5)] : undefined,
          hostname: `${technology.id}-${Math.random().toString(36).substr(2, 6)}`,

          // Performance
          cpuUsage: Math.floor(Math.random() * 80) + 10, // 10-90%
          memoryUsage: Math.floor(Math.random() * 70) + 15, // 15-85%
          responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms

          // Service info
          status: statuses[Math.floor(Math.random() * statuses.length)],

          // Infrastructure
          environment: environments[Math.floor(Math.random() * environments.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,
          cluster: `cluster-${Math.floor(Math.random() * 5) + 1}`,
          namespace: ['default', 'production', 'staging', 'development'][Math.floor(Math.random() * 4)],

          // Metadata
          tags: [
            technology.name.toLowerCase(),
            isServerTech ? 'backend' : 'cloud',
            environments[Math.floor(Math.random() * environments.length)]
          ],
          team: teams[Math.floor(Math.random() * teams.length)],
          owner: owners[Math.floor(Math.random() * owners.length)]
        };
      } else if (isFrontendTech) {
        return {
          // Lighter specs for frontend
          cpu: Math.floor(Math.random() * 4) + 1, // 1-4 cores
          memory: [2, 4, 8][Math.floor(Math.random() * 3)], // Smaller memory
          storage: [20, 50, 100][Math.floor(Math.random() * 3)], // GB

          // Network (some frontend apps have IPs)
          ip: Math.random() > 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
          port: [3000, 3001, 8080, 4200][Math.floor(Math.random() * 4)],
          hostname: `${technology.id}-app-${Math.random().toString(36).substr(2, 4)}`,

          // Performance
          cpuUsage: Math.floor(Math.random() * 40) + 5, // 5-45% (lower for frontend)
          memoryUsage: Math.floor(Math.random() * 50) + 10, // 10-60%
          responseTime: Math.floor(Math.random() * 100) + 20, // 20-120ms

          // Service info
          status: statuses[Math.floor(Math.random() * statuses.length)],

          // Infrastructure
          environment: environments[Math.floor(Math.random() * environments.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,

          // Metadata
          tags: [
            technology.name.toLowerCase(),
            'frontend',
            'web-app'
          ],
          team: 'frontend',
          owner: owners[Math.floor(Math.random() * owners.length)]
        };
      } else if (isDatabaseTech) {
        return {
          // Database specs
          cpu: Math.floor(Math.random() * 16) + 4, // 4-20 cores
          memory: [8, 16, 32, 64, 128][Math.floor(Math.random() * 5)], // Large memory
          storage: [100, 500, 1000, 2000, 5000][Math.floor(Math.random() * 5)], // GB

          // Network
          ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: technology.id === 'postgresql' ? 5432 : technology.id === 'mysql' ? 3306 : technology.id === 'redis' ? 6379 : 27017,
          hostname: `${technology.id}-db-${Math.random().toString(36).substr(2, 6)}`,

          // Performance
          cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
          memoryUsage: Math.floor(Math.random() * 80) + 10, // 10-90%
          responseTime: Math.floor(Math.random() * 50) + 5, // 5-55ms

          // Service info
          status: statuses[Math.floor(Math.random() * statuses.length)],

          // Infrastructure
          environment: environments[Math.floor(Math.random() * environments.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,
          cluster: `db-cluster-${Math.floor(Math.random() * 3) + 1}`,
          namespace: 'database',

          // Metadata
          tags: [
            technology.name.toLowerCase(),
            'database',
            'persistent-storage'
          ],
          team: 'data',
          owner: owners[Math.floor(Math.random() * owners.length)]
        };
      } else {
        // Generic technology
        return {
          cpu: Math.floor(Math.random() * 4) + 1,
          memory: [2, 4, 8][Math.floor(Math.random() * 3)],
          storage: [20, 50, 100][Math.floor(Math.random() * 3)],

          status: statuses[Math.floor(Math.random() * statuses.length)],
          environment: environments[Math.floor(Math.random() * environments.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,

          tags: [technology.name.toLowerCase()],
          team: teams[Math.floor(Math.random() * teams.length)],
          owner: owners[Math.floor(Math.random() * owners.length)]
        };
      }
    };

    const sampleData = generateRichSampleData();

    const newNode: Node = {
      id: generateId(),
      technologyId: technology.id,
      position,
      title: technology.name,

      // System Information
      cpu: sampleData.cpu,
      memory: sampleData.memory,
      storage: sampleData.storage,
      ip: sampleData.ip,
      port: sampleData.port,
      hostname: sampleData.hostname,

      // Service Information
      status: sampleData.status,

      // Performance Metrics
      cpuUsage: sampleData.cpuUsage,
      memoryUsage: sampleData.memoryUsage,

      // Infrastructure
      environment: sampleData.environment,
      region: sampleData.region,
      zone: sampleData.zone,
      cluster: sampleData.cluster,
      namespace: sampleData.namespace,

      // Metadata
      description: `${technology.name} service running in ${sampleData.environment} environment`,

      // Legacy compatibility
      technology: technology.name,
      ipAddress: sampleData.ip
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Don't create nodes when Space is pressed (pan mode)
    if (isSpacePressed) {
      setActiveDragItem(null);
      setOverlayOffset({ x: 0, y: 0 });
      return;
    }

    // Check if we're dropping on the canvas or anywhere in the main content area
    if (active.data.current?.technology) {
      const technology = active.data.current.technology as Technology;

      // Only create node if dropped on valid target (not when Space is pressed or invalid drop)
      if (over && (over.id === 'canvas' || over.id === 'main-content')) {
        const canvasElement = document.querySelector('.main-content .canvas') as HTMLElement;
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();

          // Use the current mouse position for accurate drop location
          let dropX = 100; // Default position
          let dropY = 100;

          // Use the tracked mouse position for accurate drop location
          dropX = lastMousePosition.x - canvasRect.left - 80; // Center the node (node width/2)
          dropY = lastMousePosition.y - canvasRect.top - 50;  // Center the node (node height/2)

          // FIXED: Allow dropping in ALL 4 directions (including left/top expansion)
          const finalPosition = {
            x: dropX, // Allow negative X for left expansion
            y: dropY  // Allow negative Y for top expansion
          };

          addNode(technology, finalPosition);
        }
      }
    }

    setActiveDragItem(null);
    setOverlayOffset({ x: 0, y: 0 });
    setIsDragOver(false); // FIXED: Reset drag-over state after drop
  }, [addNode, lastMousePosition, isSpacePressed]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setIsDragOver(over?.id === 'canvas');
  }, []);

  const handleEndConnection = useCallback((fromNodeId: string, toNodeId: string) => {
    const newConnection: Connection = {
      id: generateId(),
      fromNodeId,
      toNodeId,
      type: 'default'
    };
    setConnections(prev => [...prev, newConnection]);
    setConnectingFromNodeId(null);
  }, []);

  const handleNodeSelect = useCallback((nodeId: string | null, event?: React.MouseEvent) => {
    console.log('handleNodeSelect called with:', nodeId); // Debug log
    // Don't select nodes when Space is pressed (pan mode)
    if (isSpacePressed) return;

    // Handle connect mode
    if (isConnectMode && nodeId) {
      if (connectingFromNodeId) {
        // Second node clicked - create connection
        if (connectingFromNodeId !== nodeId) {
          handleEndConnection(connectingFromNodeId, nodeId);
        }
        setConnectingFromNodeId(null);
      } else {
        // First node clicked - start connection
        setConnectingFromNodeId(nodeId);
      }
      return;
    }

    // Check if Ctrl/Cmd key is pressed for multi-select
    const isCtrlPressed = event?.ctrlKey || event?.metaKey;

    if (isCtrlPressed && nodeId) {
      // Multi-select mode - add/remove from selection
      setIsMultiSelectMode(true);
      setSelectedNodeIds(prev => {
        if (prev.includes(nodeId)) {
          // Remove from selection
          const newSelection = prev.filter(id => id !== nodeId);
          if (newSelection.length === 0) {
            setIsMultiSelectMode(false);
          }
          return newSelection;
        } else {
          // Add to selection
          return [...prev, nodeId];
        }
      });
      setSelectedNodeId(null);
    } else if (nodeId) {
      // SIMPLE: Click one node → select only that node
      setSelectedNodeId(nodeId);
      setSelectedNodeIds([]); // Clear multi-select
      setSelectedConnectionIds([]); // Clear connection selection
      setIsMultiSelectMode(false); // Turn off multi-select mode

      // Show node info popup
      const selectedNode = nodes.find(node => node.id === nodeId);
      console.log('Node clicked:', nodeId, 'Found node:', selectedNode); // Debug log
      console.log('All nodes:', nodes); // Debug log
      if (selectedNode) {
        console.log('Setting node info popup:', selectedNode); // Debug log
        setNodeInfoPopup(selectedNode);
      } else {
        console.log('No node found with ID:', nodeId); // Debug log
      }
    } else {
      // Clicking empty area - clear all selections
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
      setSelectedConnectionIds([]);
      setIsMultiSelectMode(false);
      setNodeInfoPopup(null); // Close node info popup
    }

    setConnectingFromNodeId(null);
    setSelectedTextLabelId(null);
  }, [isSpacePressed, isConnectMode, connectingFromNodeId, handleEndConnection, nodes]);

  const handleNodeTitleChange = useCallback((nodeId: string, title: string) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, title } : node
    ));
  }, []);

  const handleCancelConnection = useCallback(() => {
    setConnectingFromNodeId(null);
  }, []);

  const handleConnectionClick = useCallback((connection: Connection, event: React.MouseEvent) => {
    setArrowPopup({
      connection,
      position: { x: event.clientX, y: event.clientY }
    });
  }, []);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);

  const handleConnectionTypeChange = useCallback((connectionId: string, type: Connection['type'], arrowType?: string, pathStyle?: string, animated?: boolean) => {
    setConnections(prev => prev.map(conn =>
      conn.id === connectionId ? {
        ...conn,
        type,
        arrowType: arrowType as Connection['arrowType'],
        pathStyle: pathStyle as Connection['pathStyle'],
        animated
      } : conn
    ));
  }, []);

  const handleArrowPopupClose = useCallback(() => {
    setArrowPopup(null);
  }, []);

  // Handle opening custom arrow editor
  const handleOpenCustomArrowEditor = useCallback((connection: Connection) => {
    setCustomArrowConnection(connection);
    setShowCustomArrowEditor(true);
    setArrowPopup(null); // Close the arrow popup
  }, []);

  // Handle closing custom arrow editor
  const handleCloseCustomArrowEditor = useCallback(() => {
    setShowCustomArrowEditor(false);
    setCustomArrowConnection(null);
  }, []);

  // Handle applying custom arrow style
  const handleApplyCustomArrowStyle = useCallback((customData: {
    style: string;
    color: string;
    thickness: number;
    pointerLength?: number;
    pointerWidth?: number;
    pointerColor?: string;
    customPath?: Array<{x: number; y: number; type: 'start' | 'control' | 'end'}>;
    pathType?: string;
  }) => {
    // Check if there are selected connections, if not, fallback to customArrowConnection
    const connectionsToUpdate = selectedConnectionIds.length > 0
      ? selectedConnectionIds
      : customArrowConnection ? [customArrowConnection.id] : [];
  
    if (connectionsToUpdate.length > 0) {
      setConnections(prev => prev.map(conn => {
        if (connectionsToUpdate.includes(conn.id)) {
          return {
            ...conn,
            type: 'custom',
            arrowType: 'default',
            pathStyle: 'custom',
            animated: false,
            customStyle: {
              color: customData.color,
              thickness: customData.thickness,
              pointerLength: customData.pointerLength || 15,
              pointerWidth: customData.pointerWidth || 15,
              pointerColor: customData.pointerColor || customData.color,
              style: customData.pathType as 'straight' | 'curve' | 'bezier' || 'curve',
              customPath: customData.customPath
            }
          };
        }
        return conn;
      }));
    }
    handleCloseCustomArrowEditor();
  }, [selectedConnectionIds, customArrowConnection]);

  // Delete selected nodes (single or multiple)
  const handleDeleteSelectedNodes = useCallback(() => {
    if (isMultiSelectMode && selectedNodeIds.length > 0) {
      // Delete multiple nodes
      setNodes(prev => prev.filter(node => !selectedNodeIds.includes(node.id)));
      setConnections(prev => prev.filter(conn =>
        !selectedNodeIds.includes(conn.fromNodeId) && !selectedNodeIds.includes(conn.toNodeId)
      ));
      setSelectedNodeIds([]);
      setIsMultiSelectMode(false);
    } else if (selectedNodeId) {
      // Delete single node
      setNodes(prev => prev.filter(node => node.id !== selectedNodeId));
      setConnections(prev => prev.filter(conn => conn.fromNodeId !== selectedNodeId && conn.toNodeId !== selectedNodeId));
      setSelectedNodeId(null);
    }
  }, [selectedNodeId, selectedNodeIds, isMultiSelectMode]);

  // Toolbar action handlers
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId));
    setSelectedNodeId(null);
  }, []);

  const handleAddText = useCallback(() => {
    const newTextLabel: TextLabel = {
      id: generateId(),
      text: 'New Text',
      position: { x: 300, y: 200 } // Default position
    };
    setTextLabels(prev => [...prev, newTextLabel]);
  }, []);

  const handleCapture = useCallback(async () => {
    const canvas = document.querySelector('.canvas') as HTMLElement;
    if (!canvas) return;

    try {
      // Wait a bit before capture
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the canvas
      const canvasElement = await html2canvas(canvas, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Convert to blob
      canvasElement.toBlob((blob) => {
        if (!blob) return;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `node-editor-capture-${timestamp}.png`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (error) {
      console.error('Error capturing canvas:', error);
      alert('Error capturing canvas. Please try again.');
    }
  }, []);

  // Text label handlers
  const handleTextLabelSelect = useCallback((labelId: string) => {
    setSelectedTextLabelId(labelId);
    setSelectedNodeId(null);
  }, []);

  const handleTextLabelChange = useCallback((labelId: string, text: string) => {
    setTextLabels(prev => prev.map(label =>
      label.id === labelId ? { ...label, text } : label
    ));
  }, []);

  const handleTextLabelDelete = useCallback((labelId: string) => {
    setTextLabels(prev => prev.filter(label => label.id !== labelId));
    setSelectedTextLabelId(null);
  }, []);

  const handleTextLabelPositionChange = useCallback((labelId: string, mouseEvent: React.MouseEvent) => {
    const label = textLabels.find(l => l.id === labelId);
    if (!label) return;

    const canvasElement = document.querySelector('.canvas') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();

    // Calculate the offset from mouse position to label position
    const offsetX = mouseEvent.clientX - rect.left - label.position.x;
    const offsetY = mouseEvent.clientY - rect.top - label.position.y;

    setDraggedTextLabel(label);
    setDragOffset({ x: offsetX, y: offsetY });
  }, [textLabels]);

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Toggle top menu function
  const toggleTopMenu = useCallback(() => {
    setShowTopMenu(prev => !prev);
  }, []);

  // Toggle bottom menu function
  const toggleBottomMenu = useCallback(() => {
    setShowBottomMenu(prev => !prev);
  }, []);



  // Toggle arrow draw mode
  const handleToggleArrowDrawMode = useCallback(() => {
    setIsArrowDrawMode(prev => {
      const newMode = !prev;
      // If enabling arrow draw mode, also enable connect mode
      if (newMode) {
        setIsConnectMode(true);
      } else {
        // If disabling arrow draw mode, also disable connect mode
        setIsConnectMode(false);
        setConnectingFromNodeId(null);
      }
      return newMode;
    });
  }, []);


  // Toggle progress bars for all nodes
  const handleToggleAllProgressBars = useCallback(() => {
    setShowAllProgressBars(prev => !prev);
  }, []);

  // Toggle IP addresses for all nodes
  const handleToggleAllIpAddresses = useCallback(() => {
    setShowAllIpAddresses(prev => !prev);
  }, []);

  // Toggle node list popup
  const handleToggleNodeList = useCallback(() => {
    setShowNodeListPopup(prev => !prev);
  }, []);

  // Handle node info popup
  // const handleShowNodeInfo = useCallback((node: Node) => {
  //   setNodeInfoPopup(node);
  // }, []);

  const handleCloseNodeInfo = useCallback(() => {
    setNodeInfoPopup(null);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<Node>) => {
    console.log('handleNodeUpdate called:', { nodeId, updates }); // Debug log

    setNodes(prev => {
      const updatedNodes = prev.map(node => {
        if (node.id === nodeId) {
          // IMPORTANT: Validate that the node still exists and has required fields
          if (!node.technologyId) {
            console.error('Node missing technologyId:', node); // Debug log
            return node; // Don't update if node is corrupted
          }

          const updatedNode = { ...node, ...updates };

          // SAFETY: Ensure critical fields are never lost
          if (!updatedNode.technologyId) {
            updatedNode.technologyId = node.technologyId;
          }
          if (!updatedNode.id) {
            updatedNode.id = node.id;
          }
          if (!updatedNode.position) {
            updatedNode.position = node.position;
          }

          console.log('Node updated:', { original: node, updated: updatedNode }); // Debug log
          return updatedNode;
        }
        return node;
      });

      console.log('All nodes after update:', updatedNodes); // Debug log
      return updatedNodes;
    });

    // Update the popup with new data
    setNodeInfoPopup(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Toggle connect mode
  const handleToggleConnectMode = useCallback(() => {
    setIsConnectMode(prev => !prev);
    // Clear any existing connection state when toggling
    if (isConnectMode) {
      setConnectingFromNodeId(null);
    }
  }, [isConnectMode]);

  // Show arrow management popup
  const handleShowArrowManagement = useCallback(() => {
    // Select all arrows when opening the popup
    const allConnectionIds = connections.map(conn => conn.id);
    setSelectedConnectionIds(allConnectionIds);
    setShowArrowManagementPopup(true);
  }, [connections]);

  // Close arrow management popup
  const handleCloseArrowManagement = useCallback(() => {
    setShowArrowManagementPopup(false);
    setSelectedConnectionIds([]);
  }, []);

  // Clear arrow selection (reuse close function)
  const handleClearArrowSelection = useCallback(() => {
    setSelectedConnectionIds([]);
  }, []);

  // Delete selected arrows
  const handleDeleteSelectedArrows = useCallback(() => {
    if (selectedConnectionIds.length > 0) {
      setConnections(prev => prev.filter(conn => !selectedConnectionIds.includes(conn.id)));
      setSelectedConnectionIds([]);
      setShowArrowManagementPopup(false);
    }
  }, [selectedConnectionIds]);

  // Change selected arrow types
  const handleChangeSelectedArrowTypes = useCallback((newType: Connection['type']) => {
    if (selectedConnectionIds.length > 0) {
      setConnections(prev => prev.map(conn =>
        selectedConnectionIds.includes(conn.id) ? { ...conn, type: newType } : conn
      ));
    }
  }, [selectedConnectionIds]);

  // Change selected arrow combinations
  const handleChangeSelectedArrowCombinations = useCallback((arrowType?: string, pathStyle?: string, animated?: boolean) => {
    if (selectedConnectionIds.length > 0) {
      setConnections(prev => prev.map(conn => {
        if (selectedConnectionIds.includes(conn.id)) {
          // Get current settings for this connection
          const currentArrowType = conn.arrowType || 'default';
          const currentPathStyle = conn.pathStyle || 'straight';
          const currentAnimated = conn.animated || false;

          // Update only the specified properties
          const updatedArrowType = arrowType || currentArrowType;
          const updatedPathStyle = pathStyle || currentPathStyle;
          const updatedAnimated = animated !== undefined ? animated : currentAnimated;

          // Determine new connection type based on combination
          let newType: Connection['type'] = 'default';
          if (updatedAnimated && updatedArrowType !== 'default') {
            newType = 'animated';
          } else if (updatedPathStyle === 'curve') {
            newType = 'curve';
          } else if (updatedPathStyle === 'curve-network') {
            newType = 'curve-network';
          } else if (updatedArrowType === 'split') {
            newType = 'split';
          } else if (updatedArrowType === 'dotted') {
            newType = 'dotted';
          }

          return {
            ...conn,
            type: newType,
            arrowType: updatedArrowType as Connection['arrowType'],
            pathStyle: updatedPathStyle as Connection['pathStyle'],
            animated: updatedAnimated
          };
        }
        return conn;
      }));
    }
  }, [selectedConnectionIds]);



  // Apply auto-layout to imported nodes
  const applyAutoLayout = useCallback((layout: 'hierarchy' | 'circular' | 'grid', importedNodes: Node[], importedConnections: Connection[]) => {
    const baseSpacing = 200;
    const verticalSpacing = 150;

    if (layout === 'hierarchy') {
      // Hierarchy layout - arrange nodes in levels based on connections
      const nodeIds = importedNodes.map(n => n.id);
      const relevantConnections = importedConnections.filter(conn =>
        nodeIds.includes(conn.fromNodeId) && nodeIds.includes(conn.toNodeId)
      );

      // Find root nodes (no incoming connections from imported nodes)
      const rootNodes = importedNodes.filter(node =>
        !relevantConnections.some(conn => conn.toNodeId === node.id)
      );

      // If no clear hierarchy, treat first node as root
      if (rootNodes.length === 0 && importedNodes.length > 0) {
        rootNodes.push(importedNodes[0]);
      }

      const levels: Node[][] = [];
      const visited = new Set<string>();

      // Build levels using BFS
      let currentLevel = [...rootNodes];
      while (currentLevel.length > 0) {
        levels.push([...currentLevel]);
        currentLevel.forEach(node => visited.add(node.id));

        const nextLevel: Node[] = [];
        currentLevel.forEach(node => {
          relevantConnections
            .filter(conn => conn.fromNodeId === node.id && !visited.has(conn.toNodeId))
            .forEach(conn => {
              const childNode = importedNodes.find(n => n.id === conn.toNodeId);
              if (childNode && !nextLevel.some(n => n.id === childNode.id)) {
                nextLevel.push(childNode);
              }
            });
        });
        currentLevel = nextLevel;
      }

      // Add any remaining nodes to the last level
      const remainingNodes = importedNodes.filter(node => !visited.has(node.id));
      if (remainingNodes.length > 0) {
        levels.push(remainingNodes);
      }

      // Position nodes in hierarchy
      const updatedNodes = [...importedNodes];
      levels.forEach((level, levelIndex) => {
        const levelWidth = level.length * baseSpacing;
        const startX = Math.max(100, (1200 - levelWidth) / 2);

        level.forEach((node, nodeIndex) => {
          const nodeIdx = updatedNodes.findIndex(n => n.id === node.id);
          if (nodeIdx !== -1) {
            updatedNodes[nodeIdx] = {
              ...updatedNodes[nodeIdx],
              position: {
                x: startX + nodeIndex * baseSpacing,
                y: 100 + levelIndex * verticalSpacing
              }
            };
          }
        });
      });

      setNodes(prev => prev.map(node => {
        const updated = updatedNodes.find(n => n.id === node.id);
        return updated || node;
      }));

    } else if (layout === 'circular') {
      // Circular layout
      const centerX = 600;
      const centerY = 400;
      const radius = Math.max(200, importedNodes.length * 30);

      const updatedNodes = importedNodes.map((node, index) => ({
        ...node,
        position: {
          x: centerX + radius * Math.cos((2 * Math.PI * index) / importedNodes.length),
          y: centerY + radius * Math.sin((2 * Math.PI * index) / importedNodes.length)
        }
      }));

      setNodes(prev => prev.map(node => {
        const updated = updatedNodes.find(n => n.id === node.id);
        return updated || node;
      }));

    } else if (layout === 'grid') {
      // Grid layout
      const cols = Math.ceil(Math.sqrt(importedNodes.length));
      const updatedNodes = importedNodes.map((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return {
          ...node,
          position: {
            x: 100 + col * baseSpacing,
            y: 100 + row * verticalSpacing
          }
        };
      });

      setNodes(prev => prev.map(node => {
        const updated = updatedNodes.find(n => n.id === node.id);
        return updated || node;
      }));
    }
  }, []);

  // Import JSON nodes with auto-layout
  const handleImportJson = useCallback((jsonData: ImportJsonData & { layout?: 'hierarchy' | 'circular' | 'grid' }) => {
    try {
      const { nodes: importNodes = [], connections: importConnections = [], layout = 'hierarchy' } = jsonData;

      // Import nodes with auto icon mapping
      const newNodes: Node[] = [];
      const nodeNameToIdMap: { [name: string]: string } = {};

      // Check if any nodes have positions defined
      const hasPositions = importNodes.some(node => node.position);

      importNodes.forEach((importNode, index) => {
        const nodeId = generateId();
        nodeNameToIdMap[importNode.name] = nodeId;

        // Auto-map technology based on name
        const technologyId = autoMapTechnology(importNode.name, importNode.technology);

        // Generate rich sample data using the same logic as addNode
        const technology = technologies.find(tech => tech.id === technologyId) || technologies[0];

        // Reuse the rich sample data generation logic
        const generateRichSampleDataForImport = () => {
          const isServerTech = ['node', 'express', 'nginx', 'apache', 'docker', 'kubernetes', 'redis', 'mongodb', 'postgresql', 'mysql'].includes(technologyId);
          const isCloudTech = ['aws', 'azure', 'gcp', 'vercel', 'netlify'].includes(technologyId);
          const isFrontendTech = ['react', 'vue', 'angular', 'svelte', 'nextjs'].includes(technologyId);

          const environments = ['development', 'staging', 'production'] as const;
          const statuses = ['running', 'stopped', 'error', 'pending'] as const;
          const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

          if (isServerTech || isCloudTech) {
            return {
              cpu: Math.floor(Math.random() * 8) + 2,
              memory: [4, 8, 16, 32, 64][Math.floor(Math.random() * 5)],
              storage: [50, 100, 250, 500, 1000][Math.floor(Math.random() * 5)],
              ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              port: isServerTech ? [3000, 8080, 9000, 5432, 6379][Math.floor(Math.random() * 5)] : undefined,
              hostname: `${technologyId}-${Math.random().toString(36).substring(2, 8)}`,
              cpuUsage: Math.floor(Math.random() * 80) + 10,
              memoryUsage: Math.floor(Math.random() * 70) + 15,
              status: statuses[Math.floor(Math.random() * statuses.length)],
              version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
              environment: environments[Math.floor(Math.random() * environments.length)],
              region: regions[Math.floor(Math.random() * regions.length)],
              zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,
              cluster: `cluster-${Math.floor(Math.random() * 5) + 1}`,
              namespace: ['default', 'production', 'staging', 'development'][Math.floor(Math.random() * 4)]
            };
          } else if (isFrontendTech) {
            return {
              cpu: Math.floor(Math.random() * 4) + 1,
              memory: [2, 4, 8][Math.floor(Math.random() * 3)],
              storage: [20, 50, 100][Math.floor(Math.random() * 3)],
              ip: Math.random() > 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
              port: [3000, 3001, 8080, 4200][Math.floor(Math.random() * 4)],
              hostname: `${technologyId}-app-${Math.random().toString(36).substring(2, 4)}`,
              cpuUsage: Math.floor(Math.random() * 40) + 5,
              memoryUsage: Math.floor(Math.random() * 50) + 10,
              status: statuses[Math.floor(Math.random() * statuses.length)],
              version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 10)}`,
              environment: environments[Math.floor(Math.random() * environments.length)],
              region: regions[Math.floor(Math.random() * regions.length)],
              zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`
            };
          } else {
            return {
              cpu: Math.floor(Math.random() * 4) + 1,
              memory: [2, 4, 8][Math.floor(Math.random() * 3)],
              storage: [20, 50, 100][Math.floor(Math.random() * 3)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              environment: environments[Math.floor(Math.random() * environments.length)],
              region: regions[Math.floor(Math.random() * regions.length)],
              zone: `${regions[Math.floor(Math.random() * regions.length)]}-${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`
            };
          }
        };

        const sampleData = generateRichSampleDataForImport();

        // Use provided position or temporary position for auto-layout
        let position = importNode.position;
        if (!position) {
          // Temporary position - will be recalculated with auto-layout
          position = { x: index * 200 + 100, y: 100 };
        }

        const newNode: Node = {
          id: nodeId,
          technologyId,
          position,
          title: importNode.name,

          // System Information
          cpu: sampleData.cpu,
          memory: sampleData.memory,
          storage: sampleData.storage,
          ip: sampleData.ip,
          port: sampleData.port,
          hostname: sampleData.hostname,

          // Service Information
          status: sampleData.status,

          // Performance Metrics
          cpuUsage: sampleData.cpuUsage,
          memoryUsage: sampleData.memoryUsage,

          // Infrastructure
          environment: sampleData.environment,
          region: sampleData.region,
          zone: sampleData.zone,
          cluster: sampleData.cluster,
          namespace: sampleData.namespace,

          // Metadata
          description: `${importNode.name} service imported from JSON`,

          // Legacy compatibility
          technology: technology.name,
          ipAddress: sampleData.ip
        };

        newNodes.push(newNode);
      });

      // Import connections
      const newConnections: Connection[] = [];
      importConnections.forEach((importConn) => {
        const fromNodeId = nodeNameToIdMap[importConn.from];
        const toNodeId = nodeNameToIdMap[importConn.to];

        if (fromNodeId && toNodeId) {
          newConnections.push({
            id: generateId(),
            fromNodeId,
            toNodeId,
            type: 'default'
          });
        }
      });

      // Add to existing nodes and connections
      setNodes(prev => [...prev, ...newNodes]);
      setConnections(prev => [...prev, ...newConnections]);

      // Apply auto-layout if no positions were provided
      if (!hasPositions && newNodes.length > 0) {
        // Wait for state to update, then apply layout
        setTimeout(() => {
          applyAutoLayout(layout, newNodes, newConnections);
        }, 100);
      }

      console.log(`Imported ${newNodes.length} nodes and ${newConnections.length} connections`);
      if (!hasPositions) {
        console.log(`Applied ${layout} auto-layout`);
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      alert('Error importing JSON. Please check the format and try again.');
    }
  }, [applyAutoLayout]);

  // Auto-map technology based on node name or explicit technology
  const autoMapTechnology = (nodeName: string, explicitTech?: string): string => {
    // If explicit technology is provided, try to match it first
    if (explicitTech) {
      const lowerTech = explicitTech.toLowerCase();

      // Handle common variations and map to correct IDs from constants.ts
      const techMapping: { [key: string]: string } = {
        // Direct matches (using actual IDs from constants.ts)
        'react': 'react',
        'vue': 'vue',
        'angular': 'angular',
        'express': 'express',
        'nginx': 'nginx',
        'apache': 'apache',
        'docker': 'docker',
        'kubernetes': 'kubernetes',
        'redis': 'redis',
        'mongodb': 'mongodb',
        'mysql': 'mysql',
        'aws': 'aws',
        'azure': 'azure',
        'gcp': 'gcp',
        'vercel': 'vercel',
        'netlify': 'netlify',
        'python': 'python',
        'java': 'java',
        'go': 'go',
        'javascript': 'javascript',
        'typescript': 'typescript',

        // Handle variations that map to different IDs
        'node': 'nodejs',
        'nodejs': 'nodejs',
        'node.js': 'nodejs',
        'postgres': 'postgres',
        'postgresql': 'postgres',  // Map postgresql to postgres (the actual ID)
        'k8s': 'kubernetes',
        'mongo': 'mongodb',
        'js': 'javascript',
        'ts': 'typescript',

        // Third-party technologies
        'keycloak': 'keycloak',
        'auth0': 'auth0',
        'okta': 'okta',
        'vault': 'vault',
        'opa': 'opa',
        'kong': 'kong',
        'istio': 'istio',
        'consul': 'consul',
        'spark': 'spark',
        'airflow': 'airflow',
        'flink': 'flink',
        'solr': 'solr',
        'opensearch': 'opensearch',
        'minio': 'minio',

        // Service types
        'service': 'service',
        'microservice': 'microservice',
        'worker': 'worker',
        'scheduler': 'scheduler',
        'gateway': 'gateway',
        'proxy': 'proxy',
        'loadbalancer': 'loadbalancer'
      };

      if (techMapping[lowerTech]) {
        return techMapping[lowerTech];
      }
    }

    // Auto-detect from node name
    const lowerName = nodeName.toLowerCase();

    // Security & Authentication
    if (lowerName.includes('keycloak')) return 'keycloak';
    if (lowerName.includes('auth0')) return 'auth0';
    if (lowerName.includes('vault')) return 'vault';
    if (lowerName.includes('opa') || lowerName.includes('policy')) return 'opa';
    if (lowerName.includes('auth') || lowerName.includes('identity') || lowerName.includes('login')) return 'keycloak';

    // API & Gateway
    if (lowerName.includes('kong')) return 'kong';
    if (lowerName.includes('istio')) return 'istio';
    if (lowerName.includes('consul')) return 'consul';
    if (lowerName.includes('gateway')) return 'gateway';
    if (lowerName.includes('proxy')) return 'proxy';
    if (lowerName.includes('loadbalancer') || lowerName.includes('load-balancer')) return 'loadbalancer';

    // Messaging & Streaming
    if (lowerName.includes('kafka')) return 'kafka';
    if (lowerName.includes('rabbitmq')) return 'rabbitmq';
    if (lowerName.includes('queue') || lowerName.includes('messaging')) return 'kafka';

    // Monitoring & Observability
    if (lowerName.includes('prometheus')) return 'prometheus';
    if (lowerName.includes('grafana')) return 'grafana';
    if (lowerName.includes('jaeger')) return 'jaeger';
    if (lowerName.includes('monitoring') || lowerName.includes('metrics')) return 'prometheus';

    // Data Processing
    if (lowerName.includes('spark')) return 'spark';
    if (lowerName.includes('airflow')) return 'airflow';
    if (lowerName.includes('flink')) return 'flink';

    // Search & Indexing
    if (lowerName.includes('elasticsearch') || lowerName.includes('elastic')) return 'elasticsearch';
    if (lowerName.includes('solr')) return 'solr';
    if (lowerName.includes('search') || lowerName.includes('index')) return 'elasticsearch';

    // Frontend frameworks
    if (lowerName.includes('react') || lowerName.includes('frontend') || lowerName.includes('ui')) return 'react';
    if (lowerName.includes('vue')) return 'vue';
    if (lowerName.includes('angular')) return 'angular';

    // Backend
    if (lowerName.includes('api') || lowerName.includes('server') || lowerName.includes('backend')) return 'express';
    if (lowerName.includes('node')) return 'nodejs';  // Use correct ID
    if (lowerName.includes('nginx')) return 'nginx';
    if (lowerName.includes('apache')) return 'apache';

    // Databases
    if (lowerName.includes('database') || lowerName.includes('db')) return 'postgres';  // Use correct ID
    if (lowerName.includes('mongo') || lowerName.includes('mongodb')) return 'mongodb';
    if (lowerName.includes('postgres') || lowerName.includes('postgresql')) return 'postgres';  // Use correct ID
    if (lowerName.includes('mysql')) return 'mysql';
    if (lowerName.includes('redis') || lowerName.includes('cache')) return 'redis';

    // Cloud
    if (lowerName.includes('aws') || lowerName.includes('amazon')) return 'aws';
    if (lowerName.includes('azure') || lowerName.includes('microsoft')) return 'azure';
    if (lowerName.includes('gcp') || lowerName.includes('google')) return 'gcp';
    if (lowerName.includes('vercel')) return 'vercel';
    if (lowerName.includes('netlify')) return 'netlify';

    // Containers
    if (lowerName.includes('docker') || lowerName.includes('container')) return 'docker';
    if (lowerName.includes('kubernetes') || lowerName.includes('k8s')) return 'kubernetes';

    // Service types
    if (lowerName.includes('worker') || lowerName.includes('job')) return 'worker';
    if (lowerName.includes('scheduler') || lowerName.includes('cron')) return 'scheduler';
    if (lowerName.includes('microservice') || lowerName.includes('micro-service')) return 'microservice';
    if (lowerName.includes('service')) return 'service';

    // Default fallback
    return 'react';
  };

  // Generate sample data based on technology
  // const generateSampleDataForTech = (technologyId: string) => {
  //   // Use correct IDs from constants.ts
  //   const isServerTech = [
  //     'nodejs', 'express', 'nginx', 'apache', 'docker', 'kubernetes',
  //     'redis', 'mongodb', 'postgres', 'mysql', 'kafka', 'rabbitmq',
  //     'keycloak', 'vault', 'kong', 'istio', 'consul', 'prometheus',
  //     'grafana', 'elasticsearch', 'spark', 'airflow', 'service',
  //     'microservice', 'gateway', 'proxy', 'loadbalancer'
  //   ].includes(technologyId);

  //   const isCloudTech = ['aws', 'azure', 'gcp', 'vercel', 'netlify'].includes(technologyId);

  //   const isLightweightTech = [
  //     'worker', 'scheduler', 'auth0', 'opa', 'solr', 'minio'
  //   ].includes(technologyId);

  //   if (isServerTech || isCloudTech) {
  //     return {
  //       cpu: Math.floor(Math.random() * 80) + 10,
  //       memory: Math.floor(Math.random() * 70) + 15,
  //       ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  //     };
  //   } else if (isLightweightTech) {
  //     return {
  //       cpu: Math.floor(Math.random() * 30) + 5,
  //       memory: Math.floor(Math.random() * 25) + 5,
  //       ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  //     };
  //   } else {
  //     const hasIp = Math.random() > 0.6;
  //     return {
  //       cpu: Math.floor(Math.random() * 50) + 5,
  //       memory: Math.floor(Math.random() * 40) + 10,
  //       ip: hasIp ? `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined
  //     };
  //   }
  // };

  // Center node in view (Corrected transform calculation)
  const handleCenterNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Get the main content container (viewport)
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (!mainContent) return;

    const viewportRect = mainContent.getBoundingClientRect();
    const viewportCenterX = viewportRect.width / 2;
    const viewportCenterY = viewportRect.height / 2;

    // Node center position in canvas coordinates
    const nodeCenterX = node.position.x + 80; // 80 is half node width (160/2)
    const nodeCenterY = node.position.y + 50; // 50 is half node height (100/2)

    // CSS transform: scale(zoom) translate(offsetX, offsetY)
    // Applied right-to-left: translate first, then scale
    // Final position = (nodePos + offset) * zoom
    // We want: (nodePos + offset) * zoom = viewportCenter
    // Therefore: offset = (viewportCenter / zoom) - nodePos
    const targetOffsetX = (viewportCenterX / zoomLevel) - nodeCenterX;
    const targetOffsetY = (viewportCenterY / zoomLevel) - nodeCenterY;

    // Apply smooth transition
    const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
    if (canvasContainer) {
      canvasContainer.style.transition = 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)';

      setTimeout(() => {
        if (canvasContainer) {
          canvasContainer.style.transition = '';
        }
      }, 800);
    }

    // Set the new offset to center the node
    setCanvasOffset({
      x: targetOffsetX,
      y: targetOffsetY
    });

    setShowNodeListPopup(false);
  }, [nodes, zoomLevel]);

  // Force stop panning when pressing Escape
  const forceStopPanning = useCallback(() => {
    setIsPanning(false);
    setPanStart({ x: 0, y: 0 });
  }, []);



  // Canvas mouse down handler - implements draw.io-style two-mode system
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    // Don't handle if clicking on nodes, connections, or other UI elements
    if (target.closest('.node') ||
        target.closest('.connection-component') ||
        target.closest('.text-label') ||
        target.closest('.arrow-popup') ||
        target.closest('.top-menu') ||
        target.closest('.technology-item')) {
      return;
    }

    // Space key = Pan mode (always takes priority)
    if (isSpacePressed) {
      // Allow panning with any mouse button (left, right, middle)
      if (target.classList.contains('canvas') || target.classList.contains('canvas-background') || target.classList.contains('canvas-container')) {
        setIsPanning(true);
        setPanStart({
          x: event.clientX - canvasOffset.x,
          y: event.clientY - canvasOffset.y
        });
        event.preventDefault();
      }
      return;
    }

    // Only handle left click
    if (event.button !== 0) return;

    // SIMPLE: Just clear selections when clicking empty area
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setSelectedConnectionIds([]);
    setIsMultiSelectMode(false);

    // Cancel any ongoing connections
    if (connectingFromNodeId) {
      setConnectingFromNodeId(null);
    }

    // Exit connect mode if active
    if (isConnectMode) {
      setIsConnectMode(false);
    }

    // Close any popups
    setArrowPopup(null);
  }, [canvasOffset, isSpacePressed, connectingFromNodeId, isConnectMode]);


  const handleCanvasMouseUp = useCallback(() => {
    // Handle panning only - keep it simple
    if (isPanning) {
      setIsPanning(false);
      setPanStart({ x: 0, y: 0 });
    }
  }, [isPanning]);

  // Handle mouse leave ONLY when leaving the browser window (not canvas area)
  const handleWindowMouseLeave = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart({ x: 0, y: 0 });
    }
  }, [isPanning]);


  // Layout algorithms
  const arrangeNodesHierarchy = useCallback(() => {
    if (nodes.length === 0) return;

    const canvasElement = document.querySelector('.canvas') as HTMLElement;
    if (!canvasElement) return;

    // Scale layout based on zoom level and number of nodes
    const baseSpacing = 200 / zoomLevel; // Adjust spacing based on zoom
    const baseVerticalSpacing = 150 / zoomLevel;
    const canvasWidth = Math.max(1200 / zoomLevel, nodes.length * baseSpacing);
    const canvasHeight = Math.max(800 / zoomLevel, nodes.length * baseVerticalSpacing);
    const centerX = canvasWidth / 2;
    const startY = 100 / zoomLevel;

    // Find parent nodes (nodes with no incoming connections)
    const parentNodes = nodes.filter(node =>
      !connections.some(conn => conn.toNodeId === node.id)
    );

    // Find child nodes (nodes with incoming connections)
    const childNodes = nodes.filter(node =>
      connections.some(conn => conn.toNodeId === node.id)
    );

    // Find isolated nodes (no connections at all)
    const isolatedNodes = nodes.filter(node =>
      !connections.some(conn => conn.fromNodeId === node.id || conn.toNodeId === node.id)
    );

    const newNodes = [...nodes];

    // Arrange parent nodes in a horizontal line at the top
    parentNodes.forEach((node, index) => {
      const nodeIndex = newNodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        newNodes[nodeIndex] = {
          ...node,
          position: {
            x: centerX - (parentNodes.length * baseSpacing / 2) / 2 + index * baseSpacing,
            y: startY
          }
        };
      }
    });

    // Arrange child nodes below their parents
    childNodes.forEach((node) => {
      const parentConnection = connections.find(conn => conn.toNodeId === node.id);
      if (parentConnection) {
        const parent = newNodes.find(n => n.id === parentConnection.fromNodeId);
        if (parent) {
          const nodeIndex = newNodes.findIndex(n => n.id === node.id);
          if (nodeIndex !== -1) {
            const childrenOfParent = connections.filter(conn => conn.fromNodeId === parent.id);
            const childIndex = childrenOfParent.findIndex(conn => conn.toNodeId === node.id);

            newNodes[nodeIndex] = {
              ...node,
              position: {
                x: parent.position.x - (childrenOfParent.length * baseSpacing / 2) / 2 + childIndex * (baseSpacing * 0.8),
                y: parent.position.y + baseVerticalSpacing
              }
            };
          }
        }
      }
    });

    // Arrange isolated nodes in a rectangle at the bottom right
    isolatedNodes.forEach((node, index) => {
      const nodeIndex = newNodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        const cols = Math.ceil(Math.sqrt(isolatedNodes.length));
        const row = Math.floor(index / cols);
        const col = index % cols;

        newNodes[nodeIndex] = {
          ...node,
          position: {
            x: canvasWidth - (400 / zoomLevel) + col * (baseSpacing * 0.9),
            y: canvasHeight - (300 / zoomLevel) + row * (baseVerticalSpacing * 0.8)
          }
        };
      }
    });

    setNodes(newNodes);
  }, [nodes, connections, zoomLevel]);

  const arrangeNodesCircular = useCallback(() => {
    if (nodes.length === 0) return;

    // Scale layout based on zoom level
    const baseSpacing = 150 / zoomLevel;
    const canvasWidth = Math.max(1000 / zoomLevel, nodes.length * baseSpacing);
    const canvasHeight = Math.max(800 / zoomLevel, nodes.length * (120 / zoomLevel));
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Find the most connected node as center
    const nodeConnections = nodes.map(node => ({
      node,
      connectionCount: connections.filter(conn =>
        conn.fromNodeId === node.id || conn.toNodeId === node.id
      ).length
    }));

    nodeConnections.sort((a, b) => b.connectionCount - a.connectionCount);

    const centerNode = nodeConnections[0]?.node;
    const otherNodes = nodeConnections.slice(1).map(nc => nc.node);
    const isolatedNodes = nodes.filter(node =>
      !connections.some(conn => conn.fromNodeId === node.id || conn.toNodeId === node.id)
    );

    const newNodes = [...nodes];

    // Place center node at canvas center
    if (centerNode) {
      const centerIndex = newNodes.findIndex(n => n.id === centerNode.id);
      if (centerIndex !== -1) {
        newNodes[centerIndex] = {
          ...centerNode,
          position: { x: centerX - 80, y: centerY - 50 }
        };
      }
    }

    // Arrange other nodes in circles around the center
    const radius = Math.min(centerX, centerY) * 0.6;
    otherNodes.forEach((node, index) => {
      const angle = (index / otherNodes.length) * 2 * Math.PI;
      const nodeIndex = newNodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        newNodes[nodeIndex] = {
          ...node,
          position: {
            x: centerX + Math.cos(angle) * radius - (80 / zoomLevel),
            y: centerY + Math.sin(angle) * radius - (50 / zoomLevel)
          }
        };
      }
    });

    // Place isolated nodes in a corner
    isolatedNodes.forEach((node, index) => {
      const nodeIndex = newNodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        const cols = Math.ceil(Math.sqrt(isolatedNodes.length));
        const row = Math.floor(index / cols);
        const col = index % cols;

        newNodes[nodeIndex] = {
          ...node,
          position: {
            x: (50 / zoomLevel) + col * baseSpacing,
            y: (50 / zoomLevel) + row * (120 / zoomLevel)
          }
        };
      }
    });

    setNodes(newNodes);
  }, [nodes, connections, zoomLevel]);

  // Main content droppable
  const { setNodeRef: setMainContentRef } = useDroppable({
    id: 'main-content'
  });

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.technology) {
      setActiveDragItem(active.data.current.technology);

      // Calculate the offset from the click position to the top-left of the item
      if (event.activatorEvent) {
        const mouseEvent = event.activatorEvent as MouseEvent;
        const target = mouseEvent.target as HTMLElement;
        const itemElement = target.closest('.technology-item') as HTMLElement;

        if (itemElement) {
          const itemRect = itemElement.getBoundingClientRect();
          const offsetX = mouseEvent.clientX - itemRect.left;
          const offsetY = mouseEvent.clientY - itemRect.top;

          setOverlayOffset({ x: offsetX, y: offsetY });

          // Also update the current mouse position immediately
          setLastMousePosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
        }
      }
    }
  }, []);

  const handleNodePositionChange = useCallback((nodeId: string, mouseEvent: React.MouseEvent) => {
    console.log('handleNodePositionChange called for node:', nodeId); // Debug log

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvasElement = document.querySelector('.canvas') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();

    // Calculate the offset from mouse position to node position
    const offsetX = mouseEvent.clientX - rect.left - node.position.x;
    const offsetY = mouseEvent.clientY - rect.top - node.position.y;

    console.log('Setting dragged node:', node.id, 'isMultiSelected:', selectedNodeIds.includes(nodeId)); // Debug log

    setDraggedNode(node);
    setDragOffset({ x: offsetX, y: offsetY });
  }, [nodes, selectedNodeIds]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvasElement = document.querySelector('.canvas') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const newX = event.clientX - rect.left - dragOffset.x;
    const newY = event.clientY - rect.top - dragOffset.y;

    // Handle node dragging with auto-expanding canvas (all 4 directions)
    if (draggedNode) {
      const nodeWidth = 160;
      const nodeHeight = 100;
      const edgeThreshold = 50;

      // Check if we need to expand in any direction
      const expandLeft = newX < edgeThreshold;
      const expandTop = newY < edgeThreshold;
      const expandRight = newX + nodeWidth > canvasSize.width - edgeThreshold;
      const expandBottom = newY + nodeHeight > canvasSize.height - edgeThreshold;

      let offsetX = 0;
      let offsetY = 0;

      // Calculate offsets for left/top expansion and update canvas size
      if (expandLeft) {
        offsetX = edgeThreshold - newX + 300;
        setCanvasSize(prev => ({ ...prev, width: prev.width + offsetX }));
      }
      if (expandTop) {
        offsetY = edgeThreshold - newY + 300;
        setCanvasSize(prev => ({ ...prev, height: prev.height + offsetY }));
      }

      // Expand right/bottom
      if (expandRight) {
        const expandRightAmount = (newX + nodeWidth) - (canvasSize.width - edgeThreshold) + 300;
        setCanvasSize(prev => ({ ...prev, width: prev.width + expandRightAmount }));
      }
      if (expandBottom) {
        const expandBottomAmount = (newY + nodeHeight) - (canvasSize.height - edgeThreshold) + 300;
        setCanvasSize(prev => ({ ...prev, height: prev.height + expandBottomAmount }));
      }



      // UNIFIED: Make left/top work exactly like right/bottom
      setNodes(prevNodes =>
        prevNodes.map(node => {
          // If this is the dragged node, position it at mouse location
          if (node.id === draggedNode.id) {
            // Simple positioning like right/bottom edges
            let finalX = Math.max(edgeThreshold, newX);
            let finalY = Math.max(edgeThreshold, newY);

            // Apply left/top shifts to dragged node
            finalX += offsetX;
            finalY += offsetY;

            return {
              ...node,
              position: { x: finalX, y: finalY }
            };
          }
          // If this node is multi-selected, move it by the same delta
          else if (selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1) {
            const draggedFinalX = Math.max(edgeThreshold, newX) + offsetX;
            const draggedFinalY = Math.max(edgeThreshold, newY) + offsetY;
            const deltaX = draggedFinalX - (draggedNode.position.x + offsetX);
            const deltaY = draggedFinalY - (draggedNode.position.y + offsetY);

            return {
              ...node,
              position: {
                x: Math.max(edgeThreshold, node.position.x + offsetX + deltaX),
                y: Math.max(edgeThreshold, node.position.y + offsetY + deltaY)
              }
            };
          }
          // All other nodes: apply left/top shifts only
          else {
            return {
              ...node,
              position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY
              }
            };
          }
        })
      );
    }

    // Handle text label dragging
    if (draggedTextLabel) {
      const clampedX = Math.max(0, Math.min(newX, rect.width - 100));
      const clampedY = Math.max(0, Math.min(newY, rect.height - 30));

      // Update text labels immediately for real-time updates
      setTextLabels(prevLabels =>
        prevLabels.map(label =>
          label.id === draggedTextLabel.id
            ? {
                ...label,
                position: {
                  x: clampedX,
                  y: clampedY
                }
              }
            : label
        )
      );
    }
  }, [draggedNode, draggedTextLabel, dragOffset, selectedNodeIds, canvasSize]);

  // DEDICATED: Auto-shrink function called when dragging ends
  const performAutoShrink = useCallback(() => {
    if (nodes.length === 0) return;

    const nodeWidth = 160;
    const nodeHeight = 100;
    const padding = 300;
    const shrinkThreshold = 200;

    // FIXED: Calculate bounds of all nodes and connections (ALL 4 directions)
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const nodeLeft = node.position.x;
      const nodeTop = node.position.y;
      const nodeRight = node.position.x + nodeWidth;
      const nodeBottom = node.position.y + nodeHeight;

      if (nodeLeft < minX) minX = nodeLeft;
      if (nodeTop < minY) minY = nodeTop;
      if (nodeRight > maxX) maxX = nodeRight;
      if (nodeBottom > maxY) maxY = nodeBottom;
    });

    // FIXED: Check connections (ALL 4 directions)
    connections.forEach(connection => {
      const fromNode = nodes.find(n => n.id === connection.fromNodeId);
      const toNode = nodes.find(n => n.id === connection.toNodeId);
      if (fromNode && toNode) {
        const arrowPadding = 50;
        const fromCenterX = fromNode.position.x + 80;
        const fromCenterY = fromNode.position.y + 50;
        const toCenterX = toNode.position.x + 80;
        const toCenterY = toNode.position.y + 50;

        const connMinX = Math.min(fromCenterX, toCenterX) - arrowPadding;
        const connMinY = Math.min(fromCenterY, toCenterY) - arrowPadding;
        const connMaxX = Math.max(fromCenterX, toCenterX) + arrowPadding;
        const connMaxY = Math.max(fromCenterY, toCenterY) + arrowPadding;

        if (connMinX < minX) minX = connMinX;
        if (connMinY < minY) minY = connMinY;
        if (connMaxX > maxX) maxX = connMaxX;
        if (connMaxY > maxY) maxY = connMaxY;
      }
    });

    // FIXED: Calculate required canvas size considering ALL 4 directions
    // const requiredLeft = Math.max(0, -minX + padding); // Space needed on left
    // const requiredTop = Math.max(0, -minY + padding);  // Space needed on top
    const requiredWidth = maxX + padding;
    const requiredHeight = maxY + padding;

    const currentWidth = canvasSize.width;
    const currentHeight = canvasSize.height;

    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let shouldShiftNodes = false;
    let shiftX = 0;
    let shiftY = 0;

    // FIXED: Shrink logic for ALL 4 directions
    // Check if all content fits within default canvas size
    const contentFitsDefault = (
      minX >= 0 && minY >= 0 &&
      maxX + padding <= defaultCanvasSize.width &&
      maxY + padding <= defaultCanvasSize.height
    );

    if (contentFitsDefault && (currentWidth > defaultCanvasSize.width || currentHeight > defaultCanvasSize.height)) {
      // Shrink back to default size and shift nodes if needed
      newWidth = defaultCanvasSize.width;
      newHeight = defaultCanvasSize.height;

      // If nodes are positioned as if canvas was expanded left/top, shift them back
      if (minX < 0) {
        shiftX = -minX + 50; // Shift nodes right
        shouldShiftNodes = true;
      }
      if (minY < 0) {
        shiftY = -minY + 50; // Shift nodes down
        shouldShiftNodes = true;
      }
    } else {
      // Gradual shrinking if there's unused space
      const unusedWidth = currentWidth - requiredWidth;
      const unusedHeight = currentHeight - requiredHeight;

      if (unusedWidth > shrinkThreshold) {
        newWidth = Math.max(defaultCanvasSize.width, requiredWidth);
      }
      if (unusedHeight > shrinkThreshold) {
        newHeight = Math.max(defaultCanvasSize.height, requiredHeight);
      }
    }

    // Apply changes
    if (newWidth !== currentWidth || newHeight !== currentHeight) {
      setCanvasSize({ width: newWidth, height: newHeight });
    }

    // Shift nodes if needed (for left/top shrinking)
    if (shouldShiftNodes) {
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          position: {
            x: Math.max(50, node.position.x + shiftX),
            y: Math.max(50, node.position.y + shiftY)
          }
        }))
      );
    }
  }, [nodes, connections, canvasSize, defaultCanvasSize]);

  const handleMouseUp = useCallback(() => {
    // Perform auto-shrink when dragging ends
    if (draggedNode) {
      setTimeout(() => performAutoShrink(), 100); // Small delay to ensure state is updated
    }

    setDraggedNode(null);
    setDraggedTextLabel(null);
    setDragOffset({ x: 0, y: 0 });
  }, [draggedNode, performAutoShrink]);

  // Global mouse move handler for tracking position during drag and panning
  const handleGlobalMouseMove = useCallback((event: MouseEvent) => {
    setLastMousePosition({ x: event.clientX, y: event.clientY });

    // Handle panning first (if active)
    if (isPanning && isSpacePressed) {
      const newOffset = {
        x: event.clientX - panStart.x,
        y: event.clientY - panStart.y
      };
      setCanvasOffset(newOffset);
    }

    // Handle node dragging (if active)
    handleMouseMove(event);
  }, [handleMouseMove, isPanning, isSpacePressed, panStart]);

  // Handle keyboard events - FAST Space key response
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // CRITICAL: Don't handle keyboard shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    const isTypingInInput = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.contentEditable === 'true' ||
                           target.closest('.node-info-popup') ||
                           target.closest('.title-input');

    console.log('Key pressed:', event.key, 'isTypingInInput:', isTypingInInput, 'target:', target); // Debug log

    // INSTANT Space key response - prevent page scroll and activate immediately
    if (event.code === 'Space') {
      // Don't prevent space in input fields
      if (!isTypingInInput) {
        event.preventDefault();
        event.stopPropagation();
        if (!isSpacePressed && !event.repeat) { // Ignore key repeat
          setIsSpacePressed(true);
          // Stop any current panning when entering pan mode
          forceStopPanning();
        }
      }
      return;
    }

    // Track SHIFT key for selection rectangle mode
    if (event.key === 'Shift') {
      if (!isShiftPressed && !event.repeat) {
        setIsShiftPressed(true);
      }
      return;
    }

    // CRITICAL FIX: Only handle Delete/Backspace when NOT typing in input fields
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isTypingInInput) {
      console.log('Delete key triggered, deleting selected nodes'); // Debug log
      handleDeleteSelectedNodes();
    } else if (event.key === 'Escape') {
      // SIMPLE: Stop panning and clear selections
      forceStopPanning();
      setIsSpacePressed(false);
      setIsShiftPressed(false);
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
      setSelectedConnectionIds([]);
      setIsMultiSelectMode(false);
    }
  }, [handleDeleteSelectedNodes, forceStopPanning, isSpacePressed, isShiftPressed]);

  // Handle key up events - INSTANT Space key release
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      setIsSpacePressed(false);
      // IMMEDIATELY stop any current panning when exiting pan mode
      forceStopPanning();
    } else if (event.key === 'Shift') {
      setIsShiftPressed(false);
    }
  }, [forceStopPanning]);

  // Add event listeners - Mouse Up is PRIMARY stop mechanism
  useEffect(() => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mouseup', handleCanvasMouseUp); // PRIMARY: Stop when mouse button released
    window.addEventListener('blur', handleWindowMouseLeave); // BACKUP: Stop when window loses focus
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
      window.removeEventListener('blur', handleWindowMouseLeave);
    };
  }, [handleGlobalMouseMove, handleMouseUp, handleKeyDown, handleKeyUp, handleCanvasMouseUp, handleWindowMouseLeave]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="app">
        {/* Top Menu Container */}
        <div className={`top-menu-container ${showTopMenu ? 'open' : 'closed'}`}>
          {showTopMenu && (
            <TopMenu
              showAllProgressBars={showAllProgressBars}
              showAllIpAddresses={showAllIpAddresses}
              isConnectMode={isConnectMode}
              onDeleteNode={handleDeleteNode}
              onAddText={handleAddText}
              onCapture={handleCapture}
              onToggleAllProgressBars={handleToggleAllProgressBars}
              onToggleAllIpAddresses={handleToggleAllIpAddresses}
              onToggleNodeList={handleToggleNodeList}
              onToggleConnectMode={handleToggleConnectMode}
              selectedNodeId={selectedNodeId}
            />
          )}
        </div>

        {/* Top Menu Toggle Button */}
        <button
          className={`top-menu-toggle ${showTopMenu ? 'open' : 'closed'}`}
          onClick={toggleTopMenu}
          title={showTopMenu ? 'Hide Menu' : 'Show Menu'}
        >
          {showTopMenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Sidebar Toggle Button */}
        <button
          className={`sidebar-toggle ${isSidebarOpen ? 'open' : 'closed'}`}
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Technology Panel with conditional rendering */}
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
          <TechnologyPanel
            onArrangeHierarchy={arrangeNodesHierarchy}
            onArrangeCircular={arrangeNodesCircular}
            isSpacePressed={isSpacePressed}
          />
        </div>

        {/* Main Canvas Area */}
        <div
          ref={setMainContentRef}
          className={`main-content ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}
        >
          <div
            className={`canvas-container ${isPanning ? 'panning' : ''} ${isSpacePressed ? 'space-pan-mode' : ''}`}
            style={{
              transform: `scale(${zoomLevel}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              transformOrigin: 'center center'
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            <Canvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            selectedNodeIds={selectedNodeIds}
            selectedConnectionIds={selectedConnectionIds}
            connectingFromNodeId={connectingFromNodeId}
            arrowPopup={arrowPopup}
            isDragOver={isDragOver}
            draggedNodeId={draggedNode?.id || null}
            isPanning={isPanning}
            isConnectMode={isConnectMode || isArrowDrawMode}
            canvasSize={canvasSize}
            showAllProgressBars={showAllProgressBars}
            showAllIpAddresses={showAllIpAddresses}
            onNodeSelect={handleNodeSelect}
            onNodeTitleChange={handleNodeTitleChange}
            onEndConnection={handleEndConnection}
            onCancelConnection={handleCancelConnection}
            onConnectionClick={handleConnectionClick}
            onConnectionDelete={handleConnectionDelete}
            onConnectionTypeChange={handleConnectionTypeChange}
            onArrowPopupClose={handleArrowPopupClose}
            onOpenCustomArrowEditor={handleOpenCustomArrowEditor}
            onNodePositionChange={handleNodePositionChange}
            onToggleConnectMode={handleToggleConnectMode}
            onImportJson={handleImportJson}
          />

            {/* Konva.js Selection Layer - Based on your working code */}
            <KonvaSelectionLayer
              nodes={nodes}
              connections={connections}
              selectedNodeIds={selectedNodeIds}
              canvasSize={canvasSize}
              zoomLevel={zoomLevel}
              canvasOffset={canvasOffset}
              isPanning={isPanning}
              isSpacePressed={isSpacePressed}
              isShiftPressed={isShiftPressed}
              isDraggingNode={!!draggedNode}
              onSelectionComplete={handleSelectionComplete}
              onNodesMove={handleNodesMove}
            />
          </div>

          {/* Text Labels */}
          {textLabels.map(label => (
            <TextLabelComponent
              key={label.id}
              label={label}
              isSelected={selectedTextLabelId === label.id}
              onSelect={handleTextLabelSelect}
              onTextChange={handleTextLabelChange}
              onDelete={handleTextLabelDelete}
              onPositionChange={handleTextLabelPositionChange}
            />
          ))}

          {/* Space Indicator */}
          <div className="canvas-controls">
            <div className="space-indicator">
              {isSpacePressed && (
                <div className={`space-status ${isPanning ? 'panning' : ''}`}>
                  {isPanning ? '⌨️ Space Panning...' : '⌨️ Space Pan Mode'}
                </div>
              )}
              {!isSpacePressed && (
                <div className="space-hint">Hold Space + Click to pan</div>
              )}
            </div>
          </div>

          {/* Multi-Select Toolbar */}
          {isMultiSelectMode && selectedNodeIds.length > 0 && (
            <div className="multi-select-toolbar">
              <div className="multi-select-info">
                <span>{selectedNodeIds.length} nodes selected</span>
                <button
                  className="delete-group-btn"
                  onClick={handleDeleteSelectedNodes}
                  title="Delete selected nodes"
                >
                  Delete All
                </button>
                <button
                  className="clear-selection-btn"
                  onClick={() => {
                    setSelectedNodeIds([]);
                    setIsMultiSelectMode(false);
                  }}
                  title="Clear selection"
                >
                  Clear
                </button>
              </div>
            </div>
          )}


        </div>

        {/* Custom Drag Overlay */}
        {activeDragItem && (
          <div
            className="custom-drag-overlay"
            style={{
              position: 'fixed',
              left: lastMousePosition.x - overlayOffset.x,
              top: lastMousePosition.y - overlayOffset.y,
              pointerEvents: 'none',
              zIndex: 10000,
              cursor: 'grabbing'
            }}
          >
            <div
              className="technology-item dragging-overlay"
              style={{
                width: '140px',
                margin: 0
              }}
            >
              <div className="tech-icon" style={{ backgroundColor: activeDragItem.color }}>
                {activeDragItem.icon}
              </div>
              <span className="tech-name">{activeDragItem.name}</span>
            </div>
          </div>
        )}

        {/* Node List Popup */}
        {showNodeListPopup && (
          <NodeListPopup
            nodes={nodes}
            onClose={handleToggleNodeList}
            onCenterNode={handleCenterNode}
          />
        )}

        {/* Arrow Management Popup */}
        {showArrowManagementPopup && (
          <ArrowManagementPopup
            connection={connections[0]}
            selectedCount={selectedConnectionIds.length}
            totalCount={connections.length}
            onClose={handleCloseArrowManagement}
            onClearSelection={handleClearArrowSelection}
            onDeleteSelected={handleDeleteSelectedArrows}
            onChangeType={handleChangeSelectedArrowTypes}
            onChangeCombination={handleChangeSelectedArrowCombinations}
            onOpenCustomArrowEditor={handleOpenCustomArrowEditor}
          />
        )}

        {/* Multi-Select Mode Indicator */}
        {isMultiSelectMode && selectedNodeIds.length > 0 && (
          <div style={{
            position: 'fixed',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(96, 165, 250, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {selectedNodeIds.length} nodes selected • Click any node to select single • Press Escape to clear
          </div>
        )}

        {/* Bottom Menu Container */}
        <div className={`bottom-menu-container ${showBottomMenu ? 'open' : 'closed'}`}>
          {showBottomMenu && (
            <BottomMenu
              isArrowDrawMode={isArrowDrawMode}
              selectedConnectionIds={selectedConnectionIds}
              connectionsCount={connections.length}
              onToggleArrowDrawMode={handleToggleArrowDrawMode}
              onShowArrowManagement={handleShowArrowManagement}
            />
          )}
        </div>

        {/* Bottom Menu Toggle Button */}
        <button
          className={`bottom-menu-toggle ${showBottomMenu ? 'open' : 'closed'}`}
          onClick={toggleBottomMenu}
          title={showBottomMenu ? 'Hide Menu' : 'Show Menu'}
        >
          {showBottomMenu ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>

        {/* Custom Arrow Editor */}
        {showCustomArrowEditor && customArrowConnection && (
          <CustomArrowEditor
            onClose={handleCloseCustomArrowEditor}
            onApplyCustomStyle={handleApplyCustomArrowStyle}
            initialStyle={customArrowConnection.customStyle}
          />
        )}

        {/* Node Info Popup */}
        {nodeInfoPopup && (
          <NodeInfoPopup
            node={nodeInfoPopup}
            onClose={handleCloseNodeInfo}
            onNodeUpdate={handleNodeUpdate}
          />
        )}

        {/* Empty DragOverlay to maintain DnD functionality */}
        <DragOverlay dropAnimation={null}>
          {null}
        </DragOverlay>
      </div>
      
    </DndContext>
    
  );
}

export default App;
