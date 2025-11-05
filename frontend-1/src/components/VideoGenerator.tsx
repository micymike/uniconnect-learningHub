import React, { useRef, useEffect, useState } from 'react';

interface MathStep {
  step: number;
  description: string;
  equation: string;
  explanation: string;
}

interface VideoGeneratorProps {
  steps: MathStep[];
  isPlaying: boolean;
  onComplete: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ steps, isPlaying, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    let stepIndex = 0;
    let progress = 0;
    const stepDuration = 3000; // 3 seconds per step

    const animate = () => {
      if (stepIndex >= steps.length) {
        onComplete();
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentStepData = steps[stepIndex];
      
      // Draw step title
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Step ${currentStepData.step}: ${currentStepData.description}`, 400, 80);

      // Animate equation writing
      const equation = currentStepData.equation;
      const visibleChars = Math.floor(equation.length * (progress / stepDuration));
      const visibleEquation = equation.substring(0, visibleChars);

      // Draw equation with typewriter effect
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px monospace';
      ctx.fillText(visibleEquation, 400, 200);

      // Draw cursor
      if (visibleChars < equation.length) {
        const textWidth = ctx.measureText(visibleEquation).width;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(400 + textWidth/2 + 5, 180, 3, 40);
      }

      // Draw explanation with fade-in effect
      if (progress > stepDuration * 0.6) {
        const alpha = Math.min(1, (progress - stepDuration * 0.6) / (stepDuration * 0.4));
        ctx.fillStyle = `rgba(209, 213, 219, ${alpha})`;
        ctx.font = '20px Arial';
        
        // Word wrap explanation
        const words = currentStepData.explanation.split(' ');
        let line = '';
        let y = 300;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > 700 && n > 0) {
            ctx.fillText(line, 400, y);
            line = words[n] + ' ';
            y += 30;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 400, y);
      }

      // Draw progress bar
      ctx.fillStyle = '#374151';
      ctx.fillRect(50, 550, 700, 10);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(50, 550, (700 * progress) / stepDuration, 10);

      // Mathematical visualization based on equation type
      drawMathVisualization(ctx, currentStepData, progress / stepDuration);

      progress += 50; // ~20fps
      setCurrentStep(stepIndex + 1);
      setAnimationProgress(progress / stepDuration);

      if (progress >= stepDuration) {
        stepIndex++;
        progress = 0;
      }

      if (isPlaying) {
        setTimeout(() => requestAnimationFrame(animate), 50);
      }
    };

    animate();
  }, [isPlaying, steps, onComplete]);

  const drawMathVisualization = (ctx: CanvasRenderingContext2D, step: MathStep, progress: number) => {
    const equation = step.equation.toLowerCase();
    
    // Linear equation visualization
    if (equation.includes('x') && equation.includes('=')) {
      drawLinearEquationViz(ctx, equation, progress);
    }
    // Arithmetic visualization
    else if (equation.match(/\d+\s*[+\-*/]\s*\d+/)) {
      drawArithmeticViz(ctx, equation, progress);
    }
    // Geometry visualization
    else if (equation.includes('area') || equation.includes('×')) {
      drawGeometryViz(ctx, equation, progress);
    }
  };

  const drawLinearEquationViz = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    // Draw balance scale animation
    const scaleY = 400;
    const leftX = 200;
    const rightX = 600;
    
    // Scale base
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftX, scaleY);
    ctx.lineTo(rightX, scaleY);
    ctx.moveTo(400, scaleY);
    ctx.lineTo(400, scaleY + 30);
    ctx.stroke();
    
    // Animate balance plates
    const tilt = Math.sin(progress * Math.PI) * 10;
    
    // Left plate
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(leftX - 50, scaleY - 20 + tilt, 100, 20);
    
    // Right plate  
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rightX - 50, scaleY - 20 - tilt, 100, 20);
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Left Side', leftX, scaleY + 60);
    ctx.fillText('Right Side', rightX, scaleY + 60);
  };

  const drawArithmeticViz = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    // Draw counting blocks or visual representation
    const match = equation.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (!match) return;
    
    const num1 = parseInt(match[1]);
    const operator = match[2];
    const num2 = parseInt(match[3]);
    
    const blockSize = 20;
    const startX = 100;
    const startY = 350;
    
    // Draw first number as blocks
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < Math.min(num1, 20); i++) {
      const x = startX + (i % 10) * (blockSize + 2);
      const y = startY + Math.floor(i / 10) * (blockSize + 2);
      const alpha = Math.min(1, progress * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
    
    // Draw operator
    ctx.fillStyle = '#f97316';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(operator, 400, 380);
    
    // Draw second number as blocks
    if (progress > 0.5) {
      ctx.fillStyle = '#ef4444';
      for (let i = 0; i < Math.min(num2, 20); i++) {
        const x = 500 + (i % 10) * (blockSize + 2);
        const y = startY + Math.floor(i / 10) * (blockSize + 2);
        const alpha = Math.min(1, (progress - 0.5) * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  };

  const drawGeometryViz = (ctx: CanvasRenderingContext2D, equation: string, progress: number) => {
    // Draw rectangle with dimensions
    const rectX = 300;
    const rectY = 350;
    const width = 200 * progress;
    const height = 100 * progress;
    
    // Rectangle outline
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.strokeRect(rectX, rectY, width, height);
    
    // Fill animation
    ctx.fillStyle = `rgba(249, 115, 22, ${progress * 0.3})`;
    ctx.fillRect(rectX, rectY, width, height);
    
    // Dimension labels
    if (progress > 0.7) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('length', rectX + width/2, rectY - 10);
      ctx.save();
      ctx.translate(rectX - 20, rectY + height/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillText('width', 0, 0);
      ctx.restore();
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-96 bg-gray-900 rounded-lg border border-gray-600"
        style={{ maxWidth: '800px', height: '400px' }}
      />
      {isPlaying && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
          Step {currentStep} of {steps.length}
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;