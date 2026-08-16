import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pause, Play, ChevronLeft, Timer, Maximize2, Minimize2,
  Waves, Activity, BarChart3, AudioWaveform, CircleDot, Flower2, Hexagon,
  Network, Orbit, Zap, Flower, Sun, Grid3x3, Sparkles,
  Droplet, Grip, CircleDashed, Droplets, Magnet, Flame, Star, Wind,
  type LucideIcon,
} from 'lucide-react';
import { Protocol, AudioState } from '../types.ts';
import { AudioEngine } from '../services/AudioEngine.ts';
import { Visualizer } from './Visualizer.tsx';
import { SessionProgress } from './SessionProgress.tsx';
import { GammaVisualEntrainment } from './GammaVisualEntrainment.tsx';
import { protocolSupportsPhotic } from '../utils/photicSafety.ts';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type VizMode =
  | 'cymatics'
  | 'oscilloscope'
  | 'spectrum'
  | 'waveform'
  | 'pulse'
  | 'fractal'
  | 'sacred_geometry'
  | 'neural'
  | 'cosmic'
  | 'hyper'
  | 'symmetry'
  | 'galactic'
  | 'cyber'
  | 'dmt';

type CymaticMedium = 'water' | 'sand' | 'mercury' | 'oil' | 'ferrofluid' | 'plasma' | 'gold' | 'aether';

interface VizModeOption {
  id: VizMode;
  label: string;
  icon: LucideIcon;
  expertOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const VIZ_MODES: VizModeOption[] = [
  { id: 'cymatics',       label: 'Cymatics',  icon: Waves         },
  { id: 'oscilloscope',   label: 'Scope',     icon: Activity      },
  { id: 'spectrum',       label: 'Spectrum',  icon: BarChart3     },
  { id: 'waveform',       label: 'Wave',      icon: AudioWaveform },
  { id: 'pulse',          label: 'Pulse',     icon: CircleDot     },
  { id: 'fractal',        label: 'Fractal',   icon: Flower2       },
  { id: 'sacred_geometry',label: 'Sacred',    icon: Hexagon       },
  { id: 'neural',         label: 'Neural',    icon: Network,  expertOnly: true },
  { id: 'cosmic',         label: 'Cosmic',    icon: Orbit,    expertOnly: true },
  { id: 'hyper',          label: 'Hyper',     icon: Zap,      expertOnly: true },
  { id: 'symmetry',       label: 'Symmetry',  icon: Flower,   expertOnly: true },
  { id: 'galactic',       label: 'Galactic',  icon: Sun,      expertOnly: true },
  { id: 'cyber',          label: 'Cyber',     icon: Grid3x3,  expertOnly: true },
  { id: 'dmt',            label: 'DMT',       icon: Sparkles, expertOnly: true },
];

const CYMATIC_MEDIA: CymaticMedium[] = [
  'water', 'sand', 'mercury', 'oil', 'ferrofluid', 'plasma', 'gold', 'aether',
];

const MEDIUM_ICONS: Record<CymaticMedium, LucideIcon> = {
  water:      Droplet,
  sand:       Grip,
  mercury:    CircleDashed,
  oil:        Droplets,
  ferrofluid: Magnet,
  plasma:     Flame,
  gold:       Star,
  aether:     Wind,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface VisualizerViewProps {
  audioEngine: AudioEngine;
  activeProtocol: Protocol | null;
  audioState: AudioState;
  uiMode: 'guided' | 'expert';
  isPlayingCurrent: boolean;
  onPlay: () => void;
  onBack: () => void;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  audioEngine,
  activeProtocol,
  audioState,
  uiMode,
  isPlayingCurrent,
  onPlay,
  onBack,
}) => {
  const [vizMode,       setVizMode]       = useState<VizMode>('cymatics');
  const [medium,        setMedium]        = useState<CymaticMedium>('water');
  const [showProgress,  setShowProgress]  = useState(false);
  const [showGammaFlash, setShowGammaFlash] = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const photicEligible = protocolSupportsPhotic(activeProtocol?.id);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }, []);

  const availableModes = uiMode === 'expert'
    ? VIZ_MODES
    : VIZ_MODES.filter(m => !m.expertOnly);

  const cycleMedium = () => {
    const idx = CYMATIC_MEDIA.indexOf(medium);
    setMedium(CYMATIC_MEDIA[(idx + 1) % CYMATIC_MEDIA.length]);
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-black overflow-hidden relative">

      {/* ── Full-screen visualizer canvas ──────────────────────────────── */}
      <div className="absolute inset-0">
        <Visualizer
          audioEngine={audioEngine}
          isPlaying={audioState.isPlaying}
          mode={vizMode}
          complexity={uiMode === 'expert' ? 0.8 : 0.6}
          background="#000000"
          hdEnabled={uiMode === 'expert'}
          cymaticMedium={medium}
        />
      </div>

      {/* ── Top overlay ────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pt-safe-top pt-4 pb-8"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 backdrop-blur-md border border-white/10 shrink-0"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-label="Back to session"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Protocol title */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] uppercase tracking-widest font-semibold"
            style={{ color: 'rgba(37,244,226,0.7)' }}
          >
            {audioState.isPlaying && !audioState.isPaused ? 'Now Playing' : 'Paused'}
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {activeProtocol?.title ?? 'Select a protocol to begin'}
          </p>
        </div>

        {/* Cymatic medium chip — only shown in cymatics mode */}
        {vizMode === 'cymatics' && (
          <button
            onClick={cycleMedium}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize backdrop-blur-md border transition-all"
            style={{
              background: 'rgba(0,0,0,0.55)',
              borderColor: 'rgba(37,244,226,0.4)',
              color: '#25f4e2',
            }}
            aria-label={`Cymatic medium: ${medium}. Tap to cycle.`}
          >
            {React.createElement(MEDIUM_ICONS[medium], { size: 14, strokeWidth: 1.75 })}
            {medium}
          </button>
        )}

        {/* 40 Hz photic entrainment launcher — gamma protocols only */}
        {photicEligible && (
          <button
            onClick={() => setShowGammaFlash(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold backdrop-blur-md border transition-all"
            style={{
              background: 'rgba(245,166,35,0.12)',
              borderColor: 'rgba(245,166,35,0.5)',
              color: '#f5a623',
            }}
            aria-label="Open 40 Hz visual entrainment (photosensitivity screening required)"
          >
            <Zap size={13} strokeWidth={2} />
            40Hz Light
          </button>
        )}

        {/* Session progress toggle */}
        {activeProtocol && (
          <button
            onClick={() => setShowProgress(v => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
            style={{
              background: showProgress ? 'rgba(37,244,226,0.2)' : 'rgba(0,0,0,0.5)',
              color: showProgress ? '#25f4e2' : 'rgba(255,255,255,0.5)',
            }}
            aria-label="Toggle session progress"
          >
            <Timer size={18} />
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={handleFullscreen}
          className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.5)' }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen
            ? <Minimize2 className="w-4 h-4" />
            : <Maximize2 className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── Inline session progress (optional) ────────────────────────── */}
      {showProgress && activeProtocol && (
        <div
          className="relative z-10 mx-4"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            border: '1px solid rgba(37,244,226,0.15)',
          }}
        >
          <div className="p-3">
            <SessionProgress audioEngine={audioEngine} />
          </div>
        </div>
      )}

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Bottom overlay ─────────────────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }}
      >
        {/* Viz mode picker */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {availableModes.map(m => (
              <button
                key={m.id}
                onClick={() => setVizMode(m.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-semibold transition-all border"
                style={
                  vizMode === m.id
                    ? {
                        background: '#25f4e2',
                        color: '#000',
                        border: '1px solid #25f4e2',
                        boxShadow: '0 0 10px rgba(37,244,226,0.5)',
                      }
                    : {
                        background: 'rgba(0,0,0,0.55)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(8px)',
                      }
                }
                aria-label={`Switch to ${m.label} visualization`}
                aria-pressed={vizMode === m.id}
              >
                <m.icon size={14} strokeWidth={1.75} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Play / pause + info row */}
        <div className="flex items-center gap-4 px-6 pb-8">
          {/* Protocol meta */}
          <div className="flex-1 min-w-0">
            {activeProtocol ? (
              <>
                <p className="text-xs font-semibold text-white truncate">
                  {activeProtocol.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Phase {audioState.currentPhaseIndex + 1} · {activeProtocol.phases[0]?.beat ?? '—'}Hz
                </p>
              </>
            ) : (
              <p className="text-xs text-white/30">Select a protocol from the gallery</p>
            )}
          </div>

          {/* Play / Pause */}
          <button
            onClick={onPlay}
            disabled={!activeProtocol}
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={
              isPlayingCurrent
                ? {
                    background: 'rgba(37,244,226,0.12)',
                    border: '2px solid #25f4e2',
                    color: '#25f4e2',
                  }
                : {
                    background: '#25f4e2',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(37,244,226,0.4)',
                  }
            }
            aria-label={isPlayingCurrent ? 'Pause' : 'Play'}
          >
            {isPlayingCurrent
              ? <Pause className="w-6 h-6 fill-current" />
              : <Play  className="w-6 h-6 ml-0.5 fill-current" />
            }
          </button>
        </div>
      </div>

      {/* 40 Hz photic entrainment overlay (self-gates behind screening) */}
      {showGammaFlash && (
        <GammaVisualEntrainment
          audioEngine={audioEngine}
          onClose={() => setShowGammaFlash(false)}
        />
      )}
    </div>
  );
};
