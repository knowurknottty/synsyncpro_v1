import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Wind, Brain, Headphones, Mic2, Hexagon, Target, ArrowLeft, User, LayoutGrid, BarChart2, Waves, Maximize2, CpuIcon } from 'lucide-react';
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

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MobileTab = 'archive' | 'session' | 'tech' | 'viz';

interface MobileAppProps {
  audioEngine: AudioEngine;
  activeProtocol: Protocol | null;
  audioState: AudioState;
  appMode: 'scientific' | 'speculative';
  uiMode: 'guided' | 'expert';
  mobileTab: MobileTab;
  safetyCleared: boolean;
  isPlayingCurrent: boolean;
  modals: Record<string, boolean>;
  accessSession: AccessSession;
  onSelectProtocol: (protocol: Protocol) => void;
  onSetAppMode: (mode: 'scientific' | 'speculative') => void;
  onSetUiMode: (mode: 'guided' | 'expert') => void;
  onSetMobileTab: (tab: MobileTab) => void;
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
  { id: 'breathwork', label: 'Breathe', Icon: Wind   },
  { id: 'mantra',     label: 'Mantra',  Icon: Mic2   },
  { id: 'socratic',   label: 'Reflect', Icon: Brain  },
  { id: 'geometry',   label: 'Geo',     Icon: Hexagon },
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
// NAV CONFIG
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem { tab: MobileTab; Icon: React.ElementType; label: string }

const NAV_ITEMS_LEFT:  NavItem[] = [
  { tab: 'archive', Icon: LayoutGrid, label: 'Gallery'  },
  { tab: 'tech',    Icon: BarChart2,  label: 'Insights' },
];
const NAV_ITEMS_RIGHT: NavItem[] = [
  { tab: 'session', Icon: Headphones, label: 'Session'  },
  { tab: 'viz',     Icon: Waves,      label: 'Visualize'},
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const MobileAppComponent: React.FC<MobileAppProps> = ({
  audioEngine,
  activeProtocol,
  audioState,
  appMode,
  uiMode,
  mobileTab,
  isPlayingCurrent,
  modals,
  accessSession,
  onSelectProtocol,
  onSetAppMode,
  onSetUiMode,
  onSetMobileTab,
  onPlay,
  onVolumeChange,
  onOpenModal,
  onCloseModal,
  onSafetyCleared,
  onUpdateSession,
}) => {
  // ── Shared shell state ───────────────────────────────────────────────────
  const {
    activeGuidances, toggleGuidance, clearGuidances,
    profileOpen, setProfileOpen,
  } = useSessionShell();

  // ── Cymatics substrate toggle ─────────────────────────────────────────────
  const [cymaticsSubstrate, setCymaticsSubstrate] = useState(false);

  // ── Browser-back interception ─────────────────────────────────────────────
  // Push a dummy history entry on every tab navigation so the device back
  // button steps through in-app tabs instead of closing the browser tab.
  useEffect(() => {
    window.history.pushState({ synsyncTab: mobileTab }, '');
  }, [mobileTab]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Navigate back within the app
      const order: MobileTab[] = ['archive', 'session', 'tech', 'viz'];
      const idx = order.indexOf(mobileTab);
      if (idx > 0) {
        onSetMobileTab(order[idx - 1]);
      } else {
        // Already at root — push state again to prevent closing the tab
        window.history.pushState({ synsyncTab: mobileTab }, '');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [mobileTab, onSetMobileTab]);

  // ── Data-file download (save updated session file) ────────────────────────
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

  const handleCentreButton = () => {
    if (!activeProtocol) { onSetMobileTab('archive'); return; }
    onPlay();
    onSetMobileTab('viz');
  };

  const handleGallerySelect = (p: Protocol) => {
    onSelectProtocol(p);
    onSetMobileTab('session');
  };

  const isImmersive = mobileTab === 'viz';
  const showBack    = mobileTab !== 'archive' && !isImmersive;
  const guidanceModes: SessionGuidance[] = Array.from(activeGuidances);

  return (
    <div
      className="w-full bg-neuro-900 text-gray-100 flex flex-col bg-cyber-grid relative"
      style={{ height: '100dvh' }}   /* dvh = dynamic viewport height, avoids iOS address-bar problems */
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
      <SourcesModal isOpen={modals.sources}    onClose={() => onCloseModal('sources')} />
      <LegalModal   isOpen={modals.legal}      onClose={() => onCloseModal('legal')}   />
      <SafetyGateModal
        isOpen={modals.safetyGate}
        onClose={() => onCloseModal('safetyGate')}
        onClearance={onSafetyCleared}
        protocol={activeProtocol}
      />

      {/* ── Header (hidden in immersive viz mode) ───────────────────────── */}
      {!isImmersive && (
        <header className="h-16 border-b border-neuro-700/50 flex items-center gap-3 px-4 bg-neuro-900/90 backdrop-blur-xl z-50 shrink-0">
          {/* In-app back button — shown on non-root tabs */}
          {showBack ? (
            <button
              onClick={() => onSetMobileTab('archive')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neuro-800/60 transition-colors shrink-0"
              aria-label="Back to gallery"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="shrink-0">
              <Logo size="sm" showIcon={false} variant="simple" />
            </div>
          )}

          {/* UI Mode toggle */}
          <div className="flex gap-0.5 bg-black/50 p-0.5 border border-neuro-700/40 rounded-lg">
            <button
              onClick={() => onSetUiMode('guided')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
                uiMode === 'guided' ? 'bg-neuro-500 text-black' : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-label="Guided mode"
            >
              Guided
            </button>
            <button
              onClick={() => onSetUiMode('expert')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
                uiMode === 'expert' ? 'bg-neuro-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-label="Expert mode"
            >
              Expert
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Profile button — always accessible */}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-8 h-8 rounded-full bg-neuro-500/20 border border-neuro-500/40 flex items-center justify-center text-neuro-400 hover:bg-neuro-500/30 transition-colors shrink-0"
              aria-label="Open user profile"
            >
              <User className="w-3.5 h-3.5" />
            </button>
            <Volume2 className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="range" min="0" max="1" step="0.05"
              value={audioState.volume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
              aria-label="Volume control"
            />
          </div>
        </header>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      {/* pb-28 = space for the floating nav pill + safe area */}
      <main
        className="flex-1 min-h-0 overflow-hidden relative"
        style={{ paddingBottom: isImmersive ? 0 : undefined }}
      >

        {/* ARCHIVE */}
        {mobileTab === 'archive' && (
          <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-300">
            <ProtocolGallery
              protocols={ProtocolVault.getAllProtocols()}
              selectedId={activeProtocol?.id ?? null}
              mode={appMode}
              onSelect={handleGallerySelect}
              onNavigateToSession={() => onSetMobileTab('session')}
            />
          </div>
        )}

        {/* SESSION */}
        {mobileTab === 'session' && (
          <div className="absolute inset-0 overflow-y-auto flex flex-col p-4 gap-4 animate-in slide-in-from-right-4 duration-300 custom-scrollbar pb-28 safe-area-pb" style={{ WebkitOverflowScrolling: 'touch' }}>
            {activeProtocol ? (
              <>
                {/* Mini visualizer / cymatics preview */}
                <div className="relative bg-black border border-neuro-700 rounded-2xl overflow-hidden aspect-video shadow-2xl shrink-0">
                  <Visualizer
                    audioEngine={audioEngine}
                    isPlaying={audioState.isPlaying}
                    mode={cymaticsSubstrate ? 'cymatics' : 'oscilloscope'}
                    complexity={0.5}
                    background="#000"
                    hdEnabled={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  {/* Cymatics substrate toggle */}
                  <button
                    onClick={() => setCymaticsSubstrate(v => !v)}
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border transition-all ${
                      cymaticsSubstrate
                        ? 'bg-neuro-500/20 border-neuro-500 text-neuro-300'
                        : 'bg-black/50 border-white/10 text-white/40 hover:border-white/20'
                    }`}
                    aria-label="Toggle cymatics substrate"
                  >
                    Cymatics
                  </button>

                  {/* Tap to expand */}
                  <button
                    onClick={() => onSetMobileTab('viz')}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1"
                    aria-label="Open fullscreen visualizer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-[10px] text-white/60 font-medium">Expand</span>
                  </button>
                </div>

                {/* Guidance multi-select row */}
                <div className="flex gap-1 overflow-x-auto pb-0.5 custom-scrollbar shrink-0">
                  {/* Audio Only = clear all */}
                  <button
                    onClick={clearGuidances}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                      activeGuidances.size === 0
                        ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                        : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600'
                    }`}
                    aria-label="Audio only — clear all guidance"
                  >
                    <Headphones className="w-2.5 h-2.5" />
                    Audio
                  </button>

                  {MOBILE_GUIDANCE.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => toggleGuidance(id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
                        activeGuidances.has(id)
                          ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
                          : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
                      }`}
                      aria-label={`Toggle ${label} guidance`}
                      aria-pressed={activeGuidances.has(id)}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Protocol info + play */}
                <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 pr-4">
                      <h2 className="text-xl font-bold text-white uppercase font-mono tracking-tight leading-tight">
                        {activeProtocol.title}
                      </h2>
                      <p className="text-[10px] text-neuro-500 font-bold uppercase mt-1 tracking-widest">
                        Level {activeProtocol.evidenceLevel}
                      </p>
                    </div>
                    <button
                      onClick={onPlay}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        !isPlayingCurrent
                          ? 'bg-neuro-500 text-black shadow-lg shadow-neuro-500/20'
                          : 'bg-neuro-900 border-2 border-neuro-500 text-neuro-500'
                      }`}
                      aria-label={isPlayingCurrent ? 'Pause' : 'Play'}
                    >
                      {!isPlayingCurrent
                        ? <Play  className="w-6 h-6 ml-0.5 fill-current" />
                        : <Pause className="w-6 h-6 fill-current" />
                      }
                    </button>
                  </div>

                  <div className="bg-neuro-900/60 p-3 rounded-xl border border-neuro-500/20">
                    <div className="flex items-center gap-2 text-neuro-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                      <Target className="w-3 h-3" /> Session Goal
                    </div>
                    <p className="text-xs text-white leading-relaxed">{activeProtocol.usageGoal}</p>
                  </div>

                  <SessionProgress audioEngine={audioEngine} />
                </div>

                <button
                  onClick={() => onSetMobileTab('viz')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-neuro-500/30 bg-neuro-500/5 text-neuro-500 text-sm font-semibold transition-all hover:bg-neuro-500/10"
                  aria-label="Open fullscreen visualizer"
                >
                  <Waves className="w-4 h-4" />
                  Open Visualizer
                </button>

                <WavExporter protocol={activeProtocol} audioEngine={audioEngine} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-8">
                <Headphones className="w-16 h-16 text-neuro-700 mb-4" />
                <p className="text-xs font-mono uppercase tracking-widest">Tap Gallery to browse sessions</p>
                <p className="text-xs text-gray-600 mt-2">Put on headphones for the best experience</p>
              </div>
            )}
          </div>
        )}

        {/* TECH */}
        {mobileTab === 'tech' && (
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-right-4 duration-300 custom-scrollbar pb-28 safe-area-pb" style={{ WebkitOverflowScrolling: 'touch' }}>
            <BioInsights
              audioEngine={audioEngine}
              activeProtocol={activeProtocol}
              isPlaying={audioState.isPlaying && !audioState.isPaused}
            />
            {activeProtocol && (
              <>
                <ManualTuningPanel audioEngine={audioEngine} />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-neuro-400 text-[10px] font-bold uppercase tracking-widest px-1">
                    <CpuIcon className="w-3 h-3" /> DSP Algorithm
                  </div>
                  <div className="bg-neuro-800/50 border border-neuro-700 p-4 rounded-xl text-xs text-gray-300 font-mono leading-relaxed">
                    {activeProtocol.algoDesc}
                  </div>
                </div>
                <div className="space-y-3 pb-8">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-1">
                    <Wind className="w-3 h-3" /> Research Background
                  </div>
                  <div className="bg-neuro-800/30 border border-neuro-700/50 p-4 rounded-xl text-xs text-gray-400 italic leading-relaxed">
                    {activeProtocol.researchContext || 'No research-context field is present in the protocol source.'}
                  </div>
                </div>
                {(activeProtocol.citation || activeProtocol.id === 'stereo_verify_test' || activeProtocol.category === 'calibration') && (
                  <div className="space-y-3 pb-8">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-1">
                      <Wind className="w-3 h-3" /> Source Citation
                    </div>
                    <div className="bg-neuro-800/30 border border-neuro-700/50 p-4 rounded-xl text-xs text-gray-400 leading-relaxed">
                      {activeProtocol.citation || 'Calibration/instrument verification protocol; no therapeutic citation is expected.'}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Session info footer */}
            <div className="border-t border-neuro-700/30 pt-4 pb-2">
              <p className="text-[10px] text-gray-700 font-mono text-center">
                {AccessKeyService.formatExpiry(accessSession.token.exp, accessSession.token.plan)}
              </p>
            </div>
          </div>
        )}

        {/* VIZ */}
        {mobileTab === 'viz' && (
          <div className="absolute inset-0 animate-in fade-in duration-200">
            <VisualizerView
              audioEngine={audioEngine}
              activeProtocol={activeProtocol}
              audioState={audioState}
              uiMode={uiMode}
              isPlayingCurrent={isPlayingCurrent}
              onPlay={onPlay}
              onBack={() => onSetMobileTab('session')}
            />
          </div>
        )}

        {/* Guidance overlay — session tab only */}
        {mobileTab === 'session' && activeProtocol && guidanceModes.length > 0 && (
          <GuidanceOverlay
            modes={guidanceModes}
            breathRatio={activeProtocol.breathwork?.ratio ?? [4, 4, 4, 4]}
            mantra={mantraForOverlay}
            elapsedTime={0}
            onClose={id => toggleGuidance(id)}
          />
        )}
      </main>

      {/* ── Floating Pill Navigation ─────────────────────────────────────── */}
      {!isImmersive && (
        <nav
          className="fixed left-4 right-4 z-50"
          style={{
            bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          }}
          aria-label="Main navigation"
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none"
            style={{ background: 'rgba(37,244,226,0.3)' }}
          />

          <div
            className="relative flex items-center justify-between rounded-full px-3 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(37,244,226,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(37,244,226,0.08)',
            }}
          >
            {NAV_ITEMS_LEFT.map(({ tab, Icon, label }) => (
              <button
                key={tab}
                onClick={() => onSetMobileTab(tab)}
                className="flex flex-col items-center justify-center px-4 py-1 transition-all"
                style={{ color: mobileTab === tab ? '#25f4e2' : 'rgba(255,255,255,0.35)' }}
                aria-label={label}
                aria-current={mobileTab === tab ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={mobileTab === tab ? 2 : 1.5} />
              </button>
            ))}

            {/* Centre button */}
            <div className="relative flex items-center justify-center w-14">
              <button
                onClick={handleCentreButton}
                className="absolute flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 56, height: 56, bottom: -4,
                  background: '#25f4e2', color: '#000',
                  boxShadow: '0 0 20px rgba(37,244,226,0.55), 0 4px 16px rgba(0,0,0,0.5)',
                }}
                aria-label={!activeProtocol ? 'Browse gallery' : isPlayingCurrent ? 'Open visualizer' : 'Play and visualize'}
              >
                {isPlayingCurrent
                  ? <Waves className="w-7 h-7" strokeWidth={2} />
                  : <Play className="w-7 h-7 fill-current" strokeWidth={0} />
                }
              </button>
            </div>

            {NAV_ITEMS_RIGHT.map(({ tab, Icon, label }) => (
              <button
                key={tab}
                onClick={() => onSetMobileTab(tab)}
                className="flex flex-col items-center justify-center px-4 py-1 transition-all"
                style={{ color: mobileTab === tab ? '#25f4e2' : 'rgba(255,255,255,0.35)' }}
                aria-label={label}
                aria-current={mobileTab === tab ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={mobileTab === tab ? 2 : 1.5} />
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Ambient glows */}
      <div className="fixed pointer-events-none -z-10" style={{ top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'rgba(37,244,226,0.06)', borderRadius: '50%', filter: 'blur(120px)' }} />
      <div className="fixed pointer-events-none -z-10" style={{ bottom: '-5%', right: '-5%', width: '40%', height: '40%', background: 'rgba(37,244,226,0.03)', borderRadius: '50%', filter: 'blur(100px)' }} />
    </div>
  );
};

export const MobileApp = React.memo(MobileAppComponent);
