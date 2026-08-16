
import React, { useState } from 'react';
import { PROTOCOLS } from '../src/audio/constants';
import { HarmonicAudit, HarmonicResult } from '../services/HarmonicAudit';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

export const StackAnalyzer: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [result, setResult] = useState<HarmonicResult | null>(null);

    const toggleProtocol = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];

        setSelectedIds(newSelection);

        if (newSelection.length >= 2) {
            const nodes = newSelection.map(sid => {
                const p = PROTOCOLS[sid];
                return { carrier: p.phases[0].carrier, beat: p.phases[0].beat, name: p.title };
            });
            setResult(HarmonicAudit.analyzeFrequencies(nodes));
        } else {
            setResult(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-neuro-800/50 border border-neuro-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-neuro-500" />
                    Multi-Protocol Harmonic Analyzer
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                    Select two or more protocols to analyze their frequency compatibility if played in a stack or immediate sequence.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.values(PROTOCOLS).map(p => (
                        <button
                            key={p.id}
                            onClick={() => toggleProtocol(p.id)}
                            className={`text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                                selectedIds.includes(p.id)
                                ? 'bg-neuro-500/20 border-neuro-500 text-white'
                                : 'bg-neuro-900/50 border-neuro-700 text-gray-500 hover:border-neuro-600'
                            }`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>
            </div>

            {result && (
                <div className={`p-6 rounded-2xl border-2 animate-in slide-in-from-bottom-4 duration-300 ${
                    result.status === 'HARMONIC' ? 'bg-green-500/10 border-green-500/50' :
                    result.status === 'DISSONANT' ? 'bg-red-500/10 border-red-500/50' :
                    'bg-blue-500/10 border-blue-500/50'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {result.status === 'HARMONIC' ? <CheckCircle className="w-6 h-6 text-green-500" /> :
                                 result.status === 'DISSONANT' ? <AlertTriangle className="w-6 h-6 text-red-500" /> :
                                 <Info className="w-6 h-6 text-blue-500" />}
                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                    {result.status} STACK
                                </h4>
                            </div>
                            <p className="text-sm text-gray-300">Compatibility Score: <span className="font-bold">{result.score}%</span></p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {result.findings.map((f, i) => (
                            <div key={i} className="text-sm text-gray-200 bg-black/30 p-3 rounded-lg border border-white/5">
                                {f}
                            </div>
                        ))}
                    </div>

                    {result.recommendation && (
                        <div className="mt-6 pt-4 border-t border-red-500/20">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Expert Recommendation</p>
                            <p className="text-sm text-white italic">{result.recommendation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
