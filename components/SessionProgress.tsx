import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../services/AudioEngine';
import { Activity, Radio, Cpu, Brain, X } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext.tsx';

interface SessionProgressProps {
    audioEngine: AudioEngine;
}

// Phase-specific guidance instructions
const PHASE_GUIDANCE: Record<string, string> = {
    'DELTA': 'Remain still. Let your mind drift. Deep restoration in progress.',
    'THETA': 'Observe thoughts without attachment. Memory consolidation active.',
    'ALPHA': 'Relax but stay aware. Ideal for visualization and light focus.',
    'BETA': 'Engage with focus tasks. Peak cognitive processing window.',
    'GAMMA': 'High-level integration. Complex problem-solving optimal.'
};

export const SessionProgress: React.FC<SessionProgressProps> = ({ audioEngine }) => {
    const { reduceMotion } = useMotion();

    const progressBarRef = useRef<HTMLDivElement>(null);
    const timeTextRef = useRef<HTMLDivElement>(null);
    const phaseTextRef = useRef<HTMLDivElement>(null);
    const remainingRef = useRef<HTMLDivElement>(null);
    const phaseDescRef = useRef<HTMLSpanElement>(null);

    // Circular progress refs
    const progressCircleRef = useRef<SVGCircleElement>(null);
    const circleColorRef = useRef<string>('#10b981'); // Default green

    // Guidance overlay ref
    const guidanceTextRef = useRef<HTMLParagraphElement>(null);

    // Beat-synced pulse ref
    const pulseRef = useRef<HTMLDivElement>(null);

    // Telemetry Refs
    const carrierRef = useRef<HTMLDivElement>(null);
    const beatRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<HTMLDivElement>(null);

    const reqRef = useRef<number>(0);

    // Track dismissed guidance (localStorage)
    const [guidanceDismissed, setGuidanceDismissed] = useState<boolean>(() => {
        return localStorage.getItem('synsync_session_guidance') === 'dismissed';
    });

    const dismissGuidance = () => {
        setGuidanceDismissed(true);
        localStorage.setItem('synsync_session_guidance', 'dismissed');
    };

    const getBrainwaveName = (freq: number) => {
        if (freq < 4) return 'DELTA';
        if (freq < 8) return 'THETA';
        if (freq < 14) return 'ALPHA';
        if (freq < 30) return 'BETA';
        return 'GAMMA';
    };

    const getBrainwaveDescription = (freq: number) => {
        if (freq < 4) return 'Deep Sleep & Restoration';
        if (freq < 8) return 'Meditation & Memory';
        if (freq < 14) return 'Relaxed Alertness';
        if (freq < 30) return 'Focus & Processing';
        return 'Peak Awareness';
    };

    useEffect(() => {
        const update = () => {
            if (audioEngine.isPlaying && audioEngine.currentProtocol) {
                const state = audioEngine.getPlaybackState();
                const phase = audioEngine.currentProtocol.phases[state.currentPhaseIndex];

                // Time & Progress
                const totalDuration = audioEngine.currentProtocol.duration;
                const elapsed = state.totalElapsed;
                const remaining = Math.max(0, totalDuration - elapsed);

                if (timeTextRef.current) {
                    timeTextRef.current.innerText = `${formatTime(elapsed)} / ${formatTime(totalDuration)}`;
                }
                if (phaseTextRef.current) {
                    phaseTextRef.current.innerText = `PHASE ${state.currentPhaseIndex + 1}/${audioEngine.currentProtocol.phases.length}`;
                }
                if (remainingRef.current) {
                    remainingRef.current.innerText = `-${formatTime(remaining)}`;
                }
                if (progressBarRef.current) {
                    const pct = (elapsed / totalDuration) * 100;
                    progressBarRef.current.style.width = `${Math.min(pct, 100)}%`;
                }

                // Circular progress indicator
                if (progressCircleRef.current) {
                    const circumference = 125.6; // 2 * π * 20
                    const progress = Math.min(1, elapsed / totalDuration);
                    const offset = circumference * (1 - progress);
                    progressCircleRef.current.style.strokeDashoffset = String(offset);

                    // Color-code based on remaining time
                    let color = '#10b981'; // Green: >5 min
                    let shouldPulse = false;

                    if (remaining <= 60) {
                        color = '#ef4444'; // Red: <1 min
                        shouldPulse = true;
                    } else if (remaining <= 120) {
                        color = '#f97316'; // Orange: 1-2 min
                    } else if (remaining <= 300) {
                        color = '#eab308'; // Yellow: 2-5 min
                    }

                    if (circleColorRef.current !== color) {
                        circleColorRef.current = color;
                        progressCircleRef.current.style.stroke = color;

                        // Add/remove pulse animation (respect reduceMotion)
                        if (shouldPulse && !reduceMotion) {
                            progressCircleRef.current.classList.add('animate-pulse');
                        } else {
                            progressCircleRef.current.classList.remove('animate-pulse');
                        }
                    }
                }

                // Live Telemetry Calculation
                if (phase) {
                    const phaseProgress = Math.min(1, state.phaseElapsed / phase.duration);
                    
                    // Calculate current Beat
                    const startB = phase.beat ?? 0;
                    const endB = phase.beatEnd ?? phase.beat ?? 0;
                    const currentBeat = startB + (endB - startB) * phaseProgress;
                    
                    // Calculate current Carrier
                    const startC = phase.carrier;
                    const endC = phase.carrierEnd ?? phase.carrier;
                    const currentCarrier = startC + (endC - startC) * phaseProgress;

                    if (beatRef.current) beatRef.current.innerText = `${currentBeat.toFixed(2)} Hz`;
                    if (carrierRef.current) carrierRef.current.innerText = `${currentCarrier.toFixed(1)} Hz`;
                    if (phaseDescRef.current) {
                        phaseDescRef.current.innerText = getBrainwaveDescription(currentBeat);
                    }
                    if (stateRef.current) {
                        const wave = getBrainwaveName(currentBeat);
                        stateRef.current.innerText = wave;
                        stateRef.current.className = `font-bold tracking-widest ${
                            wave === 'GAMMA' ? 'text-red-400' :
                            wave === 'BETA' ? 'text-yellow-400' :
                            wave === 'ALPHA' ? 'text-green-400' :
                            wave === 'THETA' ? 'text-blue-400' : 'text-purple-400'
                        }`;

                        // Update guidance text
                        if (guidanceTextRef.current && PHASE_GUIDANCE[wave]) {
                            guidanceTextRef.current.innerText = PHASE_GUIDANCE[wave];
                        }
                    }

                    // Beat-synced visual pulse (disabled when reduceMotion is true)
                    if (pulseRef.current && currentBeat > 0 && !reduceMotion) {
                        const pulsePeriod = 1000 / currentBeat; // ms per cycle
                        const pulsePhase = (Date.now() % pulsePeriod) / pulsePeriod;
                        const pulseOpacity = 0.05 + 0.05 * Math.sin(pulsePhase * Math.PI * 2);
                        pulseRef.current.style.opacity = String(pulseOpacity);
                    } else if (pulseRef.current && reduceMotion) {
                        // Set to minimum opacity when motion is reduced
                        pulseRef.current.style.opacity = '0';
                    }
                }
            } else {
                // Clear all display values when session is not playing or no protocol
                if (timeTextRef.current) timeTextRef.current.innerText = '';
                if (phaseTextRef.current) phaseTextRef.current.innerText = '';
                if (remainingRef.current) remainingRef.current.innerText = '';
                if (progressBarRef.current) progressBarRef.current.style.width = '0%';
                if (progressCircleRef.current) {
                    progressCircleRef.current.style.strokeDashoffset = '125.6';
                    progressCircleRef.current.style.stroke = '#10b981';
                    progressCircleRef.current.classList.remove('animate-pulse');
                }
                if (beatRef.current) beatRef.current.innerText = '--';
                if (carrierRef.current) carrierRef.current.innerText = '--';
                if (stateRef.current) {
                    stateRef.current.innerText = '--';
                    stateRef.current.className = 'font-bold tracking-widest text-gray-500';
                }
                if (phaseDescRef.current) phaseDescRef.current.innerText = '';
                if (guidanceTextRef.current) guidanceTextRef.current.innerText = '';
                if (pulseRef.current) pulseRef.current.style.opacity = '0';
            }
            reqRef.current = requestAnimationFrame(update);
        };

        reqRef.current = requestAnimationFrame(update);
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [audioEngine, reduceMotion]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Beat-synced visual pulse overlay */}
            <div
                ref={pulseRef}
                className="fixed inset-0 bg-neuro-500 pointer-events-none z-0"
                style={{ opacity: 0.05 }}
                aria-hidden="true"
            />

            <div className="w-full space-y-4 relative z-10">
                {/* Main Progress */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neuro-400 font-mono uppercase tracking-wider">
                    <div ref={phaseTextRef}>PHASE --/--</div>
                    <div ref={timeTextRef}>0:00 / 0:00</div>
                </div>
                <div className="h-1.5 bg-neuro-900 rounded-full overflow-hidden border border-neuro-700/50 relative">
                    <div ref={progressBarRef} className="h-full bg-neuro-500 w-0 transition-all duration-75 ease-linear relative z-10" />
                    <div className="absolute inset-0 bg-theme-primary/10 blur-[2px]"></div>
                </div>
                {/* Subtitle row: phase description + countdown */}
                <div className="flex justify-between items-center">
                    <span ref={phaseDescRef} className="text-[10px] text-gray-600 italic">—</span>
                    <div className="flex items-center gap-2">
                        {/* Circular progress indicator */}
                        <svg width="32" height="32" viewBox="0 0 44 44" className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="22"
                                cy="22"
                                r="20"
                                fill="none"
                                stroke="#1f2937"
                                strokeWidth="3"
                            />
                            {/* Progress circle */}
                            <circle
                                ref={progressCircleRef}
                                cx="22"
                                cy="22"
                                r="20"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeDasharray="125.6"
                                strokeDashoffset="125.6"
                                strokeLinecap="round"
                                className="transition-all duration-150 ease-linear"
                            />
                        </svg>
                        <div ref={remainingRef} className="text-[10px] font-mono text-gray-600 tabular-nums">—</div>
                    </div>
                </div>
            </div>

            {/* Session Guidance Overlay */}
            {!guidanceDismissed && (
                <div className="bg-neuro-500/10 border border-neuro-500/30 rounded-lg p-3 relative">
                    <button
                        onClick={dismissGuidance}
                        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label="Dismiss guidance"
                    >
                        <X className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                    </button>
                    <div className="flex items-start gap-2 pr-6">
                        <Brain className="w-4 h-4 text-neuro-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-[10px] font-bold text-neuro-300 uppercase tracking-wider mb-1">
                                Current Phase Guidance
                            </h4>
                            <p ref={guidanceTextRef} className="text-xs text-gray-300 leading-relaxed">
                                —
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Telemetry Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/40 border border-neuro-700/50 p-2 rounded flex flex-col items-center justify-center">
                    <div className="text-[9px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Entrainment
                    </div>
                    <div ref={beatRef} className="text-sm font-mono text-white font-bold tracking-tight">-- Hz</div>
                </div>
                <div className="bg-black/40 border border-neuro-700/50 p-2 rounded flex flex-col items-center justify-center">
                    <div className="text-[9px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                        <Radio className="w-3 h-3" /> Carrier
                    </div>
                    <div ref={carrierRef} className="text-sm font-mono text-neuro-300 font-bold tracking-tight">-- Hz</div>
                </div>
                <div className="bg-black/40 border border-neuro-700/50 p-2 rounded flex flex-col items-center justify-center">
                    <div className="text-[9px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> Target
                    </div>
                    <div ref={stateRef} className="text-sm font-mono text-white font-bold tracking-tight">--</div>
                </div>
            </div>
            
            {/* DSP Status */}
            <div className="flex justify-between items-center bg-neuro-800/30 px-3 py-1.5 rounded border border-neuro-700/30">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-green-500 ${reduceMotion ? '' : 'animate-pulse'}`}></div>
                    <span className="text-[9px] font-mono text-green-400 tracking-widest">DSP ONLINE</span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-neuro-600" />
                    <span className="text-[9px] font-mono text-gray-500 tracking-wider">HARMONIC STACK ACTIVE</span>
                </div>
            </div>
            </div>
        </>
    );
};