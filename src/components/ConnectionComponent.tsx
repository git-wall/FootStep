import type { Connection, Node } from '../types';

interface ConnectionComponentProps {
  connection: Connection;
  nodes: Node[];
  isSelected?: boolean;
  onConnectionClick: (connection: Connection, event: React.MouseEvent) => void;
}

export function ConnectionComponent({ connection, nodes, isSelected = false, onConnectionClick }: ConnectionComponentProps) {
  const fromNode = nodes.find(n => n.id === connection.fromNodeId);
  const toNode = nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  // Calculate node centers first
  const fromCenterX = fromNode.position.x + 80; // Node width / 2 (160/2)
  const fromCenterY = fromNode.position.y + 50; // Node height / 2 (approximate)
  const toCenterX = toNode.position.x + 80;
  const toCenterY = toNode.position.y + 50;

  // Calculate direction vector
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  const unitX = dx / distance;
  const unitY = dy / distance;

  // Node radius (approximate distance from center to edge)
  const nodeRadius = 40; // Adjust this to match your node size

  // Calculate connection points at the edge of nodes
  const fromX = fromCenterX + unitX * nodeRadius;
  const fromY = fromCenterY + unitY * nodeRadius;
  const toX = toCenterX - unitX * nodeRadius;
  const toY = toCenterY - unitY * nodeRadius;

  // Parse connection settings from extended properties or fallback to type
  const getConnectionSettings = () => {
    // Use extended properties if available, otherwise extract from type
    let arrowType: 'default' | 'split' | 'dotted' = connection.arrowType || 'default';
    let pathStyle: 'straight' | 'curve' | 'curve-network' | 'cubic-bezier' | 'square-rounded' | 'custom' = connection.pathStyle || 'straight';
    let animated = connection.animated || false;

    // Fallback: Extract from connection type if extended properties not set
    if (!connection.arrowType || !connection.pathStyle || connection.animated === undefined) {
      switch (connection.type) {
        case 'animated':
          arrowType = 'split';
          pathStyle = 'straight';
          animated = true;
          break;
        case 'split':
          arrowType = 'split';
          pathStyle = 'straight';
          animated = false;
          break;
        case 'dotted':
          arrowType = 'dotted';
          pathStyle = 'straight';
          animated = false;
          break;
        case 'curve':
          arrowType = 'default';
          pathStyle = 'curve';
          animated = false;
          break;
        case 'curve-network':
          arrowType = 'default';
          pathStyle = 'curve-network';
          animated = false;
          break;
        case 'cubic-bezier':
          arrowType = 'default';
          pathStyle = 'cubic-bezier';
          animated = false;
          break;
        case 'custom':
          arrowType = 'default';
          pathStyle = 'custom';
          animated = false;
          break;
        default:
          arrowType = 'default';
          pathStyle = 'straight';
          animated = false;
      }
    }

    return { arrowType, pathStyle, animated };
  };

  const getConnectionStyle = () => {
    const { arrowType, pathStyle, animated } = getConnectionSettings();

    // Base style
    let style: any = {
      stroke: '#60A5FA',
      strokeWidth: '2',
      markerEnd: 'url(#arrowhead)'
    };

    // Step 1: Apply arrow type patterns and base colors
    if (arrowType === 'split') {
      style.stroke = '#F59E0B'; // Orange for split
      style.strokeDasharray = '12,6';
      style.markerEnd = 'url(#arrowhead-split)';
    } else if (arrowType === 'dotted') {
      style.stroke = '#a855f7'; // Purple for dots
      style.strokeDasharray = '4,8';
      style.markerEnd = 'url(#arrowhead-dotted)';
    } else {
      // Default arrow type
      style.stroke = '#60A5FA'; // Blue for default
      style.markerEnd = 'url(#arrowhead)';
    }

    // Step 2: Apply path style modifications (can override colors)
    if (pathStyle === 'curve') {
      style.stroke = '#8b5cf6'; // Purple for all curves
      if (arrowType === 'default') {
        style.strokeWidth = '3'; // Thicker for default curves only
      }
      style.markerEnd = 'url(#arrowhead-curve)';
    } else if (pathStyle === 'curve-network') {
      style.stroke = '#06b6d4'; // Cyan for all networks
      style.markerEnd = 'url(#arrowhead-curve-network)';
    } else if (pathStyle === 'cubic-bezier') {
      style.stroke = '#10b981'; // Green for cubic bezier
      style.strokeWidth = '3'; // Medium thickness like JSON Crack
      style.strokeLinecap = 'round'; // Rounded line caps for smooth appearance
      style.strokeLinejoin = 'round'; // Rounded corner joins
      style.markerEnd = 'url(#arrowhead-cubic-bezier)'; // Fixed cubic-bezier arrowhead
    } else if (pathStyle === 'square-rounded') {
      style.stroke = '#f59e0b'; // Orange for square-rounded
      style.strokeWidth = '3'; // Medium thickness
      style.strokeLinecap = 'round'; // Rounded line caps
      style.strokeLinejoin = 'round'; // Rounded corner joins
      style.markerEnd = 'url(#arrowhead-square-rounded)'; // Square-rounded arrowhead
    } else if (pathStyle === 'custom') {
      // Apply custom style data if available
      if (connection.customStyle) {
        style.stroke = connection.customStyle.color;
        style.strokeWidth = connection.customStyle.thickness.toString();
        style.markerEnd = 'url(#arrowhead-custom)';

        // Update marker color to match custom pointer color
        const customMarker = document.getElementById('arrowhead-custom');
        if (customMarker) {
          const pointerColor = connection.customStyle.pointerColor || connection.customStyle.color;
          const polygons = customMarker.querySelectorAll('polygon');
          polygons.forEach(polygon => {
            polygon.setAttribute('fill', pointerColor);
            polygon.setAttribute('stroke', pointerColor);
          });
        }
      } else {
        // Fallback for custom without data
        style.stroke = '#f59e0b'; // Orange for custom
        style.strokeWidth = '3';
        style.markerEnd = 'url(#arrowhead-custom)';
      }
    }
    // For straight paths, keep the arrow type colors from Step 1

    // Step 3: Apply animation (preserves all previous settings)
    if (animated && arrowType !== 'default') {
      style.animation = 'dash 1.5s linear infinite';
      // Keep existing stroke color and dash pattern
      // Only change marker to animated version
      style.markerEnd = 'url(#arrowhead-animated)';
    }

    return style;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionClick(connection, e);
  };

  const connectionStyle = getConnectionStyle();

  // Add selection styling
  const selectionStyle = isSelected ? {
    strokeWidth: (parseInt(connectionStyle.strokeWidth as string) || 4) + 2,
    filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))',
    opacity: 1
  } : {};

  // Generate path for curved connections using combined settings
  const generatePath = () => {
    const { pathStyle } = getConnectionSettings();

    if (pathStyle === 'curve' || pathStyle === 'curve-network' || pathStyle === 'cubic-bezier' || pathStyle === 'square-rounded' || pathStyle === 'custom') {
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;

      if (pathStyle === 'curve') {
        // Simple curve - offset control point perpendicular to the line
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.min(length * 0.3, 100); // Limit curve intensity

        // Perpendicular offset
        const perpX = -dy / length * offset;
        const perpY = dx / length * offset;

        const controlX = midX + perpX;
        const controlY = midY + perpY;
        return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
      } else if (pathStyle === 'cubic-bezier') {
        // JSON Crack style: adaptive for both horizontal and vertical connections
        const dx = toX - fromX;
        const dy = toY - fromY;

        // Determine if connection is more horizontal or vertical
        const isMoreHorizontal = Math.abs(dx) > Math.abs(dy);

        if (isMoreHorizontal) {
          // Horizontal-dominant: horizontal out → curve → horizontal in
          const horizontalOffset = Math.abs(dx) * 0.3;
          const control1X = fromX + (dx > 0 ? horizontalOffset : -horizontalOffset);
          const control1Y = fromY;
          const control2X = toX - (dx > 0 ? horizontalOffset : -horizontalOffset);
          const control2Y = toY;
          return `M ${fromX} ${fromY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toX} ${toY}`;
        } else {
          // Vertical-dominant: vertical out → curve → vertical in
          const verticalOffset = Math.abs(dy) * 0.3;
          const control1X = fromX;
          const control1Y = fromY + (dy > 0 ? verticalOffset : -verticalOffset);
          const control2X = toX;
          const control2Y = toY - (dy > 0 ? verticalOffset : -verticalOffset);
          return `M ${fromX} ${fromY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toX} ${toY}`;
        }
      } else if (pathStyle === 'square-rounded') {
        // Square-rounded path: straight line when aligned, L-shaped when diagonal
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Threshold for considering nodes "aligned"
        const alignmentThreshold = 20;

        // Check if nodes are aligned horizontally or vertically
        const isHorizontallyAligned = Math.abs(dy) <= alignmentThreshold;
        const isVerticallyAligned = Math.abs(dx) <= alignmentThreshold;

        if (isHorizontallyAligned || isVerticallyAligned) {
          // Nodes are aligned - use straight line
          return `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
          // Nodes are diagonal - create L-shaped path with rounded corners
          const cornerRadius = Math.min(15, distance * 0.1);

          let path = `M ${fromX} ${fromY}`;

          // Choose direction based on dominant axis
          if (Math.abs(dx) >= Math.abs(dy)) {
            // Horizontal first, then vertical
            const turnX = fromX + dx * 0.7;

            // Horizontal segment to turn point
            path += ` L ${turnX - Math.sign(dx) * cornerRadius} ${fromY}`;

            // Rounded corner
            path += ` Q ${turnX} ${fromY} ${turnX} ${fromY + Math.sign(dy) * cornerRadius}`;

            // Vertical segment
            path += ` L ${turnX} ${toY - Math.sign(dy) * cornerRadius}`;

            // Rounded corner
            path += ` Q ${turnX} ${toY} ${turnX + Math.sign(dx) * cornerRadius} ${toY}`;

            // Final horizontal segment to target
            path += ` L ${toX} ${toY}`;
          } else {
            // Vertical first, then horizontal
            const turnY = fromY + dy * 0.7;

            // Vertical segment to turn point
            path += ` L ${fromX} ${turnY - Math.sign(dy) * cornerRadius}`;

            // Rounded corner
            path += ` Q ${fromX} ${turnY} ${fromX + Math.sign(dx) * cornerRadius} ${turnY}`;

            // Horizontal segment
            path += ` L ${toX - Math.sign(dx) * cornerRadius} ${turnY}`;

            // Rounded corner
            path += ` Q ${toX} ${turnY} ${toX} ${turnY + Math.sign(dy) * cornerRadius}`;

            // Final vertical segment to target
            path += ` L ${toX} ${toY}`;
          }

          return path;
        }
      } else if (pathStyle === 'custom' && connection.customStyle && connection.customStyle.customPath) {
        // Use custom path from Konva editor
        const customPath = connection.customStyle.customPath;
        console.log('Rendering custom path:', customPath);

        // Calculate the actual distance and direction between nodes
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;

        // Convert normalized coordinates to actual coordinates relative to the connection
        const actualPath = customPath.map(point => {
          // Scale the normalized path to fit the actual connection distance and direction
          const scaledX = fromX + deltaX * point.x;
          const scaledY = fromY + deltaY * point.y;

          return {
            x: scaledX,
            y: scaledY,
            type: point.type
          };
        });

        // Generate SVG path from custom points, ensuring it connects the nodes properly
        if (actualPath.length >= 2) {
          // Always start from the actual fromX, fromY (node edge)
          let pathString = `M ${fromX} ${fromY}`;

          if (actualPath.length === 2) {
            // Straight line - directly to end node
            pathString += ` L ${toX} ${toY}`;
          } else if (actualPath.length === 3) {
            // Quadratic curve with one control point
            pathString += ` Q ${actualPath[1].x} ${actualPath[1].y} ${toX} ${toY}`;
          } else if (actualPath.length === 4) {
            // Cubic bezier with two control points
            pathString += ` C ${actualPath[1].x} ${actualPath[1].y} ${actualPath[2].x} ${actualPath[2].y} ${toX} ${toY}`;
          } else if (actualPath.length >= 5) {
            // Multi-point smooth curve
            // Use the middle points as control points but ensure we end at the target node
            const controlPoints = actualPath.slice(1, -1); // Exclude start and end

            if (controlPoints.length === 1) {
              // Single control point
              pathString += ` Q ${controlPoints[0].x} ${controlPoints[0].y} ${toX} ${toY}`;
            } else if (controlPoints.length === 2) {
              // Two control points
              pathString += ` C ${controlPoints[0].x} ${controlPoints[0].y} ${controlPoints[1].x} ${controlPoints[1].y} ${toX} ${toY}`;
            } else {
              // Multiple control points - create smooth curve
              pathString += ` Q ${controlPoints[0].x} ${controlPoints[0].y} ${controlPoints[1].x} ${controlPoints[1].y}`;

              // Add remaining control points as smooth curve points
              for (let i = 2; i < controlPoints.length; i++) {
                pathString += ` T ${controlPoints[i].x} ${controlPoints[i].y}`;
              }

              // End at target node
              pathString += ` T ${toX} ${toY}`;
            }
          }

          return pathString;
        }

        // Fallback to straight line if path is invalid
        return null;
      } else if (pathStyle === 'curve-network') {
        // Curve network (S-curve like SkyWalking) - REVERSED to curve upward
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const upwardOffset = Math.min(length * 0.3, 80); // Curve upward

        const control1X = fromX + dx * 0.25;
        const control1Y = fromY - upwardOffset; // Curve UP first (negative offset)
        const control2X = fromX + dx * 0.75;
        const control2Y = toY - upwardOffset; // Then curve back UP to end (negative offset)
        return `M ${fromX} ${fromY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${toX} ${toY}`;
      }
    } else if (pathStyle === 'custom' && connection.customStyle) {
      // Custom path based on custom style
      if (connection.customStyle.style === 'curve') {
        // Simple curve like regular curve
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.min(length * 0.3, 100);

        const perpX = -dy / length * offset;
        const perpY = dx / length * offset;

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        const controlX = midX + perpX;
        const controlY = midY + perpY;

        return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
      } else if (connection.customStyle.style === 'bezier') {
        // Bezier curve with two control points
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.min(length * 0.25, 80);

        const control1X = fromX + dx * 0.25 - offset;
        const control1Y = fromY + dy * 0.25 - offset;
        const control2X = fromX + dx * 0.75 + offset;
        const control2Y = fromY + dy * 0.75 - offset;

        return `M ${fromX} ${fromY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${toX} ${toY}`;
      }
      // For 'straight' custom style, return null to use line
    }
    return null;
  };

  const pathData = generatePath();

  return (
    <g className={`connection ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      {/* Selection highlight (behind main line) */}
      {isSelected && (
        <>
          {pathData ? (
            <path
              d={pathData}
              stroke="#60A5FA"
              strokeWidth={(parseInt(connectionStyle.strokeWidth as string) || 4) + 4}
              opacity="0.3"
              fill="none"
              className="connection-selection"
            />
          ) : (
            <line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke="#60A5FA"
              strokeWidth={(parseInt(connectionStyle.strokeWidth as string) || 4) + 4}
              opacity="0.3"
              className="connection-selection"
            />
          )}
        </>
      )}

      {/* Subtle border effect for cubic-bezier (JSON Crack style) */}
      {pathData && getConnectionSettings().pathStyle === 'cubic-bezier' && (
        <path
          d={pathData}
          stroke="#065f46"
          strokeWidth={(parseInt(connectionStyle.strokeWidth as string) || 3) + 1}
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="connection-border"
        />
      )}

      {/* Main connection */}
      {pathData ? (
        <path
          d={pathData}
          strokeWidth={connectionStyle.strokeWidth || "4"}
          className={`connection-line ${connection.type}`}
          style={{...connectionStyle, ...selectionStyle, fill: 'none'}}
        />
      ) : (
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          strokeWidth={connectionStyle.strokeWidth || "4"}
          className={`connection-line ${connection.type}`}
          style={{...connectionStyle, ...selectionStyle}}
        />
      )}

      {/* Invisible wider hitbox */}
      {pathData ? (
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
          className="connection-hitbox"
        />
      ) : (
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="transparent"
          strokeWidth="20"
          className="connection-hitbox"
        />
      )}
    </g>
  );
}
