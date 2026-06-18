import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import Sparkles from 'react-sparkle';

const ImagePreview = ({
  image,
  tool,
  brushSize,
  onChangeMask,
  isLoading,
}: {
  image: string;
  tool: 'brush' | 'eraser';
  brushSize: number;
  onChangeMask: (mask: string) => void;
  isLoading: boolean;
}) => {
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);

  // Drawing handlers
  const handleMouseDown = (e: any) => {
    setDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        tool,
        points: [pos.x, pos.y],
        stroke: tool === 'brush' ? 'rgb(230 0 0 / 40%)' : '#fff',
        strokeWidth: brushSize,
        globalCompositeOperation: tool === 'brush' ? 'source-over' : 'destination-out',
      },
    ]);
  };
  const handleMouseMove = (e: any) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const newLines = [...lines];
    newLines[newLines.length - 1].points = newLines[newLines.length - 1].points.concat([
      point.x,
      point.y,
    ]);
    setLines(newLines);
  };

  // Export mask as black-and-white PNG at original image size
  const handleExportMask = () => {
    if (image && imageRef.current) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;

      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, naturalWidth, naturalHeight);

      // Draw all lines
      lines.forEach((line) => {
        ctx.save();
        ctx.beginPath();
        const points = line.points;
        ctx.moveTo(
          points[0] * (naturalWidth / canvasDims.width),
          points[1] * (naturalHeight / canvasDims.height),
        );
        for (let i = 2; i < points.length; i += 2) {
          ctx.lineTo(
            points[i] * (naturalWidth / canvasDims.width),
            points[i + 1] * (naturalHeight / canvasDims.height),
          );
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = line.strokeWidth * (naturalWidth / canvasDims.width);
        // Always use source-over for mask export
        ctx.globalCompositeOperation = 'source-over';
        // Brush draws white, eraser draws black
        ctx.strokeStyle = line.tool === 'brush' ? '#fff' : '#000';
        ctx.stroke();
        ctx.restore();
      });

      // Export as PNG
      const uri = canvas.toDataURL('image/png');
      onChangeMask(uri);
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    handleExportMask();
  };

  // Mouse move for custom cursor
  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage?.();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (point) {
      setCursorPos({ x: point.x, y: point.y });
    }
  };
  const handleStageMouseLeave = () => {
    setCursorPos(null);
  };

  useEffect(() => {
    function updateDims() {
      if (imageRef.current) {
        setCanvasDims({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    }
    setTimeout(() => {
      updateDims();
    }, 200);
    window.addEventListener('resize', updateDims);

    return () => window.removeEventListener('resize', updateDims);
  }, [image]);

  useEffect(() => {
    setLines([]);
  }, [image]);

  return (
    <div className="relative flex max-h-[500px] min-h-[300px] w-full items-center justify-center p-2 md:h-full md:max-h-full md:min-h-0 md:w-[60%] md:px-2 md:py-0">
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: canvasDims.width,
            height: canvasDims.height,
            zIndex: 2,
          }}
        >
          <Sparkles
            color="red"
            count={20}
            minSize={10}
            maxSize={16}
            overflowPx={0}
            fadeOutSpeed={10}
            flicker={false}
          />
        </div>
      )}
      <img
        ref={imageRef}
        src={image}
        alt="image"
        className="max-h-full max-w-full object-contain"
      />
      {canvasDims.width > 0 && canvasDims.height > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: canvasDims.width,
            height: canvasDims.height,
            zIndex: 1,
          }}
        >
          <Stage
            ref={stageRef}
            width={canvasDims.width}
            height={canvasDims.height}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              cursor: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMousemove={(e: KonvaEventObject<MouseEvent>) => {
              handleMouseMove(e);
              handleStageMouseMove(e);
            }}
            onMouseup={handleMouseUp}
            onMouseLeave={handleStageMouseLeave}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation={line.globalCompositeOperation}
                  lineJoin="round"
                  draggable={false}
                />
              ))}
              {/* Custom cursor */}
              {cursorPos && (
                <>
                  <Line
                    points={[]}
                    stroke={tool === 'brush' ? 'rgb(230 0 0 / 40%)' : '#fff'}
                    strokeWidth={brushSize}
                    x={cursorPos.x}
                    y={cursorPos.y}
                    globalCompositeOperation="source-over"
                    opacity={0}
                  />
                  <Circle
                    x={cursorPos.x}
                    y={cursorPos.y}
                    radius={brushSize / 2}
                    stroke={tool === 'brush' ? 'rgb(230 0 0 / 80%)' : '#fff'}
                    strokeWidth={2}
                    fill={tool === 'brush' ? 'rgb(230 0 0 / 20%)' : 'rgba(255,255,255,0.15)'}
                    listening={false}
                  />
                </>
              )}
            </Layer>
          </Stage>
        </div>
      )}
      {isLoading && <div className="absolute inset-0 z-[3] size-full" />}
    </div>
  );
};

export default ImagePreview;
