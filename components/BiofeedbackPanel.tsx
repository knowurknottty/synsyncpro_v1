
import React, { useState, useEffect } from 'react';
import { Activity, Heart, Zap, Radio, Sliders } from 'lucide-react';
import { AudioEngine } from '../services/AudioEngine';
import { BiofeedbackMetrics } from '../types';

interface BiofeedbackPanelProps {
    audioEngine: AudioEngine;
}

export const BiofeedbackPanel: React.FC<BiofeedbackPanelProps> = ({ audioEngine }) => {
    const [active, setActive] = useState(false);
    const [hrv, setHrv] = useState(75); // 0-100
    const [coherence, setCoherence] = useState(0.8); // 0.0-1.0

    // Simulation Effect
    useEffect(() => {
        let interval: unknown;
        if (active) {
            // Add slight drift to values to simulate real sensor noise
            interval = setInterval(() => {
                setHrv(prev => {
                    const drift = Math.random() * 4 - 2;
                    return Math.max(0, Math.min(100, prev + drift));
                });
                setCoherence(prev => {
                    const drift = Math.random() * 0.04 - 0.02;
                    return Math.max(0, Math.min(1, prev + drift));
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [active]);

    // Push updates to AudioEngine
    useEffect(() => {
        const metrics: BiofeedbackMetrics = {
            hrv,
            coherence,
            active
        };
        audioEngine.updateBiofeedback(metrics);
    }, [hrv, coherence, active, audioEngine]);

    return (
        <div className={`rounded-2xl border p-5 transition-all duration-300 ${active ? 'bg-neuro-900/80 border-neuro-500 shadow-[0_0_20px_rgba(31,184,205,0.15)]' : 'bg-neuro-800/30 border-neuro-700'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${active ? 'bg-neuro-500 text-neuro-900' : 'bg-gray-700 text-gray-400'}`}>
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-400'}`}>Adaptive Biofeedback</h3>
                        <p className="text-[10px] text-gray-500 font-mono uppercase">Simulated Sensor Input</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neuro-500"></div>
                </label>
            </div>

            {active && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    
                    {/* HRV Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-400" /> Heart Rate Variability (HRV)
                            </label>
                            <span className={`font-mono text-xs ${hrv < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                {hrv.toFixed(0)}ms
                            </span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={hrv} onChange={(e) => setHrv(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            aria-label="Heart rate variability"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600">
                            <span>Stress (Low)</span>
                            <span>Relaxed (High)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            Low HRV triggers "Grounding Mode": Lower carrier freq, increased comfort noise.
                        </p>
                    </div>

                    {/* Coherence Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" /> Neural Coherence
                            </label>
                            <span className={`font-mono text-xs ${coherence > 0.7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                {(coherence * 100).toFixed(0)}%
                            </span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={coherence} onChange={(e) => setCoherence(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                            aria-label="Neural coherence"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600">
                            <span>Scattered</span>
                            <span>Flow State</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            High Coherence optimizes harmonic complexity. Low Coherence boosts noise masking.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
