
import React, { useEffect, useRef } from 'react';
import { CymaticsSafetyConfig } from '../types';

interface CymaticsVisualizerProps {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  isPlaying: boolean;
  config?: CymaticsSafetyConfig;
}

export const CymaticsVisualizer: React.FC<CymaticsVisualizerProps> = ({
  audioContext,
  analyser,
  isPlaying,
  config = {
    maxFrequency: 5000,
    syncToAudio: true,
    fftSize: 2048,
    smoothingTimeConstant: 0.8
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = config.fftSize;
    analyser.smoothingTimeConstant = config.smoothingTimeConstant;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(11, 12, 21, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.beginPath();
      ctx.strokeStyle = '#FFB000'; 
      ctx.lineWidth = 2;

      for (let i = 0; i < bufferLength; i++) {
        const amplitude = dataArray[i] / 255.0;
        if (amplitude > 0.1) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const radius = (amplitude * canvas.height / 3) * Math.sin(angle * 5 + Date.now() * 0.001);
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      const peaks = [dataArray[10], dataArray[50], dataArray[100]];
      peaks.forEach((peak, idx) => {
        const r = (peak / 255) * 100;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * (idx + 1), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 176, 0, ${0.1 * (idx + 1)})`;
        ctx.stroke();
      });
    };

    draw();
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, analyser, config]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={800} 
      className="w-full h-full rounded-lg bg-[#0B0C15]"
    />
  );
};
export default CymaticsVisualizer;
