import React, { useRef, useEffect, useState } from 'react';
import { DrawingStroke, DrawingPoint } from '../types';
import { syncService } from '../services/syncService';

interface PresenterToolsOverlayProps {
  role: 'presenter' | 'attendee';
  activeTool: 'laser' | 'spotlight' | 'pen' | 'none';
  strokes: DrawingStroke[];
  setStrokes: React.Dispatch<React.SetStateAction<DrawingStroke[]>>;
  remotePointer: { x: number; y: number; active: boolean; tool: 'laser' | 'spotlight' | 'pen' | 'none' } | null;
}

export const PresenterToolsOverlay: React.FC<PresenterToolsOverlayProps> = ({
  role,
  activeTool,
  strokes,
  setStrokes,
  remotePointer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localPointer, setLocalPointer] = useState<{ x: number; y: number; active: boolean }>({ x: -100, y: -100, active: false });
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingPoint[]>([]);

  // Redraw canvas whenever strokes change or resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.moveTo(stroke.points[0].x * rect.width, stroke.points[0].y * rect.height);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * rect.width, stroke.points[i].y * rect.height);
      }
      ctx.stroke();
    });
  }, [strokes]);

  // Handle Mouse movement for Presenter
  const handleMouseMove = (e: React.MouseEvent) => {
    if (role !== 'presenter' || activeTool === 'none') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    setLocalPointer({ x: normX, y: normY, active: true });

    // Broadcast pointer
    syncService.send({
      type: 'POINTER_MOVE',
      pointer: { x: normX, y: normY, active: true, tool: activeTool },
      timestamp: Date.now()
    });

    // Handle pen drawing
    if (activeTool === 'pen' && isDrawing) {
      currentStrokeRef.current.push({ x: normX, y: normY });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && currentStrokeRef.current.length > 1) {
        const pts = currentStrokeRef.current;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const p1 = pts[pts.length - 2];
        const p2 = pts[pts.length - 1];
        ctx.moveTo(p1.x * rect.width, p1.y * rect.height);
        ctx.lineTo(p2.x * rect.width, p2.y * rect.height);
        ctx.stroke();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (role !== 'presenter' || activeTool !== 'pen') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDrawing(true);
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    currentStrokeRef.current = [{ x: normX, y: normY }];
  };

  const handleMouseUp = () => {
    if (role !== 'presenter' || activeTool !== 'pen' || !isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 1) {
      const newStroke: DrawingStroke = {
        points: [...currentStrokeRef.current],
        color: '#f43f5e',
        width: 4
      };
      setStrokes((prev) => [...prev, newStroke]);
      syncService.send({
        type: 'DRAW_STROKE',
        stroke: newStroke,
        timestamp: Date.now()
      });
    }
    currentStrokeRef.current = [];
  };

  const handleMouseLeave = () => {
    if (role === 'presenter') {
      setLocalPointer((prev) => ({ ...prev, active: false }));
      syncService.send({
        type: 'POINTER_MOVE',
        pointer: { x: -100, y: -100, active: false, tool: 'none' },
        timestamp: Date.now()
      });
      if (isDrawing) handleMouseUp();
    }
  };

  // Determine current effective pointer & tool
  const effectivePointer = role === 'presenter' ? localPointer : remotePointer;
  const effectiveTool = role === 'presenter' ? activeTool : (remotePointer?.tool || 'none');

  const showLaser = effectiveTool === 'laser' && effectivePointer?.active;
  const showSpotlight = effectiveTool === 'spotlight' && effectivePointer?.active;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 z-20 ${
        role === 'presenter' && (activeTool === 'pen' || activeTool === 'laser' || activeTool === 'spotlight')
          ? 'cursor-crosshair pointer-events-auto'
          : 'pointer-events-none'
      }`}
    >
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Spotlight Effect (Radial mask) */}
      {showSpotlight && effectivePointer && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-75"
          style={{
            background: `radial-gradient(circle 140px at ${effectivePointer.x * 100}% ${effectivePointer.y * 100}%, transparent 95%, rgba(0, 0, 0, 0.78) 100%)`
          }}
        />
      )}

      {/* Laser Pointer Glowing Red Dot */}
      {showLaser && effectivePointer && (
        <div
          className="absolute pointer-events-none transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${effectivePointer.x * 100}%`,
            top: `${effectivePointer.y * 100}%`
          }}
        >
          <div className="w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_15px_4px_rgba(244,63,94,0.9)] animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-white scale-50 opacity-90" />
        </div>
      )}
    </div>
  );
};
