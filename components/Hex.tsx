import React from 'react';
import { HexData, ResourceType, PortType } from '../types';

interface HexProps {
  data: HexData;
  size: number;
  x: number;
  y: number;
}

// Public Unsplash images for textures
const ResourceImages: Record<ResourceType, string> = {
  [ResourceType.GRAIN]: 'https://images.unsplash.com/photo-1470723710355-171b4e56876c?q=80&w=300&auto=format&fit=crop', // Wheat Field
  [ResourceType.FOREST]: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=300&auto=format&fit=crop', // Forest
  [ResourceType.HILLS]: 'https://images.unsplash.com/photo-1541625906233-a3d13db9b589?q=80&w=300&auto=format&fit=crop', // Red Soil/Hills
  [ResourceType.MOUNTAINS]: 'https://images.unsplash.com/photo-1465311440653-ba9bf472a715?q=80&w=300&auto=format&fit=crop', // Mountains
  [ResourceType.PASTURE]: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=300&auto=format&fit=crop', // Green Pasture
  [ResourceType.DESERT]: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=300&auto=format&fit=crop', // Desert
  [ResourceType.SEA]: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop', // Sea
};

const ResourceLabels: Record<ResourceType, string> = {
  [ResourceType.GRAIN]: '🌾',
  [ResourceType.FOREST]: '🌲',
  [ResourceType.HILLS]: '🧱',
  [ResourceType.MOUNTAINS]: '🏔️',
  [ResourceType.PASTURE]: '🐑',
  [ResourceType.DESERT]: '🌵',
  [ResourceType.SEA]: '',
};

const PortLabels: Record<PortType, string> = {
  [PortType.GENERIC]: '?',
  [PortType.GRAIN]: '🌾',
  [PortType.FOREST]: '🌲',
  [PortType.HILLS]: '🧱',
  [PortType.MOUNTAINS]: '🏔️',
  [PortType.PASTURE]: '🐑',
  [PortType.NONE]: '',
};

const PortColors: Record<PortType, string> = {
  [PortType.GENERIC]: '#ffffff',
  [PortType.GRAIN]: '#f4d03f',
  [PortType.FOREST]: '#27ae60',
  [PortType.HILLS]: '#e74c3c',
  [PortType.MOUNTAINS]: '#7f8c8d',
  [PortType.PASTURE]: '#ecf0f1',
  [PortType.NONE]: 'transparent',
};

const Hex: React.FC<HexProps> = ({ data, size, x, y }) => {
  // Points for a flat-topped hex
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = Math.PI / 180 * angle_deg;
    const px = x + size * Math.cos(angle_rad);
    const py = y + size * Math.sin(angle_rad);
    hexPoints.push(`${px},${py}`);
  }

  const pointsString = hexPoints.join(' ');
  const isRed = data.number === 6 || data.number === 8;
  const dots = data.number ? 6 - Math.abs(data.number - 7) : 0;
  const clipId = `hex-clip-${data.id.replace(',', '-')}`; 

  const isSea = data.resource === ResourceType.SEA;
  const hasPort = data.port && data.port !== PortType.NONE;

  return (
    <g className="group">
      <defs>
        <clipPath id={clipId}>
          <polygon points={pointsString} />
        </clipPath>
      </defs>

      {/* Hex Background Image */}
      <image 
        href={ResourceImages[data.resource]} 
        x={x - size} 
        y={y - size} 
        width={size * 2} 
        height={size * 2} 
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: 'none' }}
      />

      {/* Hex Border */}
      <polygon
        points={pointsString}
        fill="none"
        stroke={isSea ? "rgba(255,255,255,0.3)" : "#fff"}
        strokeWidth={isSea ? 1 : 3}
        strokeOpacity="0.8"
      />
      
      {/* Port Rendering */}
      {hasPort && (
        <g transform={`translate(${x}, ${y}) rotate(${data.rotation || 0})`}>
          {/* Connector line (dock) */}
          <rect x="-4" y={-size * 0.8} width="8" height={size * 0.4} fill="#8B4513" />
          
          {/* Port Circle Background */}
          <circle 
            cx="0" 
            cy={-size * 0.5} 
            r={size * 0.3} 
            fill="white" 
            stroke="#8B4513" 
            strokeWidth="2" 
          />
          {/* Port Icon/Text */}
          <text 
            x="0" 
            y={-size * 0.5} 
            textAnchor="middle" 
            alignmentBaseline="middle" 
            fontSize={size * 0.3}
            fill={data.port === PortType.GENERIC ? '#333' : '#000'}
            dy=".1em"
          >
            {PortLabels[data.port!]}
          </text>
          {/* 3:1 or 2:1 text */}
          <text 
             x="0" 
             y={-size * 0.2} 
             textAnchor="middle" 
             fontSize={size * 0.15}
             fontWeight="bold"
             fill="#333"
          >
            {data.port === PortType.GENERIC ? '3:1' : '2:1'}
          </text>
        </g>
      )}

      {/* Resource Icon (Only for Land) */}
      {!isSea && (
        <>
          <circle cx={x} cy={y} r={size * 0.35} fill="rgba(255,255,255,0.85)" stroke="#ccc" strokeWidth="1" />
          <text x={x} y={y - size * 0.5} textAnchor="middle" fontSize={size * 0.4} className="select-none pointer-events-none">
            {ResourceLabels[data.resource]}
          </text>
        </>
      )}

      {/* Number Token */}
      {data.number && (
        <g>
          <circle cx={x} cy={y} r={size * 0.25} fill="#fefefe" stroke="#333" strokeWidth="1" />
          <text
            x={x}
            y={y + size * 0.08}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={isRed ? '#e74c3c' : '#333'}
            fontWeight="bold"
            fontSize={size * 0.25}
            className="select-none pointer-events-none"
          >
            {data.number}
          </text>
           <text
            x={x}
            y={y + size * 0.18}
            textAnchor="middle"
            fontSize={size * 0.1}
            fill={isRed ? '#e74c3c' : '#333'}
            className="select-none pointer-events-none"
          >
             {'.'.repeat(dots)}
          </text>
        </g>
      )}
    </g>
  );
};

export default Hex;