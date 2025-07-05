import React from 'react';

interface GridProps {
  zoom: number;
}

export const Grid: React.FC<GridProps> = ({ zoom }) => {
  const gridSize = 20 * zoom;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};