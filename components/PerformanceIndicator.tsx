import React, { useState, useEffect, useRef } from 'react';
import { X, Activity, Cpu, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';

/**
 * PerformanceIndicator
 *
 * Real-time performance monitoring overlay for the visualizer.
 * Shows FPS, frame time, renderer type, and quality indicators.
 *
 * Features:
 * - Color-coded FPS badge (green >50, yellow 30-50, red <30)
 * - Frame time graph (last 60 frames)
 * - Renderer type indicator (WebGL/Canvas2D/Cymatics)
 * - Minimizable/dismissable with localStorage persistence
 * - Respects reduceMotion setting
 */

export interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    mode: string;
    renderer: 'webgl' | 'canvas2d' | 'cymatics';
}

interface PerformanceIndicatorProps {
    metrics: PerformanceMetrics | null;
    onClose?: () => void;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ metrics, onClose }) => {
    const { reduceMotion } = useMotion();
    const [minimized, setMinimized] = useState(() => {
        return localStorage.getItem('synsync_perf_minimized') === 'true';
    });
    const [frameHistory, setFrameHistory] = useState<number[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Update frame history
    useEffect(() => {
        if (!metrics) return;
        setFrameHistory(prev => {
            const next = [...prev, metrics.frameTime];
            return next.slice(-60); // Keep last 60 frames (1 second @ 60fps)
        });
    }, [metrics]);

    // Draw frame time graph
    useEffect(() => {
        if (!canvasRef.current || frameHistory.length === 0 || minimized) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const maxFrameTime = 33.33; // 30fps threshold

        // Clear
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);

        // Draw 16ms and 33ms reference lines
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(0, height * (1 - 16.67 / maxFrameTime));
        ctx.lineTo(width, height * (1 - 16.67 / maxFrameTime));
        ctx.stroke();

        ctx.strokeStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, height * (1 - 33.33 / maxFrameTime));
        ctx.lineTo(width, height * (1 - 33.33 / maxFrameTime));
        ctx.stroke();

        // Draw frame time line
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#25f4e2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        frameHistory.forEach((frameTime, i) => {
            const x = (i / 59) * width;
            const y = height * (1 - Math.min(frameTime, maxFrameTime) / maxFrameTime);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw current point
        if (frameHistory.length > 0) {
            const lastFrameTime = frameHistory[frameHistory.length - 1];
            const x = width;
            const y = height * (1 - Math.min(lastFrameTime, maxFrameTime) / maxFrameTime);
            ctx.fillStyle = '#25f4e2';
            ctx.beginPath();
            ctx.arc(x - 2, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [frameHistory, minimized]);

    // Toggle minimized state
    const toggleMinimized = () => {
        const next = !minimized;
        setMinimized(next);
        localStorage.setItem('synsync_perf_minimized', String(next));
    };

    // Get FPS badge color
    const getFPSBadgeColor = (fps: number) => {
        if (fps >= 50) return { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400' };
        if (fps >= 30) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' };
        return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' };
    };

    // Get renderer icon and color
    const getRendererInfo = (renderer: string) => {
        if (renderer === 'webgl') return { icon: Cpu, color: 'text-green-400', label: 'WebGL' };
        if (renderer === 'cymatics') return { icon: Activity, color: 'text-blue-400', label: 'Cymatics' };
        return { icon: Eye, color: 'text-yellow-400', label: 'Canvas2D' };
    };

    if (!metrics) return null;

    const fpsColors = getFPSBadgeColor(metrics.fps);
    const rendererInfo = getRendererInfo(metrics.renderer);
    const RendererIcon = rendererInfo.icon;

    if (minimized) {
        return (
            <div
                className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-neuro-500/30 rounded-lg px-3 py-2 shadow-lg"
                style={{ backdropFilter: 'blur(12px)' }}
            >
                {/* FPS Badge */}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${fpsColors.bg} border ${fpsColors.border}`}>
                    <Activity className={`w-3 h-3 ${fpsColors.text}`} />
                    <span className={`text-xs font-mono font-bold ${fpsColors.text}`}>
                        {metrics.fps}
                    </span>
                </div>

                {/* Expand button */}
                <button
                    onClick={toggleMinimized}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                    aria-label="Expand performance metrics"
                >
                    <ChevronDown className="w-4 h-4 text-white/60" />
                </button>
            </div>
        );
    }

    return (
        <div
            className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-md border border-neuro-500/30 rounded-xl p-4 shadow-2xl"
            style={{ width: 280, backdropFilter: 'blur(12px)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neuro-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Performance
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleMinimized}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                        aria-label="Minimize"
                    >
                        <ChevronUp className="w-4 h-4 text-white/60" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-3.5 h-3.5 text-white/60" />
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {/* FPS */}
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${fpsColors.bg} ${fpsColors.border}`}>
                    <span className="text-[9px] text-gray-400 uppercase font-mono mb-1">FPS</span>
                    <span className={`text-2xl font-mono font-bold ${fpsColors.text}`}>
                        {metrics.fps}
                    </span>
                </div>

                {/* Frame Time */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-neuro-500/10 border-neuro-500/30">
                    <span className="text-[9px] text-gray-400 uppercase font-mono mb-1">Frame</span>
                    <span className="text-2xl font-mono font-bold text-neuro-300">
                        {metrics.frameTime.toFixed(1)}
                        <span className="text-xs ml-0.5">ms</span>
                    </span>
                </div>
            </div>

            {/* Frame Time Graph */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-gray-500 uppercase font-mono">Frame Time History</span>
                    <span className="text-[9px] text-gray-600 font-mono">60 frames</span>
                </div>
                <div className="relative bg-black/40 border border-neuro-700/30 rounded-lg overflow-hidden" style={{ height: 60 }}>
                    <canvas
                        ref={canvasRef}
                        width={248}
                        height={60}
                        className="w-full h-full"
                    />
                    {/* Reference labels */}
                    <div className="absolute top-1 left-1 text-[8px] text-green-400/50 font-mono">60fps</div>
                    <div className="absolute bottom-1 left-1 text-[8px] text-orange-400/50 font-mono">30fps</div>
                </div>
            </div>

            {/* Renderer Info */}
            <div className="flex items-center justify-between p-2 bg-neuro-800/30 border border-neuro-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <RendererIcon className={`w-4 h-4 ${rendererInfo.color}`} />
                    <div>
                        <div className="text-xs font-medium text-white">{rendererInfo.label}</div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase">{metrics.mode}</div>
                    </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${reduceMotion ? '' : 'animate-pulse'} ${
                    metrics.fps >= 50 ? 'bg-green-500' : metrics.fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
            </div>

            {/* Quality Indicator */}
            <div className="mt-2 text-center">
                <span className="text-[9px] text-gray-600 uppercase font-mono tracking-wider">
                    {metrics.fps >= 50 ? '✓ Optimal Performance' :
                     metrics.fps >= 30 ? '⚠ Acceptable Performance' :
                     '✗ Poor Performance'}
                </span>
            </div>
        </div>
    );
};

/**
 * PerformanceIndicatorToggle
 *
 * Small button to toggle the performance indicator.
 * Can be placed anywhere in the UI.
 */
interface PerformanceIndicatorToggleProps {
    visible: boolean;
    onToggle: () => void;
}

export const PerformanceIndicatorToggle: React.FC<PerformanceIndicatorToggleProps> = ({
    visible,
    onToggle
}) => {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                visible
                    ? 'bg-neuro-500/20 border-neuro-500/40 text-neuro-300'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
            }`}
            aria-label={visible ? 'Hide performance metrics' : 'Show performance metrics'}
            aria-pressed={visible}
        >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider">
                {visible ? 'Perf' : 'Stats'}
            </span>
        </button>
    );
};
