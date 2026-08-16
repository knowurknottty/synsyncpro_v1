import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  BookOpen,
  ShieldAlert,
  Microscope,
  FileText,
  Target,
  Brain,
  Headphones,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Clock,
  Wind,
  Mic2,
  Hexagon,
  Settings,
  ChevronLeft,
  Download,
  User,
} from 'lucide-react';
import { Protocol, AudioState, SessionGuidance, MantraProfile, AccessSession } from '../types.ts';
import { Visualizer } from './Visualizer.tsx';
import { ProtocolList } from './ProtocolList.tsx';
import { SessionProgress } from './SessionProgress.tsx';
import { SourcesModal } from './SourcesModal.tsx';
import { LegalModal } from './LegalModal.tsx';
import { DownloadPortal } from './DownloadPortal.tsx';
import { SafetyGateModal } from './SafetyGateModal.tsx';
import { ManualTuningPanel } from './ManualTuningPanel.tsx';
import { GuidedHome } from './GuidedHome.tsx';
import { PhaseTimeline } from './PhaseTimeline.tsx';
import { GuidanceOverlay } from './GuidanceOverlay.tsx';
import { WavExporter } from './WavExporter.tsx';
import { Logo } from './Logo.tsx';
import { UserProfile } from './UserProfile.tsx';
import { AudioEngine } from '../services/AudioEngine.ts';
import { ProtocolVault } from '../services/ProtocolVault.ts';
import { useSessionShell } from './shell/useSessionShell.ts';

interface DesktopAppProps {
  audioEngine: AudioEngine;
  activeProtocol: Protocol | null;
  audioState: AudioState;
  appMode: 'scientific' | 'speculative';
  uiMode: 'guided' | 'expert';
  isPlayingCurrent: boolean;
  modals: Record<string, boolean>;
  accessSession: AccessSession;
  onSelectProtocol: (protocol: Protocol) => void;
  onSetAppMode: (mode: 'scientific' | 'speculative') => void;
  onSetUiMode: (mode: 'guided' | 'expert') => void;
  onPlay: () => void;
  onVolumeChange: (volume: number) => void;
  onOpenModal: (modal: string) => void;
  onCloseModal: (modal: string) => void;
  onSafetyCleared: () => void;
  onUpdateSession: (s: AccessSession) => void;
}

const DesktopAppComponent: React.FC<DesktopAppProps> = ({
  audioEngine,
  activeProtocol,
  audioState,
  appMode,
  uiMode,
  isPlayingCurrent,
  modals,
  accessSession,
  onSelectProtocol,
  onSetAppMode,
  onSetUiMode,
  onPlay,
  onVolumeChange,
  onOpenModal,
  onCloseModal,
  onSafetyCleared,
  onUpdateSession,
}) => {
  // ── Shared shell state ───────────────────────────────────────────────────
  const {
    vizMode, setVizMode,
    activeGuidances, toggleGuidance, clearGuidances,
    profileOpen, setProfileOpen,
  } = useSessionShell();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const vizContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadFile = useCallback(async () => {
    const url = URL.createObjectURL(accessSession.fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = accessSession.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [accessSession]);

  const GUIDANCE_MODES: { id: SessionGuidance; label: string; Icon: React.ElementType }[] = [
    { id: 'audio_only', label: 'Audio Only', Icon: Headphones },
    { id: 'breathwork',  label: 'Breathe',   Icon: Wind      },
    { id: 'mantra',      label: 'Mantra',    Icon: Mic2      },
    { id: 'socratic',    label: 'Reflect',   Icon: Brain     },
    { id: 'geometry',    label: 'Geometry',  Icon: Hexagon   },
  ];

  // Build MantraProfile from active protocol's mantra field (or a universal default)
  const DEFAULT_MANTRA: MantraProfile = {
    id: 'universal',
    name: 'Universal',
    phonetic: 'SO HUM',
    meaning: 'I am that — the universal consciousness',
    pronunciation: 'soh · hum',
    tonality: 'Natural voice, low and resonant',
  };
  const mantraForOverlay: MantraProfile = activeProtocol?.mantra
    ? {
        id: activeProtocol.id,
        name: activeProtocol.title,
        phonetic: activeProtocol.mantra.phonetic,
        meaning:  activeProtocol.mantra.meaning,
        pronunciation: activeProtocol.mantra.phonetic,
        tonality: 'Natural voice',
      }
    : DEFAULT_MANTRA;

  // WebGL modes require hdEnabled=true
  const WEBGL_MODES = new Set(['neural', 'cosmic', 'hyper', 'symmetry', 'galactic', 'cyber', 'dmt']);

  // Visualizer mode options per UI mode
  const GUIDED_VIZ_MODES = [
    { id: 'oscilloscope', label: 'Scope' },
    { id: 'spectrum',     label: 'Spectrum' },
    { id: 'pulse',        label: 'Pulse' },
    { id: 'fractal',      label: 'Fractal' },
  ];
  const EXPERT_VIZ_MODES = [
    { id: 'oscilloscope', label: 'Scope' },
    { id: 'spectrum',     label: 'Spectrum' },
    { id: 'waveform',     label: 'Wave' },
    { id: 'neural',       label: 'Neural' },
    { id: 'cymatics',     label: 'Cymatics' },
    { id: 'cosmic',       label: 'Cosmic' },
    { id: 'dmt',          label: 'DMT' },
    { id: 'galactic',     label: 'Galactic' },
    { id: 'fractal',      label: 'Fractal' },
    { id: 'sacred_geometry', label: 'Sacred' },
  ];
  const vizModes = uiMode === 'expert' ? EXPERT_VIZ_MODES : GUIDED_VIZ_MODES;

  // Visualizer mode descriptions for tooltips
  const VIZ_MODE_DESCRIPTIONS: Record<string, string> = {
    oscilloscope: 'Scope: Classic waveform display showing audio signal over time',
    spectrum: 'Spectrum: Frequency analysis showing intensity across frequency bands',
    pulse: 'Pulse: Rhythmic visualization synced to binaural beat frequency',
    fractal: 'Fractal: Recursive geometric patterns responding to audio dynamics',
    waveform: 'Waveform: Detailed stereo signal representation',
    neural: 'Neural: 3D synaptic network visualization (WebGL)',
    cymatics: 'Cymatics: Water-like wave interference patterns',
    cosmic: 'Cosmic: Deep space volumetric effects (WebGL)',
    dmt: 'DMT: Psychedelic kaleidoscope patterns (WebGL)',
    galactic: 'Galactic: Stellar nebula effects (WebGL)',
    sacred_geometry: 'Sacred: Platonic solid animations',
  };

  // Track fullscreen state
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      vizContainerRef.current?.requestFullscreen();
    }
  }, []);

  return (
    <div className="w-full bg-neuro-900 text-gray-100 grid grid-cols-12 bg-cyber-grid relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="absolute inset-0 pointer-events-none scanlines z-[100] opacity-20" aria-hidden="true"></div>

      <UserProfile
        isOpen={profileOpen}
        accessSession={accessSession}
        onClose={() => setProfileOpen(false)}
        onUpdateSession={onUpdateSession}
        onRequestNewFile={() => setProfileOpen(false)}
      />
      <SourcesModal isOpen={modals.sources} onClose={() => onCloseModal('sources')} />
      <LegalModal isOpen={modals.legal} onClose={() => onCloseModal('legal')} />
      <DownloadPortal isOpen={modals.download} onClose={() => onCloseModal('download')} />
      <SafetyGateModal
        isOpen={modals.safetyGate}
        onClose={() => onCloseModal('safetyGate')}
        onClearance={onSafetyCleared}
        protocol={activeProtocol}
      />

      {/* Sidebar */}
      <div className="col-span-3 bg-neuro-800/80 border-r border-neuro-700 backdrop-blur-xl flex flex-col h-full z-20">
        <div className="p-6 border-b border-neuro-700/50 bg-neuro-900/50">
          <button
            onClick={() => {
              // Clear protocol selection and return to home view
              onSelectProtocol(null as any);
              // If in expert mode, user can navigate from protocol list
              // If in guided mode, will show goals grid
            }}
            className="mb-4 w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Return to home"
            title="Click to return to home"
          >
            <Logo size="lg" showIcon={false} variant="default" />
          </button>

          {/* UI Mode toggle — always visible */}
          <div className="flex gap-1 bg-black/40 p-1 border border-neuro-700/50 rounded mb-3">
            <button
              onClick={() => {
                onSetUiMode('guided');
                // Clear protocol selection when switching to Guided mode
                if (uiMode === 'expert') {
                  onSelectProtocol(null as any);
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                uiMode === 'guided'
                  ? 'bg-neuro-500 text-black'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-label="Guided mode"
            >
              Guided
            </button>
            <button
              onClick={() => {
                onSetUiMode('expert');
                // Clear protocol selection when switching to Expert mode
                if (uiMode === 'guided') {
                  onSelectProtocol(null as any);
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                uiMode === 'expert'
                  ? 'bg-neuro-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-label="Expert mode"
            >
              Expert
            </button>
          </div>

          {/* App Mode toggle — Expert mode only */}
          {uiMode === 'expert' && (
            <div className="flex gap-2 bg-black/40 p-1 border border-neuro-700/50 rounded">
              <button
                onClick={() => onSetAppMode('scientific')}
                className={`flex-1 py-1.5 text-[10px] font-bold font-mono rounded ${
                  appMode === 'scientific' ? 'bg-neuro-700/80 text-white' : 'text-gray-600'
                }`}
                aria-label="Research-backed protocols only"
              >
                Research-Backed
              </button>
              <button
                onClick={() => onSetAppMode('speculative')}
                className={`flex-1 py-1.5 text-[10px] font-bold font-mono rounded ${
                  appMode === 'speculative' ? 'bg-neuro-accent/20 text-neuro-accent' : 'text-gray-600'
                }`}
                aria-label="All protocols including exploratory"
              >
                Exploratory
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
          {uiMode === 'guided' ? (
            <GuidedHome
              protocols={ProtocolVault.getAllProtocols()}
              selectedId={activeProtocol?.id || null}
              onSelect={onSelectProtocol}
              prescription={accessSession.userData.prescription}
            />
          ) : (
            <ProtocolList
              protocols={ProtocolVault.getAllProtocols()}
              selectedId={activeProtocol?.id || null}
              onSelect={onSelectProtocol}
              mode={appMode}
            />
          )}
        </div>

        <div className="p-4 border-t border-neuro-700/50 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenModal('sources')}
              className="flex-1 py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
              aria-label="Open library"
            >
              <BookOpen className="w-3 h-3" /> Library
            </button>
            <button
              onClick={() => onOpenModal('legal')}
              className="flex-1 py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
              aria-label="Open legal"
            >
              <ShieldAlert className="w-3 h-3" /> Legal
            </button>
          </div>
          <button
            onClick={() => onOpenModal('settings')}
            className="w-full py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
            aria-label="Open settings"
          >
            <Settings className="w-3 h-3" /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-9 flex flex-col h-full bg-transparent relative z-10">
        <div className="h-16 border-b border-neuro-700/50 flex items-center justify-between px-8 bg-neuro-900/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex gap-4 items-center">
            <div
              className={`w-2 h-2 rounded-full ${
                audioState.isPlaying && !audioState.isPaused
                  ? 'bg-neuro-500 animate-pulse'
                  : 'bg-neuro-800 border border-neuro-600'
              }`}
            />
            <span className={`font-mono text-[10px] tracking-[0.2em] uppercase ${
              audioState.isPlaying && !audioState.isPaused
                ? 'text-neuro-300'
                : 'text-neuro-400'
            }`}>
              {audioState.isPlaying && !audioState.isPaused ? 'Session Active' : 'Session Ready'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Volume</span>
              <Volume2 className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioState.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-32 h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                aria-label="Master volume"
              />
              <span className="text-[10px] font-mono text-neuro-400 min-w-[2.5rem] text-right">
                {Math.round(audioState.volume * 100)}%
              </span>
            </div>
            {/* Profile / user button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-neuro-700/50 bg-neuro-800/40 hover:border-neuro-500/60 hover:bg-neuro-700/50 transition-all group"
              aria-label="Open user profile"
              title="Profile & settings"
            >
              <div className="w-5 h-5 rounded-full bg-neuro-500/20 border border-neuro-500/40 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-neuro-400" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                {accessSession.userData.displayName || 'Profile'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {activeProtocol ? (
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Visualizer and Progress */}
              <div className="col-span-7 flex flex-col gap-6 pr-4 pb-10">
                <div ref={vizContainerRef} className="bg-black border-2 border-neuro-700/50 rounded-2xl overflow-hidden relative aspect-video shadow-2xl shrink-0">
                  <Visualizer
                    audioEngine={audioEngine}
                    isPlaying={audioState.isPlaying}
                    mode={vizMode as any}
                    complexity={0.5}
                    background="#000"
                    hdEnabled={WEBGL_MODES.has(vizMode)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  {/* Back navigation button */}
                  <button
                    onClick={() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      }
                      // Optionally clear protocol selection to return to list
                      // onSelectProtocol(null); // Uncomment if you want to return to protocol list
                    }}
                    className="absolute top-3 left-3 p-2 bg-black/50 hover:bg-black/80 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all z-10 flex items-center gap-1.5 group"
                    aria-label="Back"
                    title="Exit fullscreen / Back to protocols"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-200 whitespace-nowrap">
                      Back
                    </span>
                  </button>
                  {/* Fullscreen toggle */}
                  <button
                    onClick={handleFullscreen}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all z-10"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen
                      ? <Minimize2 className="w-3.5 h-3.5" />
                      : <Maximize2 className="w-3.5 h-3.5" />
                    }
                  </button>
                  {/* Floating guidance switcher (visible in fullscreen) */}
                  <div className="absolute top-14 right-3 flex flex-col gap-1.5 z-10">
                    {GUIDANCE_MODES.filter(m => m.id !== 'audio_only').map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => toggleGuidance(id)}
                        className={`p-2 rounded-lg border transition-all group relative ${
                          activeGuidances.has(id)
                            ? 'bg-neuro-accent/30 border-neuro-accent text-neuro-accent'
                            : 'bg-black/50 hover:bg-black/80 border-white/10 text-white/50 hover:text-white'
                        }`}
                        aria-label={`Toggle ${label} guidance`}
                        aria-pressed={activeGuidances.has(id)}
                        title={label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <SessionProgress audioEngine={audioEngine} />
                  </div>
                  {/* Guidance overlay — renders relative to this container */}
                  <GuidanceOverlay
                    modes={Array.from(activeGuidances)}
                    breathRatio={activeProtocol?.breathwork?.ratio ?? [4, 4, 4, 4]}
                    mantra={mantraForOverlay}
                    elapsedTime={0}
                    onClose={id => toggleGuidance(id)}
                  />
                </div>

                {/* Visualizer mode picker */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
                  {vizModes.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setVizMode(m.id)}
                      title={VIZ_MODE_DESCRIPTIONS[m.id] || m.label}
                      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                        vizMode === m.id
                          ? 'bg-neuro-500/20 border-neuro-500 text-neuro-300'
                          : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Guidance multi-select picker */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0 items-center">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-600 whitespace-nowrap mr-1">Guide:</span>
                  {/* Audio Only = clear all */}
                  <button
                    onClick={clearGuidances}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                      activeGuidances.size === 0
                        ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                        : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
                    }`}
                    aria-label="Audio only — clear all guidance"
                  >
                    <Headphones className="w-3 h-3" />
                    Audio Only
                  </button>
                  {GUIDANCE_MODES.filter(m => m.id !== 'audio_only').map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => toggleGuidance(id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                        activeGuidances.has(id)
                          ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                          : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
                      }`}
                      aria-label={`Toggle ${label} guidance`}
                      aria-pressed={activeGuidances.has(id)}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Protocol Info */}
                <div className="bg-neuro-800/40 border border-neuro-700 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl font-bold text-white tracking-tight uppercase font-mono mb-2">
                        {activeProtocol.title}
                      </h2>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {activeProtocol.evidenceLevel && (
                          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-neuro-500/10 border border-neuro-500/30 text-neuro-400">
                            Level {activeProtocol.evidenceLevel}
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-neuro-accent/10 border border-neuro-accent/30 text-neuro-accent">
                          {(activeProtocol.section ?? 'General').toUpperCase()}
                        </span>
                        {uiMode === 'expert' && activeProtocol.optimalTimeOfDay && (
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/30 border border-neuro-700/50 text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activeProtocol.optimalTimeOfDay.replace(/-/g, ' ')}
                          </span>
                        )}
                        {uiMode === 'expert' && activeProtocol.expectedOnset != null && (
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/30 border border-neuro-700/50 text-gray-500">
                            ~{activeProtocol.expectedOnset} min onset
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onPlay}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        !isPlayingCurrent
                          ? 'bg-neuro-500 text-black shadow-lg shadow-neuro-500/30 hover:scale-105'
                          : 'bg-neuro-900 border-2 border-neuro-500 text-neuro-500 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'
                      }`}
                      aria-label={isPlayingCurrent ? 'Pause protocol' : 'Play protocol'}
                    >
                      {!isPlayingCurrent ? (
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      ) : (
                        <Pause className="w-8 h-8 fill-current" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 leading-relaxed">{activeProtocol.description}</p>

                  {/* Usage Goal */}
                  {activeProtocol.usageGoal && (
                    <div className="bg-neuro-900/60 p-4 rounded-xl border border-neuro-500/20">
                      <div className="flex items-center gap-2 text-neuro-300 text-xs font-bold uppercase tracking-widest mb-2">
                        <Target className="w-4 h-4" /> Session Goal
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{activeProtocol.usageGoal}</p>
                    </div>
                  )}

                  {/* Portable App Download */}
                  <button
                    onClick={() => onOpenModal('download')}
                    className="w-full py-3 bg-neuro-800 hover:bg-neuro-700 border border-neuro-600 text-gray-300 hover:text-white font-bold rounded-lg transition-colors text-sm"
                    aria-label="Download portable app"
                  >
                    Get Portable App
                  </button>
                </div>

                {/* WAV Export — Studio Mastering Console */}
                <WavExporter protocol={activeProtocol} audioEngine={audioEngine} />
              </div>

              {/* Right Column — content depends on uiMode */}
              <div className="col-span-5 flex flex-col gap-6 pl-4 pb-10">

                {uiMode === 'guided' ? (
                  /* ── Guided right column ──────────────────────────────── */
                  <>
                    {/* Best time */}
                    {activeProtocol.optimalTimeOfDay && (
                      <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-5 flex items-center gap-4">
                        <Clock className="w-5 h-5 text-neuro-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Best time</p>
                          <p className="text-sm text-gray-200 capitalize">
                            {activeProtocol.optimalTimeOfDay.replace(/-/g, ' ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {activeProtocol.contraindications && activeProtocol.contraindications.length > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
                          <ShieldAlert className="w-4 h-4" /> Contraindications
                        </div>
                        <ul className="text-xs text-red-300 space-y-1">
                          {activeProtocol.contraindications.map((ci, i) => (
                            <li key={i}>• {ci}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expert upsell */}
                    <div className="bg-neuro-800/20 border border-neuro-700/40 rounded-2xl p-7 flex flex-col items-center gap-4 text-center mt-auto">
                      <SlidersHorizontal className="w-8 h-8 text-neuro-700" />
                      <div>
                        <p className="font-semibold text-gray-400 text-sm mb-1">Want more control?</p>
                        <p className="text-xs text-gray-600 leading-relaxed max-w-[220px]">
                          Expert mode unlocks fine-tuning controls, phase structure analysis, and full research context.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onSetUiMode('expert');
                          // Clear protocol selection when switching to Expert mode
                          onSelectProtocol(null as any);
                        }}
                        className="px-5 py-2 text-xs font-bold font-mono uppercase tracking-widest bg-neuro-800 border border-neuro-700 rounded-lg text-neuro-400 hover:border-neuro-500 hover:text-white transition-colors"
                      >
                        Switch to Expert
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── Expert right column ──────────────────────────────── */
                  <>
                    {/* Phase Timeline */}
                    <PhaseTimeline protocol={activeProtocol} audioEngine={audioEngine} />

                    {/* Manual Tuning */}
                    <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6">
                      <ManualTuningPanel audioEngine={audioEngine} />
                    </div>

                    {/* How It Works */}
                    {activeProtocol.algoDesc && (
                      <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-neuro-400 text-xs font-bold uppercase tracking-widest">
                          <Microscope className="w-4 h-4" /> How It Works
                        </div>
                        <div className="bg-neuro-900/60 p-4 rounded-xl border border-neuro-500/20 text-xs text-gray-300 font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                          {activeProtocol.algoDesc}
                        </div>
                      </div>
                    )}

                    {/* Research Context */}
                    {activeProtocol.researchContext && (
                      <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                          <FileText className="w-4 h-4" /> Research Background
                        </div>
                        <div className="bg-neuro-900/30 p-4 rounded-xl border border-neuro-700/50 text-xs text-gray-400 italic leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                          {activeProtocol.researchContext}
                        </div>
                      </div>
                    )}

                    {/* Citation */}
                    {(activeProtocol.citation || activeProtocol.id === 'stereo_verify_test' || activeProtocol.category === 'calibration') && (
                      <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                          <FileText className="w-4 h-4" /> Source Citation
                        </div>
                        <div className="bg-neuro-900/30 p-4 rounded-xl border border-neuro-700/50 text-xs text-gray-400 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                          {activeProtocol.citation || 'Calibration/instrument verification protocol; no therapeutic citation is expected.'}
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {activeProtocol.contraindications && activeProtocol.contraindications.length > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
                          <ShieldAlert className="w-4 h-4" /> Contraindications
                        </div>
                        <ul className="text-xs text-red-300 space-y-1">
                          {activeProtocol.contraindications.map((ci, i) => (
                            <li key={i}>• {ci}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Headphones className="w-24 h-24 text-neuro-700 mb-6" />
              <p className="text-lg font-mono uppercase tracking-widest">Choose a session from the panel</p>
              <p className="text-sm text-gray-600 mt-2">Put on headphones for the best experience</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Memoized DesktopApp component to prevent unnecessary re-renders
 * Only re-renders when props actually change
 */
export const DesktopApp = React.memo(DesktopAppComponent);
