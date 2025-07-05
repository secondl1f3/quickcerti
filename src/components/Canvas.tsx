import React, { forwardRef, useCallback, useState, useRef } from 'react';
import { DesignElement, Tool } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { Grid } from './Grid';

interface CanvasProps {
  activeTool: Tool;
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  onCanvasClick: (e: React.MouseEvent) => void;
  onElementClick: (element: DesignElement, e: React.MouseEvent) => void;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onElementAdd: (element: DesignElement) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  activeTool,
  elements,
  selectedElement,
  onCanvasClick,
  onElementClick,
  onElementUpdate,
  onElementAdd,
}, ref) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (activeTool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        
        const newElement: DesignElement = {
          id: Date.now().toString(),
          type: 'text',
          position: { x, y },
          size: { width: 200, height: 40 },
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          text: 'New Text',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            textAlign: 'left',
          },
        };
        
        onElementAdd(newElement);
      }
    }
  }, [activeTool, zoom, pan, elements.length, onElementAdd]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && activeTool === 'pan') {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, activeTool, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  return (
    <div className="flex-1 bg-gray-100 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md px-3 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Zoom:</span>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(1)}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={onCanvasClick}
        style={{
          cursor: activeTool === 'pan' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair'
        }}
      >
        <div
          className="relative bg-white shadow-lg"
          style={{
            width: 800 * zoom,
            height: 600 * zoom,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            margin: '100px auto',
          }}
        >
          <Grid zoom={zoom} />
          
          {elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                zoom={zoom}
                onClick={(e) => onElementClick(element, e)}
                onUpdate={(updates) => onElementUpdate(element.id, updates)}
              />
            ))}
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';