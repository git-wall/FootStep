import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import { X, Palette, Settings, Zap } from 'lucide-react';
import Konva from 'konva';

interface CustomPathPoint {
  x: number;
  y: number;
  type: 'start' | 'control' | 'end';
}

interface CustomArrowEditorProps {
  onClose: () => void;
  onApplyCustomStyle: (customData: {
    style: string;
    color: string;
    thickness: number;
    pointerLength?: number;
    pointerWidth?: number;
    pointerColor?: string;
    customPath?: CustomPathPoint[];
    pathType?: string;
  }) => void;
  initialStyle?: {
    color: string;
    thickness: number;
    pointerLength: number;
    pointerWidth: number;
    pointerColor?: string;
    style: 'straight' | 'curve' | 'bezier';
    customPath?: CustomPathPoint[];
  };
}

export const CustomArrowEditor: React.FC<CustomArrowEditorProps> = ({ 
  onClose, 
  onApplyCustomStyle, 
  initialStyle 
}) => {
  const [arrowStyle, setArrowStyle] = useState({
    color: initialStyle?.color || '#60A5FA',
    thickness: initialStyle?.thickness || 3,
    pointerLength: initialStyle?.pointerLength || 15,
    pointerWidth: initialStyle?.pointerWidth || 15,
    pointerColor: initialStyle?.color || '#60A5FA', // Default to same as line color
    style: initialStyle?.style || 'straight' as 'straight' | 'curve' | 'bezier'
  });

  // Arrow path points for direct manipulation
  const [arrowPath, setArrowPath] = useState([
    { x: 120, y: 200 },  // Start point
    { x: 200, y: 180 },  // First curve point
    { x: 300, y: 220 },  // Middle point
    { x: 400, y: 180 },  // Second curve point
    { x: 480, y: 200 }   // End point
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const stageRef = useRef<Konva.Stage>(null);

  // Force re-render when pointer color changes to ensure arrow head updates
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [arrowStyle.pointerColor]);

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArrowStyle((prev) => ({
      ...prev,
      [name]: name === 'thickness' || name.includes('pointer') && name !== 'pointerColor' ? parseInt(value) : value,
    }));
  };

  // Handle dragging arrow path points
  const handleArrowPointDrag = (pointIndex: number, newPos: { x: number; y: number }) => {
    setArrowPath(prev => prev.map((point, index) => 
      index === pointIndex ? newPos : point
    ));
    detectArrowStyle();
  };

  // Detect arrow style based on path shape
  const detectArrowStyle = () => {
    if (arrowPath.length < 3) {
      setArrowStyle(prev => ({ ...prev, style: 'straight' }));
      return;
    }

    // Check if points form a straight line
    const isLinear = arrowPath.every((point, index) => {
      if (index === 0 || index === arrowPath.length - 1) return true;
      const prevPoint = arrowPath[index - 1];
      const nextPoint = arrowPath[index + 1];
      if (nextPoint.x === prevPoint.x) return true; // Vertical line
      const expectedY = prevPoint.y + ((nextPoint.y - prevPoint.y) * (point.x - prevPoint.x)) / (nextPoint.x - prevPoint.x);
      return Math.abs(point.y - expectedY) < 10;
    });

    if (isLinear) {
      setArrowStyle(prev => ({ ...prev, style: 'straight' }));
    } else if (arrowPath.length <= 3) {
      setArrowStyle(prev => ({ ...prev, style: 'curve' }));
    } else {
      setArrowStyle(prev => ({ ...prev, style: 'bezier' }));
    }
  };

  // Handle mouse interactions
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedPointIndex(null);
    }
  };

  const handleApply = () => {
    // Convert arrow path to relative coordinates (0-1 range)
    const normalizedPath: CustomPathPoint[] = arrowPath.map((point, index) => ({
      x: point.x / 800, // Normalize to canvas width
      y: point.y / 450, // Normalize to canvas height
      type: (index === 0 ? 'start' : index === arrowPath.length - 1 ? 'end' : 'control') as 'start' | 'control' | 'end'
    }));

    onApplyCustomStyle({
      style: 'custom', // Mark as custom style
      color: arrowStyle.color,
      thickness: arrowStyle.thickness,
      pointerLength: arrowStyle.pointerLength,
      pointerWidth: arrowStyle.pointerWidth,
      pointerColor: arrowStyle.pointerColor, // Include pointer color
      customPath: normalizedPath, // Include the custom path data
      pathType: arrowStyle.style // Original detected style
    });
    onClose();
  };

  return (
    <div className="custom-arrow-editor-backdrop">
      <div className="custom-arrow-editor-container">
        <div className="custom-arrow-flow-container">
          {/* Header */}
          <div className="custom-arrow-header">
            <div className="flow-header">
              <h3>🎨 Custom Arrow Designer</h3>
              <div className="flow-actions">
                <button onClick={handleApply} className="apply-btn">
                  <Zap size={16} />
                  Apply This Style
                </button>
                <button onClick={onClose} className="close-btn">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Body - Horizontal Layout */}
          <div className="custom-arrow-body">
            {/* Canvas Area - 70% */}
            <div className="flow-content">
              {/* Drawing Status Indicator */}
              <div className="drawing-status-indicator">
                {isDragging ? '🔄' : '✏️'}
              </div>
              <div className="konva-container">
                <Stage
                  width={800}
                  height={450}
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  style={{ cursor: 'default' }}
                >
                  <Layer>
                    {/* Arrow Path - Draggable */}
                    <Line
                      points={arrowPath.flatMap(point => [point.x, point.y])}
                      stroke={arrowStyle.color}
                      strokeWidth={arrowStyle.thickness}
                      lineCap="round"
                      tension={0.3}
                      shadowColor="rgba(0,0,0,0.4)"
                      shadowBlur={8}
                      shadowOffset={{ x: 3, y: 3 }}
                      shadowOpacity={0.6}
                      opacity={isDragging ? 0.8 : 1}
                    />

                    {/* Arrow Head Preview */}
                    {arrowPath.length >= 2 && (
                      <Line
                        key={`arrow-head-${arrowStyle.pointerColor}-${forceUpdate}`} // Force re-render when color changes
                        points={[
                          arrowPath[arrowPath.length - 1].x - arrowStyle.pointerLength,
                          arrowPath[arrowPath.length - 1].y - arrowStyle.pointerWidth/2,
                          arrowPath[arrowPath.length - 1].x,
                          arrowPath[arrowPath.length - 1].y,
                          arrowPath[arrowPath.length - 1].x - arrowStyle.pointerLength,
                          arrowPath[arrowPath.length - 1].y + arrowStyle.pointerWidth/2
                        ]}
                        stroke={arrowStyle.pointerColor || arrowStyle.color}
                        strokeWidth={2}
                        lineCap="round"
                        fill={arrowStyle.pointerColor || arrowStyle.color}
                        closed={true}
                        opacity={isDragging ? 0.8 : 1}
                        listening={false}
                      />
                    )}

                    {/* Draggable Path Points */}
                    {arrowPath.map((point, index) => (
                      <Circle
                        key={index}
                        x={point.x}
                        y={point.y}
                        radius={selectedPointIndex === index ? 8 : 6}
                        fill={index === 0 ? "#4f46e5" : index === arrowPath.length - 1 ? "#059669" : "#f59e0b"}
                        stroke={index === 0 ? "#6366f1" : index === arrowPath.length - 1 ? "#10b981" : "#d97706"}
                        strokeWidth={selectedPointIndex === index ? 3 : 2}
                        draggable
                        onDragMove={(e) => {
                          handleArrowPointDrag(index, { x: e.target.x(), y: e.target.y() });
                        }}
                        onDragStart={() => {
                          setSelectedPointIndex(index);
                          setIsDragging(true);
                        }}
                        onDragEnd={() => {
                          setIsDragging(false);
                        }}
                        onMouseEnter={() => {
                          document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
                        }}
                        onMouseLeave={() => {
                          document.body.style.cursor = 'default';
                        }}
                        shadowColor="rgba(0,0,0,0.3)"
                        shadowBlur={4}
                        shadowOffset={{ x: 2, y: 2 }}
                        shadowOpacity={0.5}
                      />
                    ))}

                    {/* Point Labels */}
                    {arrowPath.map((point, index) => (
                      <Text
                        key={`label-${index}`}
                        x={point.x - 8}
                        y={point.y - 25}
                        text={index === 0 ? "Start Node" : index === arrowPath.length - 1 ? "End Node" : `Control ${index}`}
                        fontSize={11}
                        fill={index === 0 ? "#4f46e5" : index === arrowPath.length - 1 ? "#059669" : "#f59e0b"}
                        fontStyle="bold"
                        listening={false}
                      />
                    ))}

                    {/* Scale Guide Lines */}
                    <Text
                      x={400}
                      y={30}
                      text="⚡ This shape will scale to fit between any two nodes"
                      fontSize={12}
                      fill="#94a3b8"
                      fontStyle="italic"
                      listening={false}
                      align="center"
                    />
                  </Layer>
                </Stage>
              </div>
            </div>

            {/* Controls Panel - 30% */}
            <div className="arrow-controls-panel">
              <div className="controls-header">
                <h4><Settings size={16} /> Arrow Controls</h4>
              </div>

              <div className="controls-content">
                <div className="control-group">
                  <label><Palette size={16} /> Arrow color:</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="color"
                      value={arrowStyle.color}
                      onChange={handleStyleChange}
                    />
                    <span className="color-value">{arrowStyle.color}</span>
                  </div>
                </div>

                <div className="control-group">
                  <label>📏 Thickness: {arrowStyle.thickness}px</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    name="thickness"
                    value={arrowStyle.thickness}
                    onChange={handleStyleChange}
                  />
                </div>

                <div className="control-group">
                  <label>🎯 Pointer Length: {arrowStyle.pointerLength}px</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    name="pointerLength"
                    value={arrowStyle.pointerLength}
                    onChange={handleStyleChange}
                  />
                </div>

                <div className="control-group">
                  <label>📐 Pointer Width: {arrowStyle.pointerWidth}px</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    name="pointerWidth"
                    value={arrowStyle.pointerWidth}
                    onChange={handleStyleChange}
                  />
                </div>

                <div className="control-group">
                  <label>� Pointer Color:</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="pointerColor"
                      value={arrowStyle.pointerColor}
                      onChange={handleStyleChange}
                    />
                    <span className="color-value">{arrowStyle.pointerColor}</span>
                  </div>
                </div>

                <div className="control-group">
                  <label>�🎨 Current Style: <span style={{color: '#60A5FA', fontWeight: 'bold'}}>{arrowStyle.style.charAt(0).toUpperCase() + arrowStyle.style.slice(1)}</span></label>
                  <small style={{color: '#94a3b8', fontSize: '12px'}}>
                    💡 Drag the path points in the canvas to change the arrow shape
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="custom-arrow-footer">
            <div className="flow-instructions">
              <p>🎯 <strong>Drag Path Points</strong> to reshape your arrow - Create curves, straight lines, or custom shapes!</p>
              <p>🔵 <strong>Blue (Start)</strong> | 🟠 <strong>Orange (Middle)</strong> | 🟢 <strong>Green (End)</strong></p>
              <p>✨ Arrow style auto-detects based on path shape</p>
              <p>🎨 Use right panel (30%) to adjust color, thickness, and pointer size</p>
              <p>📏 <strong>Note:</strong> Arrow will automatically scale to fit between any two nodes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
