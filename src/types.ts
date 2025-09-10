export interface Technology {
  id: string;
  name: string;
  icon: string;
  iconType?: 'emoji' | 'svg' | 'url' | 'text';
  iconUrl?: string;
  color: string;
  category: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  technologyId: string;
  position: Position;
  title: string;
  nodeType?: string; // Node shape type (cube, service, database, device)

  // System Information
  cpu?: number;
  memory?: number;
  storage?: number;
  ip?: string;
  port?: number;
  hostname?: string;

  // Service Information
  status?: 'running' | 'stopped' | 'error' | 'pending';

  // Performance Metrics
  cpuUsage?: number;
  memoryUsage?: number;

  // Configuration
  environment?: 'development' | 'staging' | 'production';
  region?: string;
  zone?: string;
  cluster?: string;
  namespace?: string;

  // Metadata
  description?: string;

  // Legacy fields for backward compatibility
  technology?: string;
  ipAddress?: string;
  progress?: number;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'default' | 'animated' | 'split' | 'curve' | 'sketch' | 'curve-network' | 'cubic-bezier' | 'dotted' | 'custom';
  // Extended properties for combination support
  arrowType?: 'default' | 'split' | 'dotted';
  pathStyle?: 'straight' | 'curve' | 'curve-network' | 'cubic-bezier' | 'square-rounded' | 'custom';
  animated?: boolean;
  // Custom arrow style data
  customStyle?: {
    color: string;
    thickness: number;
    pointerLength: number;
    pointerWidth: number;
    pointerColor?: string;
    style: 'straight' | 'curve' | 'bezier';
    customPath?: Array<{
      x: number;
      y: number;
      type: 'start' | 'control' | 'end';
    }>;
  };
}

export interface ArrowPopupData {
  connection: Connection;
  position: Position;
}

export interface TextLabel {
  id: string;
  text: string;
  position: Position;
}
