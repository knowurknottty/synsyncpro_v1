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
  Mic2,
  Hexagon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  Settings,
  Download,
  Maximize2,
  Minimize2,
  Wind,
} from 'lucide-react';
import { Protocol, AudioState, SessionGuidance, MantraProfile, AccessSession } from '../types.ts';
import { Visualizer } from './Visualizer.tsx';
import { SessionProgress } from './SessionProgress.tsx';
import { GuidanceOverlay } from './GuidanceOverlay.tsx';
import { ManualTuningPanel } from './ManualTuningPanel.tsx';
import { WavExporter } from './WavExporter.tsx';
import { Logo } from './Logo.tsx';
import { UserProfile } from './UserProfile.tsx';
import { SafetyGateModal } from './SafetyGateModal.tsx';
import { SourcesModal } from './SourcesModal.tsx';
import { LegalModal } from './LegalModal.tsx';
import { AudioEngine } from '../services/AudioEngine.ts';
import { ProtocolVault } from '../services/ProtocolVault.ts';

// ──── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_MANTRA = 'I am calm, focused, and present.';

const GUIDANCE_MODES = [
  { id: 'guided' as SessionGuidance, icon: Headphones, label: 'Guided', color: 'text-purple-400' },
  { id: 'socratic' as SessionGuidance, icon: Brain, label: 'Socratic', color: 'text-blue-400' },
  { id: 'wind' as SessionGuidance, icon: Wind, label: 'Wind', color: 'text-cyan-400' },
  { id: 'microphone' as SessionGuidance, icon: Mic2, label: 'Voice', color: 'text-green-400' },
  { id: 'geometric' as SessionGuidance, icon: Hexagon, label: 'Geo', color: 'text-yellow-400' },
];

const VIZ_MODES = [
  { id: 'oscilloscope', label: 'Scope' },
  { id: 'waveform', label: 'Wave' },
  { id: 'spectrum', label: 'Spectrum' },
  { id: 'cymatics', label: 'Cymatics' },
  { id: 'neural', label: 'Neural' },
  { id: 'particles', label: 'Particles' },
  { id: 'helix', label: 'Helix' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'fractal', label: 'Fractal' },
  { id: 'lissajous', label: 'Lissajous' },
];

// ──── Types ─────────────────────────────────────────────────────────────────────
interface TabletAppProps {
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

// ──── Component ─────────────────────────────────────────────────────────────────
const TabletAppComponent: React.FC<TabletAppProps> = ({
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
  // ── State ──────────────────────────────────────────────────────────────────
  const [vizMode, setVizMode] = useState('oscilloscope');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeGuidances, setActiveGuidances] = useState<Set<SessionGuidance>>(new Set());
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const vizContainerRef = useRef<HTMLDivElement>(null);

  // ── Guidance toggle ────────────────────────────────────────────────────────
  const toggleGuidance = useCallback((id: SessionGuidance) => {
    setActiveGuidances((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (id === 'socratic') next.clear();
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Mantra computation ─────────────────────────────────────────────
  const mantraForOverlay: MantraProfile | undefined = activeProtocol?.mantra
    ? {
        id: activeProtocol.id,
        name: activeProtocol.title,
        phonetic: activeProtocol.mantra.phonetic,
        meaning: activeProtocol.mantra.meaning,
        pronunciation: activeProtocol.mantra.phonetic,
        tonality: 'Natural voice',
      }
    : undefined;

  // ── Fullscreen handler ─────────────────────────────────────────────────────
  const handleFullscreen = useCallback(() => {
    if (!vizContainerRef.current) return;
    if (isFullscreen) {
      document.exitFullscreen?.();
    } else {
      vizContainerRef.current.requestFullscreen?.();
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Get protocols list ─────────────────────────────────────────────────────
  const protocols = ProtocolVault.getAllProtocols();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-neuro-900 text-gray-100 flex h-[100dvh] overflow-hidden">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-15">
        <div className="w-full h-full bg-repeating-linear-gradient from-transparent via-white/5 to-transparent" />
      </div>

      {/* Modals */}
      <UserProfile
        isOpen={profileOpen}
        accessSession={accessSession}
        onClose={() => setProfileOpen(false)}
        onUpdateSession={onUpdateSession}
        onRequestNewFile={() => onOpenModal('sources')}
      />
      <SourcesModal isOpen={modals.sources} onClose={() => onCloseModal('sources')} />
      <LegalModal isOpen={modals.legal} onClose={() => onCloseModal('legal')} />
      <SafetyGateModal
        isOpen={modals.safetyGate}
        onClose={() => onCloseModal('safetyGate')}
        onClearance={onSafetyCleared}
        protocol={activeProtocol}
      />

      {/* Sidebar drawer */}
      <aside
        className={`
          h-full bg-neuro-800 border-r border-neuro-700 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
        `}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-neuro-700 flex items-center justify-between">
            <Logo size="md" showIcon={false} variant="default" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-neuro-700 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* UI Mode toggle */}
          <div className="p-3 border-b border-neuro-700">
            <div className="flex gap-2">
              <button
                onClick={() => onSetUiMode('guided')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  uiMode === 'guided'
                    ? 'bg-neuro-accent/20 text-neuro-accent border border-neuro-accent'
                    : 'bg-neuro-700/50 text-gray-400 border border-neuro-600 hover:bg-neuro-700'
                }`}
              >
                Guided
              </button>
              <button
                onClick={() => onSetUiMode('expert')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  uiMode === 'expert'
                    ? 'bg-neuro-accent/20 text-neuro-accent border border-neuro-accent'
                    : 'bg-neuro-700/50 text-gray-400 border border-neuro-600 hover:bg-neuro-700'
                }`}
              >
                Expert
              </button>
            </div>
          </div>

          {/* App Mode toggle (expert only) */}
          {uiMode === 'expert' && (
            <div className="p-3 border-b border-neuro-700">
              <div className="flex gap-2">
                <button
                  onClick={() => onSetAppMode('scientific')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    appMode === 'scientific'
                      ? 'bg-green-500/20 text-green-400 border border-green-500'
                      : 'bg-neuro-700/50 text-gray-400 border border-neuro-600 hover:bg-neuro-700'
                  }`}
                >
                  Research
                </button>
                <button
                  onClick={() => onSetAppMode('speculative')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    appMode === 'speculative'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                      : 'bg-neuro-700/50 text-gray-400 border border-neuro-600 hover:bg-neuro-700'
                  }`}
                >
                  Exploratory
                </button>
              </div>
            </div>
          )}

          {/* Protocol list */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {protocols
                .filter((p) => appMode === 'speculative' || (['IV', 'V'].includes(p.evidenceLevel ?? '')))
                .map((protocol) => (
                  <button
                    key={protocol.id}
                    onClick={() => onSelectProtocol(protocol)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeProtocol?.id === protocol.id
                        ? 'bg-neuro-accent/20 border border-neuro-accent'
                        : 'bg-neuro-700/30 border border-neuro-600 hover:bg-neuro-700/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-200 truncate">{protocol.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{protocol.duration} min</div>
                  </button>
                ))}
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-neuro-700 space-y-2">
            <button
              onClick={() => onOpenModal('sources')}
              className="w-full py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-xs font-medium text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Library
            </button>
            <button
              onClick={() => onOpenModal('legal')}
              className="w-full py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-xs font-medium text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Legal
            </button>
            <button
              onClick={() => onOpenModal('settings')}
              className="w-full py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded text-xs font-medium text-gray-400 border border-neuro-700 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <header className="h-14 border-b border-neuro-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-neuro-700 text-gray-400"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlayingCurrent ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}
              />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                {isPlayingCurrent ? 'Session Active' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue={audioEngine?.masterGain?.gain?.value ?? 0.7}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-neuro-700 rounded-full appearance-none cursor-pointer accent-neuro-accent"
              />
            </div>

            {/* Profile */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neuro-700/50 hover:bg-neuro-700 border border-neuro-600 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Profile</span>
            </button>
          </div>
        </header>

        {/* Content grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left column - Visualizer + Controls */}
          <div className="w-1/2 flex flex-col border-r border-neuro-700 overflow-hidden">
            {/* Visualizer container */}
            <div
              ref={vizContainerRef}
              className="relative bg-black aspect-video m-4 rounded-lg overflow-hidden"
            >
              <Visualizer
                audioEngine={audioEngine}
                isPlaying={isPlayingCurrent}
                mode={vizMode as any}
                complexity={0.5}
                background="#000"
                hdEnabled={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Back button (fullscreen) */}
              {isFullscreen && (
                <button
                  onClick={handleFullscreen}
                  className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen toggle */}
              <button
                onClick={handleFullscreen}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              {/* Floating guidance switcher */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {GUIDANCE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => toggleGuidance(mode.id)}
                    className={`p-2 rounded-full transition-colors ${
                      activeGuidances.has(mode.id)
                        ? `${mode.color} bg-white/10`
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title={mode.label}
                  >
                    <mode.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Session progress */}
              <div className="absolute bottom-0 left-0 right-0">
                <SessionProgress audioEngine={audioEngine} />
              </div>

              {/* Guidance overlay */}
              <GuidanceOverlay
                modes={Array.from(activeGuidances)}
                breathRatio={[4, 4, 4, 4]}
                mantra={mantraForOverlay}
                elapsedTime={0}
                onClose={() => setActiveGuidances(new Set())}
              />
            </div>

            {/* Viz mode picker */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {VIZ_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setVizMode(mode.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      vizMode === mode.id
                        ? 'bg-neuro-accent/20 text-neuro-accent border border-neuro-accent'
                        : 'bg-neuro-700/50 text-gray-400 border border-neuro-600 hover:bg-neuro-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol info card */}
            {activeProtocol && (
              <div className="px-4 pb-4">
                <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{activeProtocol.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-mono ${
                            ['IV', 'V'].includes(activeProtocol.evidenceLevel ?? '')
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          EVIDENCE {activeProtocol.evidenceLevel ?? 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">{activeProtocol.duration} min</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{activeProtocol.description}</p>
                    </div>

                    {/* Play/Pause button */}
                    <button
                      onClick={onPlay}
                      className="ml-4 w-16 h-16 rounded-full bg-neuro-accent flex items-center justify-center hover:bg-neuro-accent/80 transition-colors shrink-0"
                    >
                      {isPlayingCurrent ? (
                        <Pause className="w-6 h-6 text-neuro-900" />
                      ) : (
                        <Play className="w-6 h-6 text-neuro-900 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Usage goal */}
                  {activeProtocol.usageGoal && (
                    <div className="mt-3 pt-3 border-t border-neuro-700">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Target className="w-4 h-4" />
                        <span>{activeProtocol.usageGoal}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* WavExporter */}
                <div className="mt-3">
                  <WavExporter protocol={activeProtocol} audioEngine={audioEngine} />
                </div>
              </div>
            )}
          </div>

          {/* Right column - Details */}
          <div className="w-1/2 flex flex-col overflow-y-auto p-4">
            {activeProtocol ? (
              <div className="space-y-4">
                {/* Phase Timeline (expert) */}
                {uiMode === 'expert' && activeProtocol.phases && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Phase Timeline</h4>
                    <div className="space-y-2">
                      {activeProtocol.phases.map((phase, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neuro-700 flex items-center justify-center text-xs font-bold text-gray-300">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-200">Phase {i + 1}</div>
                            <div className="text-xs text-gray-500">{phase.duration}s</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Tuning (expert) */}
                {uiMode === 'expert' && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Manual Tuning</h4>
                    <ManualTuningPanel audioEngine={audioEngine} />
                  </div>
                )}

                {/* How It Works (expert) */}
                {uiMode === 'expert' && activeProtocol.algoDesc && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">How It Works</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.algoDesc}</p>
                  </div>
                )}

                {/* Research Context (expert) */}
                {uiMode === 'expert' && activeProtocol.researchContext && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Research Background</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.researchContext}</p>
                  </div>
                )}

                {/* Source Citation (expert) */}
                {uiMode === 'expert' && activeProtocol.citation && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Source Citation</h4>
                    <p className="text-xs text-gray-500 italic">{activeProtocol.citation}</p>
                  </div>
                )}

                {/* Best Time (guided) */}
                {uiMode === 'guided' && activeProtocol.optimalTimeOfDay && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Best Time</h4>
                    <p className="text-sm text-gray-400">{activeProtocol.optimalTimeOfDay}</p>
                  </div>
                )}

                {/* Contraindications */}
                {activeProtocol.contraindications && activeProtocol.contraindications.length > 0 && (
                  <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-yellow-500" />
                      Contraindications
                    </h4>
                    <ul className="space-y-2">
                      {activeProtocol.contraindications.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expert upsell (guided) */}
                {uiMode === 'guided' && (
                  <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 p-4">
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8 text-purple-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-purple-300">Unlock Expert Mode</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Access phase timelines, manual tuning, and research details
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onSetUiMode('expert')}
                      className="mt-3 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      Switch to Expert
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Headphones className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300">No Session Selected</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Choose a protocol from the sidebar to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export const TabletApp = React.memo(TabletAppComponent);
