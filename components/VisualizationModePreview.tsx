import React from 'react';
import { useMotion } from '../contexts/MotionContext';

/**
 * VisualizationModePreview
 *
 * Animated SVG previews for each visualization mode.
 * Used in mode selection UI to show what each mode looks like.
 *
 * Respects reduceMotion accessibility setting.
 */

interface VisualizationModePreviewProps {
    mode: 'neural' | 'cosmic' | 'hyper' | 'symmetry' | 'galactic' | 'cyber' | 'dmt' |
          'spectrum' | 'waveform' | 'oscilloscope' | 'pulse' | 'fractal' | 'sacred_geometry' | 'cymatics';
    size?: number;
    animated?: boolean;
}

export const VisualizationModePreview: React.FC<VisualizationModePreviewProps> = ({
    mode,
    size = 120,
    animated = true
}) => {
    const { reduceMotion } = useMotion();
    const shouldAnimate = animated && !reduceMotion;

    // Neural Network - Voronoi cells with pulsing connections
    if (mode === 'neural') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="neural-glow">
                        <stop offset="0%" stopColor="#ff8a00" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
                    </radialGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes neuralPulse {
                                    0%, 100% { opacity: 0.3; transform: scale(1); }
                                    50% { opacity: 0.8; transform: scale(1.1); }
                                }
                                .neural-node { animation: neuralPulse 2s ease-in-out infinite; }
                                .neural-node:nth-child(2) { animation-delay: 0.2s; }
                                .neural-node:nth-child(3) { animation-delay: 0.4s; }
                                .neural-node:nth-child(4) { animation-delay: 0.6s; }
                                .neural-node:nth-child(5) { animation-delay: 0.8s; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#0a0a0f" />
                {/* Connection lines */}
                <line x1="30" y1="30" x2="90" y2="30" stroke="#ff6600" strokeWidth="0.5" opacity="0.3" />
                <line x1="30" y1="30" x2="60" y2="60" stroke="#ff6600" strokeWidth="0.5" opacity="0.3" />
                <line x1="90" y1="30" x2="60" y2="60" stroke="#ff6600" strokeWidth="0.5" opacity="0.3" />
                <line x1="60" y1="60" x2="30" y2="90" stroke="#ff6600" strokeWidth="0.5" opacity="0.3" />
                <line x1="60" y1="60" x2="90" y2="90" stroke="#ff6600" strokeWidth="0.5" opacity="0.3" />
                {/* Neural nodes */}
                <circle className="neural-node" cx="30" cy="30" r="8" fill="url(#neural-glow)" />
                <circle className="neural-node" cx="90" cy="30" r="8" fill="url(#neural-glow)" />
                <circle className="neural-node" cx="60" cy="60" r="10" fill="url(#neural-glow)" />
                <circle className="neural-node" cx="30" cy="90" r="8" fill="url(#neural-glow)" />
                <circle className="neural-node" cx="90" cy="90" r="8" fill="url(#neural-glow)" />
            </svg>
        );
    }

    // Cosmic - Spiraling particles
    if (mode === 'cosmic') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmic-glow">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0088ff" stopOpacity="0" />
                    </radialGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes cosmicSpin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                .cosmic-spiral {
                                    animation: cosmicSpin 8s linear infinite;
                                    transform-origin: 60px 60px;
                                }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#0a0a1f" />
                <g className="cosmic-spiral">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                        const angle = (i / 8) * Math.PI * 2;
                        const radius = 25 + i * 3;
                        const x = 60 + Math.cos(angle) * radius;
                        const y = 60 + Math.sin(angle) * radius;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={3 - i * 0.3}
                                fill="url(#cosmic-glow)"
                                opacity={1 - i * 0.1}
                            />
                        );
                    })}
                </g>
                <circle cx="60" cy="60" r="5" fill="#00ffff" opacity="0.8" />
            </svg>
        );
    }

    // Oscilloscope - Classic scope trace
    if (mode === 'oscilloscope') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="scope-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00ff00" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#00ff00" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00ff00" stopOpacity="0.3" />
                    </linearGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes scopeMove {
                                    from { transform: translateX(-10px); }
                                    to { transform: translateX(0px); }
                                }
                                .scope-trace { animation: scopeMove 0.5s linear infinite; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#000" />
                {/* Grid */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line key={`h${i}`} x1="10" y1={10 + i * 25} x2="110" y2={10 + i * 25}
                          stroke="#00ff00" strokeWidth="0.3" opacity="0.2" />
                ))}
                {[0, 1, 2, 3, 4].map(i => (
                    <line key={`v${i}`} x1={10 + i * 25} y1="10" x2={10 + i * 25} y2="110"
                          stroke="#00ff00" strokeWidth="0.3" opacity="0.2" />
                ))}
                {/* Waveform trace */}
                <path
                    className="scope-trace"
                    d="M 10,60 Q 20,30 30,60 T 50,60 T 70,60 T 90,60 T 110,60"
                    fill="none"
                    stroke="url(#scope-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    // Spectrum Analyzer - Frequency bars
    if (mode === 'spectrum') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="spectrum-bar" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ff0000" />
                        <stop offset="50%" stopColor="#ffff00" />
                        <stop offset="100%" stopColor="#00ff00" />
                    </linearGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes spectrumBounce {
                                    0%, 100% { transform: scaleY(1); }
                                    50% { transform: scaleY(0.5); }
                                }
                                .spectrum-bar {
                                    animation: spectrumBounce 0.8s ease-in-out infinite;
                                    transform-origin: bottom;
                                }
                                .spectrum-bar:nth-child(2) { animation-delay: 0.1s; }
                                .spectrum-bar:nth-child(3) { animation-delay: 0.2s; }
                                .spectrum-bar:nth-child(4) { animation-delay: 0.3s; }
                                .spectrum-bar:nth-child(5) { animation-delay: 0.4s; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#0a0a0f" />
                {[20, 35, 50, 65, 80, 95].map((x, i) => {
                    const heights = [70, 50, 85, 60, 40, 75];
                    return (
                        <rect
                            key={i}
                            className="spectrum-bar"
                            x={x}
                            y={110 - heights[i]}
                            width="8"
                            height={heights[i]}
                            fill="url(#spectrum-bar)"
                            rx="2"
                        />
                    );
                })}
            </svg>
        );
    }

    // Cymatics - Wave interference patterns
    if (mode === 'cymatics') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cymatics-wave">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#00aaff" stopOpacity="0" />
                    </radialGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes cymaticsRipple {
                                    0% { r: 0; opacity: 0.9; }
                                    100% { r: 50; opacity: 0; }
                                }
                                .cymatics-ripple {
                                    animation: cymaticsRipple 2s ease-out infinite;
                                }
                                .cymatics-ripple:nth-child(2) { animation-delay: 0.5s; }
                                .cymatics-ripple:nth-child(3) { animation-delay: 1s; }
                                .cymatics-ripple:nth-child(4) { animation-delay: 1.5s; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#000a1f" />
                <circle className="cymatics-ripple" cx="60" cy="60" r="0" fill="none"
                        stroke="url(#cymatics-wave)" strokeWidth="1.5" />
                <circle className="cymatics-ripple" cx="60" cy="60" r="0" fill="none"
                        stroke="url(#cymatics-wave)" strokeWidth="1.5" />
                <circle className="cymatics-ripple" cx="60" cy="60" r="0" fill="none"
                        stroke="url(#cymatics-wave)" strokeWidth="1.5" />
                <circle className="cymatics-ripple" cx="60" cy="60" r="0" fill="none"
                        stroke="url(#cymatics-wave)" strokeWidth="1.5" />
            </svg>
        );
    }

    // Fractal - Branching tree pattern
    if (mode === 'fractal') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fractal-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#8b4513" />
                        <stop offset="100%" stopColor="#32cd32" />
                    </linearGradient>
                </defs>
                <rect width="120" height="120" fill="#0a0a0f" />
                {/* Trunk */}
                <line x1="60" y1="110" x2="60" y2="70" stroke="url(#fractal-gradient)" strokeWidth="3" />
                {/* First branches */}
                <line x1="60" y1="70" x2="40" y2="50" stroke="url(#fractal-gradient)" strokeWidth="2" />
                <line x1="60" y1="70" x2="80" y2="50" stroke="url(#fractal-gradient)" strokeWidth="2" />
                {/* Second branches */}
                <line x1="40" y1="50" x2="30" y2="35" stroke="url(#fractal-gradient)" strokeWidth="1.5" />
                <line x1="40" y1="50" x2="50" y2="35" stroke="url(#fractal-gradient)" strokeWidth="1.5" />
                <line x1="80" y1="50" x2="70" y2="35" stroke="url(#fractal-gradient)" strokeWidth="1.5" />
                <line x1="80" y1="50" x2="90" y2="35" stroke="url(#fractal-gradient)" strokeWidth="1.5" />
                {/* Leaf circles */}
                {[30, 50, 70, 90].map((x, i) => (
                    <circle key={i} cx={x} cy="35" r="4" fill="#32cd32" opacity="0.7" />
                ))}
            </svg>
        );
    }

    // Sacred Geometry - Flower of Life
    if (mode === 'sacred_geometry') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sacred-glow">
                        <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
                    </radialGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes sacredPulse {
                                    0%, 100% { opacity: 0.5; }
                                    50% { opacity: 1; }
                                }
                                .sacred-circle { animation: sacredPulse 3s ease-in-out infinite; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#0a0a0f" />
                {/* Flower of Life pattern - 7 circles */}
                <circle className="sacred-circle" cx="60" cy="60" r="20" fill="none"
                        stroke="url(#sacred-glow)" strokeWidth="1" />
                {[0, 1, 2, 3, 4, 5].map(i => {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = 60 + Math.cos(angle) * 20;
                    const y = 60 + Math.sin(angle) * 20;
                    return (
                        <circle
                            key={i}
                            className="sacred-circle"
                            cx={x}
                            cy={y}
                            r="20"
                            fill="none"
                            stroke="url(#sacred-glow)"
                            strokeWidth="1"
                            style={{ animationDelay: `${i * 0.3}s` }}
                        />
                    );
                })}
            </svg>
        );
    }

    // Pulse - Expanding rings
    if (mode === 'pulse') {
        return (
            <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pulse-gradient">
                        <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
                    </radialGradient>
                    {shouldAnimate && (
                        <style>
                            {`
                                @keyframes pulseExpand {
                                    0% { r: 10; opacity: 0.9; }
                                    100% { r: 50; opacity: 0; }
                                }
                                .pulse-ring { animation: pulseExpand 1.5s ease-out infinite; }
                                .pulse-ring:nth-child(2) { animation-delay: 0.5s; }
                                .pulse-ring:nth-child(3) { animation-delay: 1s; }
                            `}
                        </style>
                    )}
                </defs>
                <rect width="120" height="120" fill="#0a0a0f" />
                <circle className="pulse-ring" cx="60" cy="60" r="10" fill="none"
                        stroke="url(#pulse-gradient)" strokeWidth="2" />
                <circle className="pulse-ring" cx="60" cy="60" r="10" fill="none"
                        stroke="url(#pulse-gradient)" strokeWidth="2" />
                <circle className="pulse-ring" cx="60" cy="60" r="10" fill="none"
                        stroke="url(#pulse-gradient)" strokeWidth="2" />
                <circle cx="60" cy="60" r="8" fill="#ff00ff" opacity="0.7" />
            </svg>
        );
    }

    // Default fallback
    return (
        <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" fill="#0a0a0f" />
            <text x="60" y="60" textAnchor="middle" fill="#25f4e2" fontSize="12" fontFamily="monospace">
                {mode.toUpperCase()}
            </text>
        </svg>
    );
};
