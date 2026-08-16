import React, { useState, useMemo } from 'react';
import { Protocol } from '../types.ts';
import {
  X, Clock, Headphones, Speaker,
  // Section icons
  SlidersHorizontal, Gauge, Search, Settings2,
  Volume2, Waves, Radio,
  HeartPulse, Shield, Stethoscope, Leaf, Smile,
  Moon, BedDouble,
  Zap, Crosshair, Target,
  Rocket, TrendingUp, Trophy, Award, Star,
  Brain, Cpu, Network, RotateCcw,
  Activity, Heart,
  RefreshCw, RefreshCcw,
  Droplets, Wind, Hand, BarChart2,
  Dumbbell,
  SmilePlus, Sparkles,
  Users, UsersRound, Wifi, HeartHandshake,
  Palette, Brush, PenLine, Wand2, Layers,
  Stars, Telescope, Compass, Eye, Sun,
  Flower2,
  PartyPopper,
  CloudLightning,
  FlaskConical, Microscope, TestTube, ScatterChart,
  Dna,
  // UI
  LayoutGrid, SlidersHorizontal as Tune,
} from 'lucide-react';
import { NEW_PROTOCOL_IDS } from '../constants.ts';
import { InfoTooltip } from './InfoTooltip.tsx';
import { useMotion } from '../contexts/MotionContext.tsx';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION VISUAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

type IconComponent = React.ElementType;

interface SectionStyle {
  gradient: string;
  glowColor: string;
  icons: IconComponent[];
  shortTag: string;
}

const SECTION_STYLES: Record<string, SectionStyle> = {
  'Calibration': {
    gradient: 'linear-gradient(160deg, #0d1117 0%, #1c2333 60%, #0d1117 100%)',
    glowColor: '#6b7280',
    icons: [SlidersHorizontal, Gauge, Settings2, Search, Radio],
    shortTag: 'SETUP',
  },
  'Isochronic (Speakers)': {
    gradient: 'linear-gradient(160deg, #001a20 0%, #003d4d 60%, #001520 100%)',
    glowColor: '#25f4e2',
    icons: [Volume2, Waves, Radio, Volume2, Waves],
    shortTag: 'ISO',
  },
  'Suffering Reduction': {
    gradient: 'linear-gradient(160deg, #0a1628 0%, #1a3a5c 60%, #0a1220 100%)',
    glowColor: '#60a5fa',
    icons: [HeartPulse, Shield, Stethoscope, Leaf, Smile],
    shortTag: 'RELIEF',
  },
  'Sleep & Recovery': {
    gradient: 'linear-gradient(160deg, #050514 0%, #1a1840 60%, #06031a 100%)',
    glowColor: '#818cf8',
    icons: [Moon, BedDouble, Moon, Stars, Moon, BedDouble],
    shortTag: 'DELTA',
  },
  'Performance Focus': {
    gradient: 'linear-gradient(160deg, #120a00 0%, #3d2800 60%, #1a1000 100%)',
    glowColor: '#fbbf24',
    icons: [Zap, Crosshair, Target, Zap, Target, Crosshair],
    shortTag: 'ALPHA',
  },
  'Performance Advanced': {
    gradient: 'linear-gradient(160deg, #1a0f00 0%, #4a2e00 60%, #1a0a00 100%)',
    glowColor: '#f97316',
    icons: [Rocket, TrendingUp, Trophy, Award, Star, Rocket],
    shortTag: 'BETA',
  },
  'Neural Rewiring': {
    gradient: 'linear-gradient(160deg, #1a0528 0%, #3d0f5c 60%, #12031a 100%)',
    glowColor: '#a78bfa',
    icons: [Brain, Cpu, Network, Brain, RotateCcw, Cpu],
    shortTag: 'GAMMA',
  },
  'Autonomic Mastery': {
    gradient: 'linear-gradient(160deg, #200510 0%, #500f2a 60%, #150308 100%)',
    glowColor: '#f43f5e',
    icons: [Activity, Heart, HeartPulse, Activity, Heart, Activity],
    shortTag: 'HRV',
  },
  'Recovery & Addiction': {
    gradient: 'linear-gradient(160deg, #001a1a 0%, #004040 60%, #001212 100%)',
    glowColor: '#14b8a6',
    icons: [RotateCcw, RefreshCw, RefreshCcw, Leaf, RotateCcw, RefreshCw],
    shortTag: 'THETA',
  },
  'Flow State': {
    gradient: 'linear-gradient(160deg, #0f1500 0%, #2d3d00 60%, #0a1000 100%)',
    glowColor: '#a3e635',
    icons: [Waves, Droplets, Wind, Hand, Droplets, BarChart2],
    shortTag: 'ALPHA',
  },
  'Athletic Performance': {
    gradient: 'linear-gradient(160deg, #1a0800 0%, #4a1800 60%, #1a0500 100%)',
    glowColor: '#fb923c',
    icons: [Dumbbell, Zap, Trophy, Activity, Dumbbell, Trophy],
    shortTag: 'BETA',
  },
  'Emotional Mastery': {
    gradient: 'linear-gradient(160deg, #1a0520 0%, #420c50 60%, #100315 100%)',
    glowColor: '#e879f9',
    icons: [SmilePlus, Smile, Heart, Brain, Sparkles, SmilePlus],
    shortTag: 'ALPHA',
  },
  'Relationship & Social': {
    gradient: 'linear-gradient(160deg, #00151a 0%, #003845 60%, #000f14 100%)',
    glowColor: '#22d3ee',
    icons: [Users, HeartHandshake, UsersRound, Wifi, Users, HeartHandshake],
    shortTag: 'THETA',
  },
  'Creative Expression': {
    gradient: 'linear-gradient(160deg, #001a08 0%, #004020 60%, #000f05 100%)',
    glowColor: '#4ade80',
    icons: [Palette, Brush, PenLine, Wand2, Layers, Palette],
    shortTag: 'ALPHA',
  },
  'Spiritual Integration': {
    gradient: 'linear-gradient(160deg, #0d0028 0%, #2a0060 60%, #080015 100%)',
    glowColor: '#8b5cf6',
    icons: [Stars, Sparkles, Eye, Compass, Star, Stars],
    shortTag: 'THETA',
  },
  'Advanced Research': {
    gradient: 'linear-gradient(160deg, #000a20 0%, #001a4d 60%, #000514 100%)',
    glowColor: '#6366f1',
    icons: [FlaskConical, Microscope, TestTube, ScatterChart, Brain, FlaskConical],
    shortTag: 'EXP',
  },
  'Biohacking & Longevity': {
    gradient: 'linear-gradient(160deg, #001a10 0%, #004030 60%, #000f08 100%)',
    glowColor: '#34d399',
    icons: [Dna, Leaf, Trophy, Zap, Dna, Leaf],
    shortTag: 'OPT',
  },
  'Consciousness Expansion': {
    gradient: 'linear-gradient(160deg, #1a0028 0%, #4a005c 60%, #12001e 100%)',
    glowColor: '#c084fc',
    icons: [Stars, Telescope, Compass, Sparkles, Eye, Stars],
    shortTag: 'DMT',
  },
  'Cannabis Mimicry': {
    gradient: 'linear-gradient(160deg, #021505 0%, #093d14 60%, #010e03 100%)',
    glowColor: '#86efac',
    icons: [Leaf, Flower2, Wind, Leaf, Flower2, Leaf],
    shortTag: 'THETA',
  },
  'MDMA Mimicry': {
    gradient: 'linear-gradient(160deg, #1a0014 0%, #500040 60%, #10000c 100%)',
    glowColor: '#f9a8d4',
    icons: [HeartHandshake, Heart, PartyPopper, SmilePlus, Heart, HeartHandshake],
    shortTag: 'ALPHA',
  },
  'Stimulant Mimicry': {
    gradient: 'linear-gradient(160deg, #200a00 0%, #5a2800 60%, #150500 100%)',
    glowColor: '#fdba74',
    icons: [Zap, Gauge, CloudLightning, Activity, Zap, Gauge],
    shortTag: 'BETA',
  },
  'Psychedelic Mimicry': {
    gradient: 'linear-gradient(160deg, #1a001a 0%, #4d0060 60%, #100010 100%)',
    glowColor: '#d8b4fe',
    icons: [Sparkles, Stars, Eye, Telescope, Sun, Sparkles],
    shortTag: 'GAMMA',
  },
};

const DEFAULT_STYLE: SectionStyle = {
  gradient: 'linear-gradient(160deg, #0a0a0f 0%, #1a1a2e 60%, #0a0a0f 100%)',
  glowColor: '#25f4e2',
  icons: [Crosshair],
  shortTag: 'EXP',
};

// ─────────────────────────────────────────────────────────────────────────────
// VIBE FILTER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface VibeFilter {
  id: string;
  label: string;
  Icon: IconComponent;
  sections: string[];
}

const VIBE_FILTERS: VibeFilter[] = [
  { id: 'all',      label: 'All',           Icon: LayoutGrid,  sections: [] },
  { id: 'rest',     label: 'Deep Rest',     Icon: Moon,        sections: ['Sleep & Recovery', 'Calibration'] },
  { id: 'focus',    label: 'Focus',         Icon: Zap,         sections: ['Performance Focus', 'Performance Advanced', 'Flow State'] },
  { id: 'neural',   label: 'Neural',        Icon: Brain,       sections: ['Neural Rewiring', 'Autonomic Mastery', 'Biohacking & Longevity'] },
  { id: 'recovery', label: 'Recovery',      Icon: HeartPulse,  sections: ['Recovery & Addiction', 'Suffering Reduction', 'Athletic Performance'] },
  { id: 'soul',     label: 'Inner Journey', Icon: Sparkles,    sections: ['Spiritual Integration', 'Emotional Mastery', 'Creative Expression', 'Relationship & Social'] },
  { id: 'expand',   label: 'Expand',        Icon: Stars,       sections: ['Consciousness Expansion', 'Cannabis Mimicry', 'MDMA Mimicry', 'Stimulant Mimicry', 'Psychedelic Mimicry', 'Advanced Research'] },
  { id: 'iso',      label: 'Speakers',      Icon: Volume2,     sections: ['Isochronic (Speakers)'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getBeatLabel(hz: number): string {
  if (hz < 4)  return 'DELTA';
  if (hz < 8)  return 'THETA';
  if (hz < 13) return 'ALPHA';
  if (hz < 30) return 'BETA';
  return 'GAMMA';
}

/** Deterministic, stable index based on string content */
function stableHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getProtocolIcon(p: Protocol): IconComponent {
  const style = SECTION_STYLES[p.section ?? ''] ?? DEFAULT_STYLE;
  return style.icons[stableHash(p.id) % style.icons.length];
}

function getBadgeLabel(p: Protocol): string {
  const beat = p.phases[0]?.beat;
  if (beat != null) return getBeatLabel(beat);
  return (SECTION_STYLES[p.section ?? ''] ?? DEFAULT_STYLE).shortTag;
}

function getPhaseProfile(p: Protocol) {
  const beats = p.phases
    .map(phase => phase.beat)
    .filter((beat): beat is number => Number.isFinite(beat));
  const totalDuration = p.phases.reduce((total, phase) => total + Math.max(phase.duration, 0), 0);
  const minBeat = beats.length > 0 ? Math.min(...beats) : 4;
  const maxBeat = beats.length > 0 ? Math.max(...beats) : 12;
  const avgBeat = beats.length > 0
    ? beats.reduce((total, beat) => total + beat, 0) / beats.length
    : 8;
  const complexity = Math.min(1, p.phases.length / 8);
  const motionSeed = stableHash(`${p.id}:${p.section ?? ''}`);

  return {
    avgBeat,
    minBeat,
    maxBeat,
    complexity,
    phaseCount: Math.max(1, p.phases.length),
    totalDuration: totalDuration > 0 ? totalDuration : p.duration,
    motionSeed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ProtocolGalleryProps {
  protocols: Protocol[];
  selectedId: string | null;
  mode: 'scientific' | 'speculative';
  onSelect: (p: Protocol) => void;
  onNavigateToSession: () => void;
}

export const ProtocolGallery: React.FC<ProtocolGalleryProps> = ({
  protocols,
  selectedId,
  mode,
  onSelect,
  onNavigateToSession,
}) => {
  const { reduceMotion } = useMotion();
  const [activeVibe, setActiveVibe] = useState('all');
  const [search, setSearch]         = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const filtered = useMemo(() => {
    const vibe = VIBE_FILTERS.find(f => f.id === activeVibe)!;
    const q    = search.trim().toLowerCase();
    return protocols.filter(p => {
      if (mode === 'scientific' && (p.category === 'speculative' || p.evidenceLevel === 'V')) return false;
      if (vibe.sections.length > 0 && !vibe.sections.includes(p.section ?? '')) return false;
      if (q) {
        return (
          p.title.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.usageGoal ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [protocols, mode, activeVibe, search]);

  const handleCardTap = (p: Protocol) => {
    onSelect(p);
    onNavigateToSession();
  };

  const toggleSearch = () => {
    setShowSearch(v => !v);
    setSearch('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-neuro-500/60 font-medium">SynSync Pro</p>
          <h1 className="text-xl font-light tracking-tight text-white mt-0.5">
            Atmospheric <span className="font-semibold">Gallery</span>
          </h1>
        </div>
        <button
          onClick={toggleSearch}
          className="w-9 h-9 rounded-full bg-neuro-500/10 flex items-center justify-center text-neuro-500 border border-neuro-500/20 transition-colors hover:bg-neuro-500/20"
          aria-label="Toggle search"
        >
          {showSearch
            ? <X className="w-5 h-5" />
            : <Search className="w-5 h-5" />
          }
        </button>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      {showSearch && (
        <div className="px-5 pb-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search all sessions…"
              className="w-full bg-white/5 border border-neuro-500/20 rounded-full pl-4 pr-10 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-neuro-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Vibe filter pills ──────────────────────────────────────────── */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {VIBE_FILTERS.map(vibe => (
            <button
              key={vibe.id}
              onClick={() => setActiveVibe(vibe.id)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all ${
                activeVibe === vibe.id
                  ? 'bg-neuro-500 text-black'
                  : 'bg-white/5 border border-neuro-500/15 text-white/60 hover:text-white hover:border-neuro-500/30'
              }`}
              style={activeVibe === vibe.id ? { boxShadow: '0 0 12px rgba(37,244,226,0.4)' } : undefined}
              aria-label={`Filter: ${vibe.label}`}
            >
              <vibe.Icon className="w-4 h-4 shrink-0" />
              {vibe.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count + sort row ──────────────────────────────────────────── */}
      <div className="px-5 pb-3 flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
          {filtered.length} Protocol{filtered.length !== 1 ? 's' : ''}
        </span>
        <Tune className="w-4 h-4 text-white/30" />
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 safe-area-pb" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-neuro-500/20 mb-3" strokeWidth={1} />
            <p className="text-sm text-white/30">No protocols match this filter</p>
            <button
              onClick={() => { setActiveVibe('all'); setSearch(''); }}
              className="mt-3 text-xs text-neuro-500/70 hover:text-neuro-500 transition-colors"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => {
              const style      = SECTION_STYLES[p.section ?? ''] ?? DEFAULT_STYLE;
              const IconComp   = getProtocolIcon(p);
              const badge      = getBadgeLabel(p);
              const isSelected = selectedId === p.id;
              const profile    = getPhaseProfile(p);

              const glowRgba = `${style.glowColor}55`;
              const visualColor = style.glowColor === '#6b7280' ? '#9ca3af' : style.glowColor;
              const waveOpacity = 0.36 + profile.complexity * 0.24;
              const fieldRotation = (profile.motionSeed % 34) - 17;
              const pulseSize = 36 + Math.min(52, profile.avgBeat * 1.5);
              const phaseBars = p.phases.length > 0
                ? p.phases.slice(0, 8)
                : [{ duration: p.duration, beat: profile.avgBeat }];

              return (
                <button
                  key={p.id}
                  onClick={() => handleCardTap(p)}
                  className={`group flex flex-col gap-2.5 rounded-xl p-2.5 text-left ${
                    reduceMotion ? '' : 'transition-all duration-200'
                  } ${
                    reduceMotion ? '' : (isSelected ? 'scale-[0.98]' : 'hover:scale-[1.02] active:scale-[0.98]')
                  }`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: isSelected
                      ? '1px solid rgba(37,244,226,0.6)'
                      : '1px solid rgba(37,244,226,0.1)',
                    boxShadow: isSelected
                      ? '0 0 20px rgba(37,244,226,0.25), inset 0 0 20px rgba(37,244,226,0.05)'
                      : undefined,
                  }}
                  aria-label={`Select ${p.title}`}
                  aria-pressed={isSelected}
                >
                  {/* ── Card image area ──────────────────────────────── */}
                  <div
                    className="relative w-full rounded-lg overflow-hidden"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {/* Gradient bg */}
                    <div className="absolute inset-0" style={{ background: style.gradient }} />

                    {/* Ambient glow from bottom */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at 50% 90%, ${glowRgba} 0%, transparent 65%)`,
                      }}
                    />

                    {/* Data-driven field texture */}
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(${fieldRotation}deg, ${visualColor}33 0 1px, transparent 1px 18px),
                          radial-gradient(circle at 50% 42%, ${visualColor}33 0, transparent ${pulseSize}px)
                        `,
                      }}
                    />

                    <svg
                      className="absolute inset-x-2 top-10 z-10 h-24 w-[calc(100%-1rem)]"
                      viewBox="0 0 160 86"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      {[0, 1, 2].map(row => {
                        const y = 24 + row * 18;
                        const amplitude = 6 + ((profile.maxBeat + row * 3) % 9);
                        const phase = (profile.motionSeed % 29) + row * 11;
                        return (
                          <path
                            key={row}
                            d={`M 0 ${y} C 24 ${y - amplitude} 38 ${y + amplitude + phase % 5} 58 ${y} S 96 ${y - amplitude} 118 ${y} S 146 ${y + amplitude} 160 ${y}`}
                            fill="none"
                            stroke={visualColor}
                            strokeWidth={row === 1 ? 1.5 : 1}
                            strokeOpacity={waveOpacity - row * 0.06}
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute inset-x-3 bottom-9 z-20 flex h-7 items-end gap-1" aria-hidden="true">
                      {phaseBars.map((phase, index) => {
                        const width = `${Math.max(10, (Math.max(phase.duration, 1) / profile.totalDuration) * 100)}%`;
                        const height = `${30 + Math.min(65, ((phase.beat ?? profile.avgBeat) / Math.max(profile.maxBeat, 1)) * 65)}%`;
                        return (
                          <span
                            key={`${p.id}-phase-${index}`}
                            className="min-w-[4px] flex-1 rounded-t-sm"
                            style={{
                              width,
                              height,
                              background: `linear-gradient(180deg, ${visualColor}, ${visualColor}44)`,
                              boxShadow: `0 0 10px ${visualColor}55`,
                              opacity: 0.42 + index / 18,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Bottom fade-to-black */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent z-10" />

                    {/* Frequency badge — top left */}
                    <div className="absolute top-2 left-2 z-20">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider"
                        style={{
                          background: 'rgba(0,0,0,0.55)',
                          backdropFilter: 'blur(8px)',
                          color: '#25f4e2',
                          border: '1px solid rgba(37,244,226,0.35)',
                        }}
                      >
                        {badge}
                      </span>
                    </div>

                    {/* Selected check — top right */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-neuro-500 flex items-center justify-center">
                        <X className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                    )}

                    {/* NEW badge */}
                    {NEW_PROTOCOL_IDS.has(p.id) && !dismissedNew.has(p.id) && (
                      <div className={`absolute ${isSelected ? 'top-9' : 'top-2'} right-2 z-20 flex items-center gap-1 bg-gradient-to-r from-neuro-500 to-blue-500 px-2 py-0.5 rounded-full text-[9px] font-bold text-black animate-pulse`}>
                        NEW
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNewBadge(p.id);
                          }}
                          className="hover:bg-black/10 rounded-full transition-colors w-3 h-3 flex items-center justify-center"
                          aria-label="Dismiss new badge"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}

                    {/* Large centred icon */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <IconComp
                        className={`select-none ${reduceMotion ? '' : 'transition-transform duration-300 group-hover:scale-110'}`}
                        style={{
                          width: 64,
                          height: 64,
                          color: style.glowColor,
                          opacity: 0.65,
                          filter: `drop-shadow(0 0 18px ${style.glowColor})`,
                          strokeWidth: 1,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Card metadata ─────────────────────────────────── */}
                  <div className="px-0.5">
                    <h4 className="text-[13px] font-semibold text-white leading-snug line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {formatDuration(p.duration)}
                      {p.phases[0]?.beat != null && (
                        <span className="ml-0.5">· {p.phases[0].beat}Hz</span>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
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
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[8px] text-blue-400 font-medium">
                                <Headphones className="w-2.5 h-2.5" />
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
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[8px] text-green-400 font-medium">
                                <Speaker className="w-2.5 h-2.5" />
                                SPEAKER-SAFE
                              </span>
                            </InfoTooltip>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
