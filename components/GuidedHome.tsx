import React, { useState, useMemo } from 'react';
import { Moon, Target, Wind, Zap, Heart, Sparkles, LayoutGrid, ArrowLeft, Play, Search, Clock, FileText, ChevronRight } from 'lucide-react';
import { Protocol } from '../types.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return '< 1 min';
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function evidenceStars(level?: string): { filled: number; total: number; label: string } {
  const map: Record<string, number> = { I: 5, II: 4, III: 3, IV: 2, V: 1 };
  const filled = map[level ?? ''] ?? 0;
  const label =
    filled === 5 ? 'Strongest evidence' :
    filled === 4 ? 'Strong evidence' :
    filled === 3 ? 'Moderate evidence' :
    filled === 2 ? 'Emerging evidence' :
    filled === 1 ? 'Exploratory' : '';
  return { filled, total: 5, label };
}

// ─── Goal configuration ───────────────────────────────────────────────────────

interface Goal {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  sections: string[];
}

const GOALS: Goal[] = [
  {
    id: 'sleep',
    label: 'Sleep',
    description: 'Fall asleep faster, sleep deeper',
    icon: Moon,
    accentColor: 'text-blue-300',
    borderColor: 'border-blue-700/50 hover:border-blue-500/70',
    bgColor: 'bg-blue-950/40',
    sections: ['Sleep & Recovery'],
  },
  {
    id: 'focus',
    label: 'Focus',
    description: 'Sharp thinking, mental clarity',
    icon: Target,
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-700/40 hover:border-yellow-500/60',
    bgColor: 'bg-yellow-950/30',
    sections: ['Performance Focus', 'Performance Advanced', 'Neural Rewiring', 'Flow State'],
  },
  {
    id: 'calm',
    label: 'Calm',
    description: 'Ease stress, find your center',
    icon: Wind,
    accentColor: 'text-teal-400',
    borderColor: 'border-teal-700/40 hover:border-teal-500/60',
    bgColor: 'bg-teal-950/30',
    sections: ['Suffering Reduction', 'Autonomic Mastery', 'Spiritual Integration'],
  },
  {
    id: 'energy',
    label: 'Energy',
    description: 'Boost drive and vitality',
    icon: Zap,
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-700/40 hover:border-orange-500/60',
    bgColor: 'bg-orange-950/30',
    sections: ['Athletic Performance', 'Biohacking & Longevity', 'Stimulant Mimicry'],
  },
  {
    id: 'mood',
    label: 'Mood',
    description: 'Lift spirits, emotional balance',
    icon: Heart,
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-700/40 hover:border-pink-500/60',
    bgColor: 'bg-pink-950/30',
    sections: ['Emotional Mastery', 'Recovery & Addiction', 'Relationship & Social', 'MDMA Mimicry'],
  },
  {
    id: 'creativity',
    label: 'Creativity',
    description: 'Unlock flow and imagination',
    icon: Sparkles,
    accentColor: 'text-green-400',
    borderColor: 'border-green-700/40 hover:border-green-500/60',
    bgColor: 'bg-green-950/30',
    sections: ['Creative Expression', 'Cannabis Mimicry', 'Flow State', 'Consciousness Expansion'],
  },
  {
    id: 'all',
    label: 'All Sessions',
    description: 'Browse everything',
    icon: LayoutGrid,
    accentColor: 'text-neuro-400',
    borderColor: 'border-neuro-700/50 hover:border-neuro-500/60',
    bgColor: 'bg-neuro-900/40',
    sections: [],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EvidencePipsProps {
  level?: string;
}
const EvidencePips: React.FC<EvidencePipsProps> = ({ level }) => {
  const { filled, total, label } = evidenceStars(level);
  if (!filled) return null;
  return (
    <span
      className="text-[10px] font-mono tracking-wider text-yellow-500/70"
      title={label}
      aria-label={label}
    >
      {'★'.repeat(filled)}{'☆'.repeat(total - filled)}
    </span>
  );
};

interface ProtocolCardProps {
  protocol: Protocol;
  isSelected: boolean;
  onSelect: (p: Protocol) => void;
}
const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol: p, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(p)}
    className={`p-4 rounded-xl border cursor-pointer transition-all ${
      isSelected
        ? 'bg-neuro-500/10 border-neuro-500'
        : 'bg-neuro-900/40 border-neuro-700/50 hover:border-neuro-600/80 hover:bg-neuro-800/40'
    }`}
  >
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm leading-snug mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
          {p.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
      </div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? 'bg-neuro-500 text-black' : 'bg-neuro-800/80 text-neuro-500'
        }`}
      >
        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
      </div>
    </div>

    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
      {p.duration > 0 && (
        <span className="flex items-center gap-1 text-[10px] text-gray-600 font-mono">
          <Clock className="w-3 h-3" />
          {formatDuration(p.duration)}
        </span>
      )}
      <EvidencePips level={p.evidenceLevel} />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface GuidedHomeProps {
  protocols: Protocol[];
  selectedId: string | null;
  onSelect: (p: Protocol) => void;
  prescription?: string;
}

export const GuidedHome: React.FC<GuidedHomeProps> = ({ protocols, selectedId, onSelect, prescription }) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeGoal = GOALS.find(g => g.id === selectedGoalId);

  // Extract keywords from prescription text for matching
  const rxKeywords = useMemo(() => {
    if (!prescription?.trim()) return [];
    return prescription.toLowerCase()
      .split(/[\s,;.!?()\[\]]+/)
      .filter(w => w.length > 3)
      .slice(0, 40); // cap to avoid perf issues on very long prescriptions
  }, [prescription]);

  const filteredProtocols = useMemo(() => {
    let list = protocols;

    // Filter out calibration/expert-only protocols in Guided mode
    // "1. Getting Started" contains Stereo Verification Test, IAPF Detection, etc.
    list = list.filter(p => p.section !== '1. Getting Started');

    if (selectedGoalId && selectedGoalId !== 'all' && activeGoal) {
      list = list.filter(p => activeGoal.sections.includes(p.section ?? ''));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.usageGoal ?? '').toLowerCase().includes(q)
      );
    }

    // When prescription is active, sort matching protocols to the top
    if (rxKeywords.length > 0 && !search.trim()) {
      const score = (p: Protocol): number => {
        const haystack = [p.title, p.description, p.usageGoal, p.mechanismOfAction, p.researchContext]
          .filter(Boolean).join(' ').toLowerCase();
        return rxKeywords.filter(kw => haystack.includes(kw)).length;
      };
      list = [...list].sort((a, b) => score(b) - score(a));
    }

    return list;
  }, [protocols, selectedGoalId, activeGoal, search, rxKeywords]);

  // ── Goal tiles view (no goal selected) ──────────────────────────────────────
  if (!selectedGoalId) {
    return (
      <div className="space-y-4 pb-4">
        {/* Prescription banner */}
        {prescription?.trim() && (
          <div className="flex items-start gap-3 bg-neuro-500/10 border border-neuro-500/30 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-neuro-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5 text-neuro-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neuro-400 mb-0.5">
                Prescription Active
              </p>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Sessions are sorted by relevance to your clinical profile. Most relevant sessions appear first.
              </p>
            </div>
            <button
              onClick={() => setSelectedGoalId('all')}
              className="shrink-0 flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-widest text-neuro-500 hover:text-neuro-300 transition-colors"
              aria-label="View personalized sessions"
            >
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] px-1">
          What do you want to feel?
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`p-4 rounded-xl border text-left transition-all ${goal.bgColor} ${goal.borderColor}`}
            >
              <goal.icon className={`w-5 h-5 ${goal.accentColor} mb-2.5`} />
              <div className="font-bold text-sm text-white mb-0.5">{goal.label}</div>
              <div className="text-[10px] text-gray-500 leading-snug">{goal.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Protocol list view (goal selected) ──────────────────────────────────────
  return (
    <div className="space-y-3 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setSelectedGoalId(null); setSearch(''); }}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
          aria-label="Back to goals"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {activeGoal && (
          <span className={`font-bold text-sm ${activeGoal.accentColor}`}>{activeGoal.label}</span>
        )}
        <span className="text-[10px] text-gray-600 font-mono ml-auto">
          {filteredProtocols.length} session{filteredProtocols.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="w-full bg-neuro-900/60 border border-neuro-700 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neuro-500 transition-colors"
          aria-label="Search sessions"
        />
      </div>

      {/* Protocol cards */}
      <div className="space-y-2">
        {filteredProtocols.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-gray-600">No sessions found</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-[10px] text-neuro-500 hover:text-neuro-400 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredProtocols.map(p => (
            <ProtocolCard
              key={p.id}
              protocol={p}
              isSelected={selectedId === p.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};
