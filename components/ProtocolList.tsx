import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { Protocol } from '../types.ts';
import { Brain, ChevronDown, ChevronRight, Folder, Layers, Zap, Shield, Activity, Target, Battery, Moon, Heart, Globe, FlaskConical, Microscope, Wind, Sparkles, Speaker, Cpu, Search, Clock, X, Headphones } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip.tsx';
import { NEW_PROTOCOL_IDS } from '../constants.ts';

function formatDuration(seconds: number): string {
    if (seconds < 60) return '< 1 min';
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function evidenceStars(level?: string): string {
    const map: Record<string, number> = { I: 5, II: 4, III: 3, IV: 2, V: 1 };
    const filled = map[level ?? ''] ?? 0;
    if (!filled) return '';
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function getEvidenceLevelTooltip(level: string): string {
    const tooltips: Record<string, string> = {
        'I': 'Level I: Strongest Evidence — Multiple high-quality studies with consistent findings',
        'II': 'Level II: Strong Evidence — Several peer-reviewed studies supporting this protocol',
        'III': 'Level III: Moderate Evidence — Preliminary research with promising results',
        'IV': 'Level IV: Emerging Evidence — Limited studies, requires further validation',
        'V': 'Level V: Exploratory — Theoretical basis, minimal empirical support'
    };
    return tooltips[level] || 'Evidence level not specified';
}

interface ProtocolListProps {
    protocols: Protocol[];
    selectedId: string | null;
    onSelect: (p: Protocol) => void;
    mode: 'scientific' | 'speculative';
}

const SECTIONS_CONFIG: Record<string, { label: string, icon: React.ElementType, color: string }> = {
    'Calibration': { label: '1. Getting Started', icon: Folder, color: 'text-gray-500' },
    'Isochronic (Speakers)': { label: '2. Speaker Sessions', icon: Speaker, color: 'text-neuro-500' },
    'Suffering Reduction': { label: '3. Relief & Comfort', icon: Activity, color: 'text-blue-400' },
    'Sleep & Recovery': { label: '4. Sleep & Recovery', icon: Moon, color: 'text-blue-300' },
    'Performance Focus': { label: '5. Focus & Clarity', icon: Target, color: 'text-yellow-400' },
    'Performance Advanced': { label: '6. Peak Performance', icon: Target, color: 'text-yellow-500' },
    'Neural Rewiring': { label: '7. Mindset Transformation', icon: Cpu, color: 'text-purple-400' },
    'Autonomic Mastery': { label: '8. Nervous System Balance', icon: Heart, color: 'text-red-400' },
    'Recovery & Addiction': { label: '9. Recovery & Renewal', icon: Shield, color: 'text-teal-400' },
    'Flow State': { label: '10. Flow State', icon: Layers, color: 'text-amber-400' },
    'Athletic Performance': { label: '11. Athletic Performance', icon: Battery, color: 'text-orange-400' },
    'Emotional Mastery': { label: '12. Emotional Balance', icon: Heart, color: 'text-pink-400' },
    'Relationship & Social': { label: '13. Connection & Communication', icon: Globe, color: 'text-cyan-400' },
    'Creative Expression': { label: '14. Creative Expression', icon: Wind, color: 'text-green-400' },
    'Spiritual Integration': { label: '15. Inner Peace & Reflection', icon: Brain, color: 'text-purple-400' },
    'Advanced Research': { label: '16. Experimental Protocols', icon: Microscope, color: 'text-indigo-400' },
    'Biohacking & Longevity': { label: '17. Optimization & Vitality', icon: FlaskConical, color: 'text-emerald-400' },
    'Consciousness Expansion': { label: '18. Deep Awareness', icon: Sparkles, color: 'text-indigo-400' },
    'Cannabis Mimicry': { label: '19. Deep Relaxation & Creative Flow', icon: Wind, color: 'text-green-500' },
    'MDMA Mimicry': { label: '20. Heart-Opening: Connection States', icon: Heart, color: 'text-pink-500' },
    'Stimulant Mimicry': { label: '21. Energy & Alert Focus', icon: Zap, color: 'text-orange-500' },
    'Psychedelic Mimicry': { label: '22. Expanded Perception States', icon: Sparkles, color: 'text-indigo-500' }
};

export const ProtocolList: React.FC<ProtocolListProps> = ({ protocols, selectedId, onSelect, mode }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'Calibration': true, 'Isochronic (Speakers)': true, 'Sleep & Recovery': true, 'Performance Focus': true
    });
    const [search, setSearch] = useState('');

    // Track dismissed NEW badges
    const [dismissedNew, setDismissedNew] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem('synsync_dismissed_new');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    const dismissNewBadge = (protocolId: string) => {
        const updated = new Set(dismissedNew);
        updated.add(protocolId);
        setDismissedNew(updated);
        localStorage.setItem('synsync_dismissed_new', JSON.stringify([...updated]));
    };

    // Keyboard navigation state
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const protocolRefs = useRef<(HTMLDivElement | null)[]>([]);

    const groupedProtocols = useMemo(() => {
        const q = search.trim().toLowerCase();
        const groups: Record<string, Protocol[]> = {};
        protocols.forEach(p => {
            if (mode === 'scientific' && (p.category === 'speculative' || p.evidenceLevel === 'V')) return;
            if (q) {
                const matches =
                    p.title.toLowerCase().includes(q) ||
                    (p.description ?? '').toLowerCase().includes(q) ||
                    (p.usageGoal ?? '').toLowerCase().includes(q);
                if (!matches) return;
            }
            const s = p.section || 'Calibration';
            if (!groups[s]) groups[s] = [];
            groups[s].push(p);
        });
        return groups;
    }, [protocols, mode, search]);

    const sortedSections = Object.keys(SECTIONS_CONFIG).filter(s => groupedProtocols[s]);
    // When searching, all sections with results are expanded
    const isSearchActive = search.trim().length > 0;

    const { theme } = useTheme();
    const glassClass = theme === 'alien' ? 'alien-glass' : theme === 'neural' ? 'glass-card' : 'cosmic-glass';

    const totalVisible = Object.values(groupedProtocols).reduce((sum, arr) => sum + arr.length, 0);

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Build flat list of all visible protocols
            const flatProtocols: Protocol[] = [];
            sortedSections.forEach(section => {
                groupedProtocols[section].forEach(p => flatProtocols.push(p));
            });

            if (flatProtocols.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(prev => {
                    const next = prev < flatProtocols.length - 1 ? prev + 1 : prev;
                    if (protocolRefs.current[next]) {
                        protocolRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                    return next;
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(prev => {
                    const next = prev > 0 ? prev - 1 : 0;
                    if (protocolRefs.current[next]) {
                        protocolRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                    return next;
                });
            } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < flatProtocols.length) {
                e.preventDefault();
                onSelect(flatProtocols[focusedIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, sortedSections, groupedProtocols, onSelect]);

    return (
        <div className="space-y-3 pr-2 custom-scrollbar pb-20">
            {/* Search */}
            <div className="relative mb-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search all sessions..."
                    className="w-full bg-neuro-900/60 border border-neuro-700 rounded-lg pl-8 pr-8 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neuro-500 transition-colors"
                    aria-label="Search protocols"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {search && (
                <p className="text-[10px] text-gray-600 font-mono px-1">
                    {totalVisible} result{totalVisible !== 1 ? 's' : ''}
                </p>
            )}

            {sortedSections.map(section => {
                const config = SECTIONS_CONFIG[section];
                const isOpen = isSearchActive || openSections[section];
                return (
                    <div key={section} className={`rounded-xl overflow-hidden transition-all duration-300 border ${isOpen ? 'bg-neuro-900/40 border-neuro-700' : 'bg-transparent border-transparent hover:bg-white/5'} ${isOpen ? glassClass : ''}`}>
                        <button onClick={() => setOpenSections(p => ({...p, [section]: !isOpen}))} className={`w-full flex items-center justify-between p-4 ${isOpen ? 'bg-neuro-800/60' : 'bg-neuro-800/30'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-black/20 ${config.color}`}><config.icon className="w-4 h-4" /></div>
                                <div className="text-left font-bold text-sm tracking-wide text-white">{config.label}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-600 font-mono">{groupedProtocols[section].length}</span>
                                {isOpen ? <ChevronDown className="w-4 h-4 text-neuro-500" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                            </div>
                        </button>
                        {isOpen && (
                            <div className="p-2 space-y-1">
                                {groupedProtocols[section].map((p, localIdx) => {
                                    // Calculate global index for keyboard navigation
                                    let globalIdx = 0;
                                    for (const s of sortedSections) {
                                        if (s === section) break;
                                        globalIdx += groupedProtocols[s].length;
                                    }
                                    globalIdx += localIdx;

                                    const isFocused = focusedIndex === globalIdx;

                                    return (
                                    <div
                                        key={p.id}
                                        ref={el => {
                                            protocolRefs.current[globalIdx] = el;
                                        }}
                                        onClick={() => onSelect(p)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onSelect(p);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Select protocol: ${p.title}`}
                                        className={`p-4 rounded-lg border-l-2 cursor-pointer transition-all outline-none ${
                                            selectedId === p.id ? 'bg-neuro-500/10 border-neuro-500' : 'bg-transparent border-transparent hover:bg-white/5 ml-4'
                                        } ${isFocused ? 'ring-2 ring-neuro-400' : ''}`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <div className="flex items-center gap-2 flex-1">
                                                <h4 className={`font-medium text-sm leading-snug ${selectedId === p.id ? 'text-white' : 'text-gray-400'}`}>{p.title}</h4>
                                                {NEW_PROTOCOL_IDS.has(p.id) && !dismissedNew.has(p.id) && (
                                                    <div className="flex items-center gap-1 bg-gradient-to-r from-neuro-500 to-blue-500 px-1.5 py-0.5 rounded text-[9px] font-bold text-black animate-pulse">
                                                        NEW
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                dismissNewBadge(p.id);
                                                            }}
                                                            className="hover:bg-black/10 rounded transition-colors"
                                                            aria-label="Dismiss new badge"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded text-gray-500 shrink-0">{p.category.toUpperCase()}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 line-clamp-2 mb-2">{p.description}</div>
                                        <div className="flex items-center gap-3">
                                            {p.duration > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-gray-600 font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(p.duration)}
                                                </span>
                                            )}
                                            {p.evidenceLevel && (
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-[10px] font-mono tracking-wide ${selectedId === p.id ? 'text-yellow-500/80' : 'text-gray-700'}`}>
                                                        {evidenceStars(p.evidenceLevel)}
                                                    </span>
                                                    <InfoTooltip
                                                        content={getEvidenceLevelTooltip(p.evidenceLevel)}
                                                        side="top"
                                                    />
                                                </div>
                                            )}
                                            {(() => {
                                                const requiresHeadphones = p.phases.some(phase =>
                                                    phase.entrainmentMode?.binaural?.enabled === true
                                                );
                                                if (requiresHeadphones) {
                                                    return (
                                                        <InfoTooltip
                                                            content="This protocol uses binaural beats which require stereo headphones. Speakers will not produce the intended brainwave entrainment effect."
                                                            side="top"
                                                        >
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] text-blue-400 font-medium">
                                                                <Headphones className="w-3 h-3" />
                                                                HEADPHONES
                                                            </span>
                                                        </InfoTooltip>
                                                    );
                                                } else {
                                                    return (
                                                        <InfoTooltip
                                                            content="Isochronic tones work through speakers - no headphones required."
                                                            side="top"
                                                        >
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[9px] text-green-400 font-medium">
                                                                <Speaker className="w-3 h-3" />
                                                                SPEAKER-SAFE
                                                            </span>
                                                        </InfoTooltip>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {sortedSections.length === 0 && (
                <div className="py-12 text-center">
                    <p className="text-xs text-gray-600">No sessions match your search</p>
                    <button onClick={() => setSearch('')} className="mt-2 text-[10px] text-neuro-500 hover:text-neuro-400 transition-colors">
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
};
