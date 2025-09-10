import React from 'react';
import type { Technology } from '../types';

interface TechIconProps {
  technology: Technology;
  size?: number;
  className?: string;
}

// Helper function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const TechIcon: React.FC<TechIconProps> = ({
  technology,
  size = 24,
  className = ''
}) => {
  const iconType = technology.iconType || 'text';

  // Determine icon color based on background brightness
  const isBackgroundLight = isLightColor(technology.color);
  const iconColor = isBackgroundLight ? '#2D3748' : '#FFFFFF';

  const baseStyle = {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.6,
    fontWeight: 'bold',
    color: iconColor,
  };

  switch (iconType) {
    case 'svg':
      return (
        <img
          src={technology.iconUrl || `/tech-icons/${technology.id}.svg`}
          alt={technology.name}
          style={baseStyle}
          className={className}
          onError={(e) => {
            // Fallback to text if SVG fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.tech-icon-fallback') as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }
          }}
        />
      );
      
    case 'url':
      return (
        <img
          src={technology.iconUrl}
          alt={technology.name}
          style={baseStyle}
          className={className}
          onError={(e) => {
            // Fallback to text if URL fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.tech-icon-fallback') as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }
          }}
        />
      );
      
    case 'emoji':
      return (
        <span
          style={{
            ...baseStyle,
            fontSize: size * 0.8,
          }}
          className={className}
        >
          {technology.icon}
        </span>
      );
      
    case 'text':
    default:
      return (
        <span
          style={{
            ...baseStyle,
            textAlign: 'center',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className={className}
        >
          {technology.icon}
        </span>
      );
  }
};

// Wrapper component that includes fallback
export const TechIconWithFallback: React.FC<TechIconProps> = (props) => {
  const { technology } = props;

  if (technology.iconType === 'svg' || technology.iconType === 'url') {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <TechIcon {...props} />
        {/* Fallback text icon - hidden by default, shown when image fails */}
        <div
          style={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          className="tech-icon-fallback"
        >
          <TechIcon
            {...props}
            technology={{
              ...technology,
              iconType: 'text'
            }}
          />
        </div>
      </div>
    );
  }

  return <TechIcon {...props} />;
};
