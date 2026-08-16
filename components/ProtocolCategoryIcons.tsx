import React from 'react';
import { useMotion } from '../contexts/MotionContext';

/**
 * ProtocolCategoryIcons
 *
 * Custom animated SVG icons for protocol categories.
 * More visually descriptive than generic Material Symbols.
 *
 * Usage:
 * <NeuralRewiringIcon size={48} />
 */

interface IconProps {
    size?: number;
    className?: string;
}

/**
 * Neural Rewiring - Animated synapse connections
 */
export const NeuralRewiringIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <radialGradient id="neuron-glow">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </radialGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes neuronPulse {
                                0%, 100% { opacity: 0.6; r: 2; }
                                50% { opacity: 1; r: 2.5; }
                            }
                            .neuron-node {
                                animation: neuronPulse 2s ease-in-out infinite;
                            }
                            .neuron-node:nth-child(2) { animation-delay: 0.3s; }
                            .neuron-node:nth-child(3) { animation-delay: 0.6s; }
                            .neuron-node:nth-child(4) { animation-delay: 0.9s; }
                            .neuron-node:nth-child(5) { animation-delay: 1.2s; }
                        `}
                    </style>
                )}
            </defs>
            {/* Connection lines */}
            <path d="M 6 6 L 12 12 L 18 6" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4" />
            <path d="M 6 18 L 12 12 L 18 18" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4" />
            {/* Neuron nodes */}
            <circle className="neuron-node" cx="6" cy="6" r="2" fill="url(#neuron-glow)" />
            <circle className="neuron-node" cx="18" cy="6" r="2" fill="url(#neuron-glow)" />
            <circle className="neuron-node" cx="12" cy="12" r="2.5" fill="url(#neuron-glow)" />
            <circle className="neuron-node" cx="6" cy="18" r="2" fill="url(#neuron-glow)" />
            <circle className="neuron-node" cx="18" cy="18" r="2" fill="url(#neuron-glow)" />
        </svg>
    );
};

/**
 * Sleep & Recovery - Crescent moon with stars
 */
export const SleepRecoveryIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes starTwinkle {
                                0%, 100% { opacity: 0.3; }
                                50% { opacity: 1; }
                            }
                            .star {
                                animation: starTwinkle 2s ease-in-out infinite;
                            }
                            .star:nth-child(2) { animation-delay: 0.5s; }
                            .star:nth-child(3) { animation-delay: 1s; }
                        `}
                    </style>
                )}
            </defs>
            {/* Crescent moon */}
            <path
                d="M 12 3 A 6 6 0 0 0 12 21 A 8 8 0 1 1 12 3 Z"
                fill="url(#moon-gradient)"
            />
            {/* Stars */}
            <circle className="star" cx="18" cy="6" r="1" fill="#ffffff" />
            <circle className="star" cx="20" cy="10" r="0.8" fill="#ffffff" />
            <circle className="star" cx="19" cy="14" r="0.6" fill="#ffffff" />
        </svg>
    );
};

/**
 * Consciousness Expansion - Radiating mandala
 */
export const ConsciousnessExpansionIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <radialGradient id="consciousness-glow">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                </radialGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes mandalaRotate {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            @keyframes mandalaPulse {
                                0%, 100% { opacity: 0.5; }
                                50% { opacity: 1; }
                            }
                            .mandala-ring {
                                animation: mandalaRotate 10s linear infinite, mandalaPulse 3s ease-in-out infinite;
                                transform-origin: 12px 12px;
                            }
                        `}
                    </style>
                )}
            </defs>
            {/* Center */}
            <circle cx="12" cy="12" r="3" fill="url(#consciousness-glow)" />
            {/* Radiating petals */}
            <g className="mandala-ring">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = 12 + Math.cos(angle) * 6;
                    const y = 12 + Math.sin(angle) * 6;
                    return (
                        <ellipse
                            key={i}
                            cx={x}
                            cy={y}
                            rx="2"
                            ry="4"
                            fill="#c084fc"
                            opacity="0.6"
                            transform={`rotate(${(i / 8) * 360}, ${x}, ${y})`}
                        />
                    );
                })}
            </g>
        </svg>
    );
};

/**
 * Autonomic Mastery - Heartbeat waveform
 */
export const AutonomicMasteryIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
                </linearGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes heartbeat {
                                0%, 100% { transform: scale(1); }
                                10% { transform: scale(1.1); }
                                20% { transform: scale(1); }
                                30% { transform: scale(1.15); }
                                40% { transform: scale(1); }
                            }
                            .heartbeat-path {
                                animation: heartbeat 2s ease-in-out infinite;
                                transform-origin: 12px 12px;
                            }
                        `}
                    </style>
                )}
            </defs>
            {/* ECG waveform */}
            <path
                className="heartbeat-path"
                d="M 2,12 L 6,12 L 8,6 L 10,18 L 12,9 L 14,12 L 22,12"
                fill="none"
                stroke="url(#heart-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

/**
 * Flow State - Smooth wave curves
 */
export const FlowStateIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#a3e635" stopOpacity="1" />
                    <stop offset="100%" stopColor="#a3e635" stopOpacity="0.3" />
                </linearGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes flowMove {
                                from { transform: translateX(-4px); }
                                to { transform: translateX(4px); }
                            }
                            .flow-wave {
                                animation: flowMove 2s ease-in-out infinite alternate;
                            }
                        `}
                    </style>
                )}
            </defs>
            <g className="flow-wave">
                <path
                    d="M 2,12 Q 6,6 10,12 T 18,12 T 22,12"
                    fill="none"
                    stroke="url(#flow-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.4"
                />
                <path
                    d="M 2,16 Q 6,10 10,16 T 18,16 T 22,16"
                    fill="none"
                    stroke="url(#flow-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.7"
                />
                <path
                    d="M 2,8 Q 6,2 10,8 T 18,8 T 22,8"
                    fill="none"
                    stroke="url(#flow-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.5"
                />
            </g>
        </svg>
    );
};

/**
 * Gamma Focus - Lightning bolt with particles
 */
export const GammaFocusIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="gamma-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes gammaPulse {
                                0%, 100% { opacity: 0.5; }
                                50% { opacity: 1; }
                            }
                            @keyframes gammaParticle {
                                0% { cy: 6; opacity: 1; }
                                100% { cy: -2; opacity: 0; }
                            }
                            .gamma-bolt {
                                animation: gammaPulse 1s ease-in-out infinite;
                            }
                            .gamma-particle {
                                animation: gammaParticle 1.5s ease-out infinite;
                            }
                            .gamma-particle:nth-child(2) { animation-delay: 0.3s; }
                            .gamma-particle:nth-child(3) { animation-delay: 0.6s; }
                        `}
                    </style>
                )}
            </defs>
            {/* Lightning bolt */}
            <path
                className="gamma-bolt"
                d="M 13 2 L 8 12 L 12 12 L 11 22 L 16 12 L 12 12 Z"
                fill="url(#gamma-gradient)"
            />
            {/* Energy particles */}
            <circle className="gamma-particle" cx="10" cy="6" r="1" fill="#fbbf24" />
            <circle className="gamma-particle" cx="14" cy="8" r="0.8" fill="#fbbf24" />
            <circle className="gamma-particle" cx="12" cy="10" r="0.6" fill="#fbbf24" />
        </svg>
    );
};

/**
 * Cymatics - Concentric interference rings
 */
export const CymaticsIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    const { reduceMotion } = useMotion();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {!reduceMotion && (
                    <style>
                        {`
                            @keyframes cymaticsRipple {
                                0% { r: 2; opacity: 1; }
                                100% { r: 10; opacity: 0; }
                            }
                            .cymatics-ring {
                                animation: cymaticsRipple 2s ease-out infinite;
                            }
                            .cymatics-ring:nth-child(2) { animation-delay: 0.5s; }
                            .cymatics-ring:nth-child(3) { animation-delay: 1s; }
                            .cymatics-ring:nth-child(4) { animation-delay: 1.5s; }
                        `}
                    </style>
                )}
            </defs>
            {/* Static rings */}
            <circle cx="12" cy="12" r="3" fill="none" stroke="#00aaff" strokeWidth="1" opacity="0.6" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="#00aaff" strokeWidth="1" opacity="0.4" />
            <circle cx="12" cy="12" r="9" fill="none" stroke="#00aaff" strokeWidth="1" opacity="0.2" />
            {/* Animated ripples */}
            <circle className="cymatics-ring" cx="12" cy="12" r="2" fill="none" stroke="#00aaff" strokeWidth="1.5" />
            <circle className="cymatics-ring" cx="12" cy="12" r="2" fill="none" stroke="#00aaff" strokeWidth="1.5" />
            <circle className="cymatics-ring" cx="12" cy="12" r="2" fill="none" stroke="#00aaff" strokeWidth="1.5" />
            <circle className="cymatics-ring" cx="12" cy="12" r="2" fill="none" stroke="#00aaff" strokeWidth="1.5" />
            {/* Center point */}
            <circle cx="12" cy="12" r="1.5" fill="#00aaff" />
        </svg>
    );
};

/**
 * Icon Map - Easy lookup by protocol category or visualization mode
 */
export const CUSTOM_ICONS = {
    // Protocol categories
    'neural-rewiring': NeuralRewiringIcon,
    'sleep-recovery': SleepRecoveryIcon,
    'consciousness-expansion': ConsciousnessExpansionIcon,
    'autonomic-mastery': AutonomicMasteryIcon,
    'flow-state': FlowStateIcon,
    'gamma-focus': GammaFocusIcon,

    // Visualization modes
    'cymatics': CymaticsIcon,
} as const;

export type CustomIconName = keyof typeof CUSTOM_ICONS;
