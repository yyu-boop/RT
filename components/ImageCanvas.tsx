
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoundingBox, DefectLabels } from '../types';

interface ImageCanvasProps {
  imageUrl: string;
  onAddDefect: (box: BoundingBox) => void;
  userDefects: BoundingBox[];
  truthDefects?: BoundingBox[];
  showTruth?: boolean;
  disabled?: boolean;
  isStarted: boolean;
  brightness: number; 
  contrast: number; 
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ 
  imageUrl, 
  onAddDefect, 
  userDefects, 
  truthDefects,
  showTruth = false,
  disabled = false,
  isStarted,
  brightness,
  contrast
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [pendingBox, setPendingBox] = useState<BoundingBox | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 应用平移和缩放
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 统一绘制逻辑：使用 normalized 坐标转换回 canvas 基础坐标 (scale=1 时的坐标)
    const drawBox = (box: BoundingBox, color: string, label?: string, isDashed = false) => {
      const w = box.w * canvas.width;
      const h = box.h * canvas.height;
      const x = box.x * canvas.width - w / 2;
      const y = box.y * canvas.height - h / 2;

      if (isDashed) ctx.setLineDash([5 / scale, 5 / scale]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      if (label) {
        ctx.fillStyle = color;
        ctx.font = `${Math.max(10 / scale, 8)}px sans-serif`;
        ctx.fillText(label, x, y - (5 / scale));
      }
      
      if (!isDashed) {
        ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('#', 'rgba('); // Simple opacity hack
        // Since the above is risky with hex, use a standard semi-transparent fill
        ctx.fillStyle = color === '#3B82F6' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(x, y, w, h);
      }
    };

    userDefects.forEach((box) => {
      drawBox(box, '#3B82F6', DefectLabels[box.type]);
    });

    if (showTruth && truthDefects) {
      truthDefects.forEach((box) => {
        drawBox(box, '#EF4444', `正确: ${DefectLabels[box.type]}`, true);
      });
    }

    if (isDrawing) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const w = Math.abs(startPos.x - currentPos.x);
      const h = Math.abs(startPos.y - currentPos.y);
      
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(x, y, w, h);
    }

    ctx.restore();
  }, [userDefects, isDrawing, startPos, currentPos, showTruth, truthDefects, scale, offset]);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas && containerRef.current) {
        const container = containerRef.current;
        const width = container.clientWidth;
        const aspect = img.height / img.width;
        canvas.width = width;
        canvas.height = width * aspect;
        draw();
      }
    };
  }, [imageUrl, draw]);

  useEffect(() => {
    draw();
  }, [brightness, contrast, draw, scale, offset]);

  const handleWheel = (e: React.WheelEvent) => {
    if (disabled || !isStarted) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // 侦测鼠标当前位置是否在图片内部
    const isMouseInImage = mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height;

    // 计算缩放参考点
    const px = isMouseInImage ? (mx - offset.x) / scale : 0;
    const py = isMouseInImage ? (my - offset.y) / scale : 0;

    const delta = -e.deltaY;
    const factor = 1.15;
    let nextScale = delta > 0 ? scale * factor : scale / factor;
    nextScale = Math.max(1, Math.min(nextScale, 25)); // 最大缩放倍数
    
    let nextOffsetX = isMouseInImage ? mx - px * nextScale : offset.x;
    let nextOffsetY = isMouseInImage ? my - py * nextScale : offset.y;

    // 限制 Y 偏移，防止图片移出视野
    const limitOffset = (s: number, ox: number, oy: number) => {
      const maxX = 0;
      const minX = -(canvas.width * (s - 1));
      const maxY = 0;
      const minY = -(canvas.height * (s - 1));
      return {
        x: Math.min(maxX, Math.max(minX, ox)),
        y: Math.min(maxY, Math.max(minY, oy))
      };
    };

    const finalOffset = limitOffset(nextScale, nextOffsetX, nextOffsetY);
    setScale(nextScale);
    setOffset(nextScale === 1 ? { x: 0, y: 0 } : finalOffset);
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // 返回的是相对于 scale=1 时 canvas 的坐标
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || showTypeSelector || !isStarted) return;
    
    // Alt + 右键 长按拖动
    if (e.altKey && e.button === 2) {
       setIsPanning(true);
       setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
       return;
    }

    // 左键 框选
    if (e.button === 0) {
      const pos = getMousePos(e);
      setIsDrawing(true);
      setStartPos(pos);
      setCurrentPos(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newOffsetX = e.clientX - panStart.x;
      const newOffsetY = e.clientY - panStart.y;
      const canvas = canvasRef.current;
      if (canvas) {
        const maxX = 0;
        const minX = -(canvas.width * (scale - 1));
        const maxY = 0;
        const minY = -(canvas.height * (scale - 1));
        setOffset({
          x: Math.min(maxX, Math.max(minX, newOffsetX)),
          y: Math.min(maxY, Math.max(minY, newOffsetY))
        });
      }
      return;
    }

    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPos(pos);
    draw();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(startPos.x - currentPos.x);
    const h = Math.abs(startPos.y - currentPos.y);

    if (w < 2 || h < 2) return;

    // 存储 normalized 坐标 (0-1)，确保在缩放改变后仍能正确显示
    setPendingBox({
      type: 0, // Placeholder
      x: (x + w / 2) / canvas.width,
      y: (y + h / 2) / canvas.height,
      w: w / canvas.width,
      h: h / canvas.height
    });
    setShowTypeSelector(true);
  };

  const selectType = (type: number) => {
    if (pendingBox) {
      onAddDefect({ ...pendingBox, type });
      setPendingBox(null);
      setShowTypeSelector(false);
    }
  };

  return (
    <div 
      className="relative border bg-black rounded-lg overflow-hidden group touch-none" 
      ref={containerRef}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        style={{ 
          filter: `brightness(${brightness}) contrast(${contrast})`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'top left'
        }}
        className="pointer-events-none transition-transform duration-75 ease-out"
      >
        <img 
          src={imageUrl} 
          alt="Radiograph" 
          className="block w-full h-auto select-none"
        />
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`absolute top-0 left-0 w-full h-full cursor-crosshair ${disabled ? 'pointer-events-none' : ''}`}
      />

      {/* 初始状态蒙版：80%白色蒙版 */}
      {!isStarted && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20 transition-opacity duration-500">
           <div className="text-center px-8 py-6 bg-white/60 rounded-3xl shadow-xl border border-white/40">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-blue-700 font-extrabold text-2xl tracking-tight">评片训练已就绪</p>
              <p className="text-gray-500 text-sm mt-2 font-medium">请点击下方“开始评片”按钮激活数字化底片</p>
           </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-mono pointer-events-none z-30 border border-white/20">
        SCALE: {scale.toFixed(1)}x
      </div>

      {showTypeSelector && pendingBox && (
        <div 
          className="absolute z-40 bg-white/95 p-5 rounded-2xl shadow-2xl border border-blue-200 backdrop-blur-lg"
          style={{ 
            left: '50%', 
            bottom: '30px',
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-sm font-bold mb-4 text-gray-800 text-center border-b pb-2">请选择缺陷类型</p>
          <div className="flex flex-row gap-3">
            {Object.entries(DefectLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => selectType(parseInt(key))}
                className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-xs font-bold whitespace-nowrap shadow-sm border border-blue-100 active:scale-95"
              >
                {label}
              </button>
            ))}
            <div className="w-px bg-gray-200 mx-1"></div>
            <button 
              onClick={() => setShowTypeSelector(false)}
              className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all text-xs font-bold whitespace-nowrap shadow-sm border border-red-100 active:scale-95"
            >
              取消标定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCanvas;
