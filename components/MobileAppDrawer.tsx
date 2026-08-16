import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Wind,
  Brain,
  Headphones,
  Mic2,
  Hexagon,
  Target,
  ArrowLeft,
  User,
  LayoutGrid,
  BarChart2,
  Waves,
  Maximize2,
  Menu,
  ChevronUp,
  Settings,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Protocol, AudioState, SessionGuidance, MantraProfile, AccessSession } from '../types.ts';
import { Visualizer } from './Visualizer.tsx';
import { ProtocolGallery } from './ProtocolGallery.tsx';
import { VisualizerView } from './VisualizerView.tsx';
import { SessionProgress } from './SessionProgress.tsx';
import { SourcesModal } from './SourcesModal.tsx';
import { LegalModal } from './LegalModal.tsx';
import { SafetyGateModal } from './SafetyGateModal.tsx';
import { ManualTuningPanel } from './ManualTuningPanel.tsx';
import { BioInsights } from './BioInsights.tsx';
import { GuidanceOverlay } from './GuidanceOverlay.tsx';
import { WavExporter } from './WavExporter.tsx';
import { Logo } from './Logo.tsx';
import { UserProfile } from './UserProfile.tsx';
import { AudioEngine } from '../services/AudioEngine.ts';
import { ProtocolVault } from '../services/ProtocolVault.ts';
import { AccessKeyService } from '../services/AccessKeyService.ts';
import { useSessionShell } from './shell/useSessionShell.ts';
import { Drawer } from './Drawer.tsx';
import { BottomSheet } from './BottomSheet.tsx';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface MobileAppDrawerProps {
  audioEngine: AudioEngine;
  activeProtocol: Protocol | null;
  audioState: AudioState;
  appMode: 'scientific' | 'speculative';
  uiMode: 'guided' | 'expert';
  safetyCleared: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// GUIDANCE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_GUIDANCE: { id: SessionGuidance; label: string; Icon: React.ElementType }[] = [
  { id: 'breathwork', label: 'Breathe', Icon: Wind },
  { id: 'mantra', label: 'Mantra', Icon: Mic2 },
  { id: 'socratic', label: 'Reflect', Icon: Brain },
  { id: 'geometry', label: 'Geo', Icon: Hexagon },
];

const DEFAULT_MANTRA: MantraProfile = {
  id: 'universal',
  name: 'Universal',
  phonetic: 'SO HUM',
  meaning: 'I am that — the universal consciousness',
  pronunciation: 'soh · hum',
  tonality: 'Natural voice, low and resonant',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const MobileAppDrawerComponent: React.FC<MobileAppDrawerProps> = ({
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
    activeGuidances,
    toggleGuidance,
    clearGuidances,
    profileOpen,
    setProfileOpen,
  } = useSessionShell();

  // ── Drawer/Sheet state ──────────────────────────────────────────────────
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [tuningOpen, setTuningOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [protocolSheetOpen, setProtocolSheetOpen] = useState(false);

  // ── Cymatics substrate toggle ──────────────────────────────────────────
  const [cymaticsSubstrate, setCymaticsSubstrate] = useState(false);

  // ── Browser-back interception ──────────────────────────────────────────
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (protocolSheetOpen) setProtocolSheetOpen(false);
        else if (galleryOpen) setGalleryOpen(false);
        else if (tuningOpen) setTuningOpen(false);
        else if (insightsOpen) setInsightsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [protocolSheetOpen, galleryOpen, tuningOpen, insightsOpen]);

  // ── Data-file download ─────────────────────────────────────────────────
  const handleDownloadFile = useCallback(async () => {
    const url = URL.createObjectURL(accessSession.fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = accessSession.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [accessSession]);

  const mantraForOverlay: MantraProfile = activeProtocol?.mantra
    ? {
        id: activeProtocol.id,
        name: activeProtocol.title,
        phonetic: activeProtocol.mantra.phonetic,
        meaning: activeProtocol.mantra.meaning,
        pronunciation: activeProtocol.mantra.phonetic,
        tonality: 'Natural voice',
      }
    : DEFAULT_MANTRA;

  const handleGallerySelect = (p: Protocol) => {
    onSelectProtocol(p);
    setGalleryOpen(false);
    setProtocolSheetOpen(true);
  };

  const isImmersive = false; // No immersive viz tab in drawer mode
  const guidanceModes: SessionGuidance[] = Array.from(activeGuidances);

  return (
    <div
      className="w-full bg-neuro-900 text-gray-100 flex flex-col bg-cyber-grid relative"
      style={{ height: '100dvh' }}
    >
      <div className="absolute inset-0 pointer-events-none scanlines z-[100] opacity-10" aria-hidden />

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <UserProfile
        isOpen={profileOpen}
        accessSession={accessSession}
        onClose={() => setProfileOpen(false)}
        onUpdateSession={onUpdateSession}
        onRequestNewFile={() => setProfileOpen(false)}
      />
      <SourcesModal isOpen={modals.sources} onClose={() => onCloseModal('sources')} />
      <LegalModal isOpen={modals.legal} onClose={() => onCloseModal('legal')} />
      <SafetyGateModal
        isOpen={modals.safetyGate}
        onClose={() => onCloseModal('safetyGate')}
        onClearance={onSafetyCleared}
        protocol={activeProtocol}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between h-16 px-4 border-b border-neuro-700">
        <div className="flex items-center gap-3">
          <Logo size="sm" showIcon={false} variant="simple" />
          <button
            onClick={() => onSetUiMode(uiMode === 'guided' ? 'expert' : 'guided')}
            className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-neuro-600 text-gray-400"
          >
            {uiMode === 'guided' ? 'Guided' : 'Expert'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={audioEngine?.masterGain?.gain?.value ?? 0.7}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neuro-700 rounded-full appearance-none cursor-pointer accent-neuro-accent"
            />
          </div>

          {/* Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-neuro-700/50 border border-neuro-600 flex items-center justify-center"
          >
            <User className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        {/* Protocol info card */}
        {activeProtocol ? (
          <div className="p-4 space-y-4">
            {/* Visualizer preview */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <Visualizer
                audioEngine={audioEngine}
                isPlaying={isPlayingCurrent}
                mode={cymaticsSubstrate ? 'cymatics' : 'oscilloscope'}
                complexity={0.5}
                background="#000"
                hdEnabled={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Cymatics toggle */}
              <button
                onClick={() => setCymaticsSubstrate(!cymaticsSubstrate)}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
              >
                <Waves className="w-4 h-4" />
              </button>

              {/* Session progress */}
              <div className="absolute bottom-0 left-0 right-0">
                <SessionProgress audioEngine={audioEngine} />
              </div>

              {/* Guidance overlay */}
              <GuidanceOverlay
                modes={guidanceModes}
                breathRatio={[4, 4, 4, 4]}
                mantra={mantraForOverlay}
                elapsedTime={0}
                onClose={clearGuidances}
              />
            </div>

            {/* Guidance multi-select */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={clearGuidances}
                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                  activeGuidances.size === 0
                    ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                    : 'bg-neuro-800/50 border-neuro-600 text-gray-400 hover:bg-neuro-700/50'
                }`}
              >
                Audio Only
              </button>
              {MOBILE_GUIDANCE.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => toggleGuidance(mode.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                    activeGuidances.has(mode.id)
                      ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                      : 'bg-neuro-800/50 border-neuro-600 text-gray-400 hover:bg-neuro-700/50'
                  }`}
                >
                  <mode.Icon className="w-3 h-3" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Protocol card */}
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
                </div>

                {/* Play/Pause button */}
                <button
                  onClick={onPlay}
                  className="ml-3 w-14 h-14 rounded-full bg-neuro-accent flex items-center justify-center hover:bg-neuro-accent/80 transition-colors shrink-0"
                >
                  {isPlayingCurrent ? (
                    <Pause className="w-5 h-5 text-neuro-900" />
                  ) : (
                    <Play className="w-5 h-5 text-neuro-900 ml-0.5" />
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

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setProtocolSheetOpen(true)}
                  className="flex-1 py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded-lg text-xs font-medium text-gray-300 border border-neuro-600 flex items-center justify-center gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={() => setTuningOpen(true)}
                  className="flex-1 py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded-lg text-xs font-medium text-gray-300 border border-neuro-600 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Tuning
                </button>
                <button
                  onClick={() => setInsightsOpen(true)}
                  className="flex-1 py-2 bg-neuro-700/30 hover:bg-neuro-700/50 rounded-lg text-xs font-medium text-gray-300 border border-neuro-600 flex items-center justify-center gap-2"
                >
                  <BarChart2 className="w-4 h-4" />
                  Insights
                </button>
              </div>

              {/* WavExporter */}
              <div className="mt-3">
                <WavExporter protocol={activeProtocol} audioEngine={audioEngine} />
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center px-4">
              <Headphones className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">No Session Active</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Browse the gallery to select a brainwave entrainment protocol
              </p>
              <button
                onClick={() => setGalleryOpen(true)}
                className="px-6 py-3 bg-neuro-accent text-neuro-900 font-semibold rounded-xl hover:bg-neuro-accent/80 transition-colors"
              >
                Open Gallery
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-around h-16 border-t border-neuro-700 bg-neuro-800/90 backdrop-blur-sm safe-area-pb">
        <button
          onClick={() => setGalleryOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-neuro-accent transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">Gallery</span>
        </button>

        <button
          onClick={() => setInsightsOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-neuro-accent transition-colors"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">Insights</span>
        </button>

        {/* Centre play button */}
        <button
          onClick={onPlay}
          className="w-14 h-14 -mt-4 rounded-full bg-neuro-accent flex items-center justify-center shadow-lg shadow-neuro-accent/30"
        >
          {isPlayingCurrent ? (
            <Pause className="w-6 h-6 text-neuro-900" />
          ) : (
            <Play className="w-6 h-6 text-neuro-900 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setTuningOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-neuro-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">Tuning</span>
        </button>

        <button
          onClick={() => {
            if (activeProtocol) setProtocolSheetOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-neuro-accent transition-colors"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">Session</span>
        </button>
      </nav>

      {/* ── Gallery Drawer ──────────────────────────────────────────────── */}
      <Drawer
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        position="right"
        size="85%"
        title="Protocol Gallery"
      >
        <div className="p-4">
          <ProtocolGallery
            protocols={ProtocolVault.getAllProtocols()}
            selectedId={activeProtocol?.id ?? null}
            mode={appMode}
            onSelect={handleGallerySelect}
            onNavigateToSession={() => setGalleryOpen(false)}
          />
        </div>
      </Drawer>

      {/* ── Protocol Details Bottom Sheet ────────────────────────────────── */}
      <BottomSheet
        isOpen={protocolSheetOpen}
        onClose={() => setProtocolSheetOpen(false)}
        title={activeProtocol?.title}
        maxHeight="70vh"
      >
        {activeProtocol && (
          <div className="space-y-4 pb-4">
            {/* Evidence level */}
            <div className="flex items-center gap-2">
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

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.description}</p>
            </div>

            {/* Usage goal */}
            {activeProtocol.usageGoal && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Session Goal</h4>
                <p className="text-sm text-gray-400">{activeProtocol.usageGoal}</p>
              </div>
            )}

            {/* How It Works (expert) */}
            {uiMode === 'expert' && activeProtocol.algoDesc && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">How It Works</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.algoDesc}</p>
              </div>
            )}

            {/* Research Context (expert) */}
            {uiMode === 'expert' && activeProtocol.researchContext && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Research Background</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.researchContext}</p>
              </div>
            )}

            {/* Source Citation (expert) */}
            {uiMode === 'expert' && activeProtocol.citation && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Source Citation</h4>
                <p className="text-xs text-gray-500 italic">{activeProtocol.citation}</p>
              </div>
            )}

            {/* Best Time (guided) */}
            {uiMode === 'guided' && activeProtocol.optimalTimeOfDay && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Best Time</h4>
                <p className="text-sm text-gray-400">{activeProtocol.optimalTimeOfDay}</p>
              </div>
            )}

            {/* Contraindications */}
            {activeProtocol.contraindications && activeProtocol.contraindications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-yellow-500">⚠</span>
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

            {/* Session expiry */}
            <div className="pt-4 border-t border-neuro-700">
              <p className="text-xs text-gray-500">
                Session expires: {AccessKeyService.formatExpiry(accessSession.token.exp, accessSession.token.plan)}
              </p>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ── Tuning Drawer ──────────────────────────────────────────────── */}
      <Drawer
        isOpen={tuningOpen}
        onClose={() => setTuningOpen(false)}
        position="right"
        size="80%"
        title="Manual Tuning"
      >
        <div className="p-4">
          <ManualTuningPanel audioEngine={audioEngine} />
        </div>
      </Drawer>

      {/* ── Insights Drawer ────────────────────────────────────────────── */}
      <Drawer
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        position="right"
        size="85%"
        title="Bio Insights"
      >
        <div className="p-4 space-y-4">
          <BioInsights audioEngine={audioEngine} activeProtocol={activeProtocol} isPlaying={isPlayingCurrent} />
          
          {/* Research Background */}
          {uiMode === 'expert' && activeProtocol?.researchContext && (
            <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Research Background</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.researchContext}</p>
            </div>
          )}

          {/* Source Citation */}
          {uiMode === 'expert' && activeProtocol?.citation && (
            <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Source Citation</h4>
              <p className="text-xs text-gray-500 italic">{activeProtocol.citation}</p>
            </div>
          )}

          {/* DSP Algorithm */}
          {uiMode === 'expert' && activeProtocol?.algoDesc && (
            <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">DSP Algorithm</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{activeProtocol.algoDesc}</p>
            </div>
          )}

          {/* Session expiry */}
          <div className="bg-neuro-800/50 rounded-xl border border-neuro-700 p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Session Info</h4>
            <p className="text-xs text-gray-500">
              Expires: {AccessKeyService.formatExpiry(accessSession.token.exp, accessSession.token.plan)}
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export const MobileAppDrawer = React.memo(MobileAppDrawerComponent);
