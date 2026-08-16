
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { Sliders, Headphones, Zap, Volume2, Move, Activity, RotateCcw } from 'lucide-react';
import { AudioEngine } from '../services/AudioEngine';

interface ManualTuningPanelProps {
    audioEngine: AudioEngine;
}

export const ManualTuningPanel: React.FC<ManualTuningPanelProps> = ({ audioEngine }) => {
    const [balance, setBalance] = useState(0); // -1 (L) to 1 (R)
    const [pitchCents, setPitchCents] = useState(0); // +/- 500 cents
    const [beatCents, setBeatCents] = useState(0); // +/- 100 cents
    const [noiseMult, setNoiseMult] = useState(1.0); // 0 to 2
    const [overlayMult, setOverlayMult] = useState(1.0); // 0 to 2

    // Apply changes to engine
    useEffect(() => {
        audioEngine.setBalance(balance);
    }, [balance, audioEngine]);

    useEffect(() => {
        audioEngine.updateManualOverrides(pitchCents, beatCents, noiseMult, overlayMult);
    }, [pitchCents, beatCents, noiseMult, overlayMult, audioEngine]);

    const reset = () => {
        setBalance(0);
        setPitchCents(0);
        setBeatCents(0);
        setNoiseMult(1.0);
        setOverlayMult(1.0);
    };

    const { theme } = useTheme();
    const glassClass = theme === 'alien' ? 'alien-glass' : theme === 'neural' ? 'glass-card' : 'cosmic-glass';

    return (
        <div className={`bg-neuro-800/40 border border-neuro-700 rounded-xl p-5 backdrop-blur-md ${glassClass}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-neuro-500/10 text-neuro-500">
                        <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Fine Tuning</h3>
                        <p className="text-[10px] text-gray-500 font-mono">Personalize your session</p>
                    </div>
                </div>
                <button onClick={reset} className="p-2 hover:bg-white/5 rounded text-gray-500 hover:text-neuro-400 transition-colors" aria-label="Reset tuning parameters">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Balance Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Headphones className="w-3 h-3" /> L/R Balance
                        </label>
                        <span className="font-mono text-[10px] text-neuro-300">
                            {balance === 0 ? 'CENTER' : balance < 0 ? `${Math.abs(balance * 100).toFixed(0)}% L` : `${(balance * 100).toFixed(0)}% R`}
                        </span>
                    </div>
                    <input
                        type="range" min="-1" max="1" step="0.05"
                        value={balance} onChange={(e) => setBalance(parseFloat(e.target.value))}
                        className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                        aria-label="Left/right balance"
                    />
                    <div className="flex justify-between text-[8px] text-gray-600 font-mono">
                        <span>LEFT</span>
                        <span>RIGHT</span>
                    </div>
                </div>

                {/* Pitch Fine-Tune */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Base Tone
                        </label>
                        <span className="font-mono text-[10px] text-neuro-300">{pitchCents > 0 ? '+' : ''}{pitchCents} cents</span>
                    </div>
                    <input
                        type="range" min="-500" max="500" step="10"
                        value={pitchCents} onChange={(e) => setPitchCents(parseInt(e.target.value))}
                        className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-accent"
                        aria-label="Carrier pitch fine-tune"
                    />
                </div>

                {/* Beat Fine-Tune */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Rhythm Shift
                        </label>
                        <span className="font-mono text-[10px] text-neuro-300">{beatCents > 0 ? '+' : ''}{beatCents} cents</span>
                    </div>
                    <input
                        type="range" min="-100" max="100" step="1"
                        value={beatCents} onChange={(e) => setBeatCents(parseInt(e.target.value))}
                        className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                        aria-label="Beat offset fine-tune"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Noise Multiplier */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Background Noise</label>
                        <input
                            type="range" min="0" max="2" step="0.1"
                            value={noiseMult} onChange={(e) => setNoiseMult(parseFloat(e.target.value))}
                            className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                            aria-label="Noise floor multiplier"
                        />
                        <div className="text-[9px] text-center text-gray-600 font-mono">x{noiseMult.toFixed(1)}</div>
                    </div>
                    {/* Overlay Multiplier */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Harmonic Blend</label>
                        <input
                            type="range" min="0" max="2" step="0.1"
                            value={overlayMult} onChange={(e) => setOverlayMult(parseFloat(e.target.value))}
                            className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                            aria-label="Overlay intensity multiplier"
                        />
                        <div className="text-[9px] text-center text-gray-600 font-mono">x{overlayMult.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 p-3 bg-neuro-900/50 rounded-lg border border-neuro-700/50">
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    Use Balance to adjust for headphone fit. Shift Base Tone / Rhythm for A/B testing. Settings persist across all session phases.
                </p>
            </div>
        </div>
    );
};
