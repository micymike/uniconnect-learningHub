import React, { useRef, useEffect, useState } from 'react';

interface MathAnimatorProps {
  equation: string;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

const MathAnimator: React.FC<MathAnimatorProps> = ({ 
  equation, 
  isAnimating, 
  onAnimationComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 60; // 2 seconds at 30fps

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated equation
      const progress = frame / maxFrames;
      const visibleChars = Math.floor(equation.length * progress);
      const visibleEquation = equation.substring(0, visibleChars);

      // Set text properties
      ctx.fillStyle = '#f97316';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw equation with typewriter effect
      ctx.fillText(visibleEquation, canvas.width / 2, canvas.height / 2);

      // Add cursor effect
      if (visibleChars < equation.length && Math.floor(frame / 10) % 2 === 0) {
        const cursorX = ctx.measureText(visibleEquation).width / 2 + canvas.width / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cursorX, canvas.height / 2 - 16, 2, 32);
      }

      frame++;
      setAnimationFrame(frame);

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        onAnimationComplete?.();
      }
    };

    animate();
  }, [equation, isAnimating, onAnimationComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full h-32 bg-gray-800 rounded-lg border border-gray-600"
    />
  );
};

export default MathAnimator;