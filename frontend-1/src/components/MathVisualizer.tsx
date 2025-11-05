import React, { useRef, useEffect } from 'react';

interface MathVisualizerProps {
  equation: string;
  type: 'linear' | 'arithmetic' | 'geometry';
  progress: number;
}

const MathVisualizer: React.FC<MathVisualizerProps> = ({ equation, type, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (type) {
      case 'linear':
        drawLinearGraph(ctx, equation, progress);
        break;
      case 'arithmetic':
        drawArithmeticBlocks(ctx, equation, progress);
        break;
      case 'geometry':
        drawGeometryShape(ctx, equation, progress);
        break;
    }
  }, [equation, type, progress]);

  const drawLinearGraph = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    // Draw coordinate system
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(350, 150);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(200, 50);
    ctx.lineTo(200, 190);
    ctx.stroke();
    
    // Draw line with animation
    if (progress > 0) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 100);
      const endX = 50 + (300 * progress);
      const endY = 100 + (50 * progress);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw point
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawArithmeticBlocks = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    const match = equation.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (!match) return;
    
    const num1 = Math.min(parseInt(match[1]), 10);
    const operator = match[2];
    const num2 = Math.min(parseInt(match[3]), 10);
    
    const blockSize = 15;
    
    // First number blocks
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < num1 && i < num1 * progress; i++) {
      const x = 50 + (i % 5) * (blockSize + 2);
      const y = 100 + Math.floor(i / 5) * (blockSize + 2);
      ctx.fillRect(x, y, blockSize, blockSize);
    }
    
    // Operator
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(operator, 200, 120);
    
    // Second number blocks
    if (progress > 0.5) {
      ctx.fillStyle = '#ef4444';
      for (let i = 0; i < num2 && i < num2 * (progress - 0.5) * 2; i++) {
        const x = 250 + (i % 5) * (blockSize + 2);
        const y = 100 + Math.floor(i / 5) * (blockSize + 2);
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  };

  const drawGeometryShape = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    const width = 120 * progress;
    const height = 80 * progress;
    const x = 200 - width/2;
    const y = 100 - height/2;
    
    // Rectangle
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Fill animation
    ctx.fillStyle = `rgba(249, 115, 22, ${progress * 0.3})`;
    ctx.fillRect(x, y, width, height);
    
    // Labels
    if (progress > 0.7) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('w', x + width/2, y - 5);
      ctx.fillText('h', x - 10, y + height/2);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 bg-gray-900 rounded border border-gray-600"
    />
  );
};

export default MathVisualizer;