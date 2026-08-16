import React, { useState, useEffect, useCallback } from 'react';
import { Protocol, AccessSession, UserData } from './types.ts';
import { useTheme } from './contexts/ThemeContext.tsx';
import { useMotion } from './contexts/MotionContext.tsx';
import { useAudioEngine } from './src/context/AudioEngineContext.tsx';
import { useAudioPlayback } from './src/hooks/useAudioPlayback.ts';
import { useIOSAudioSession } from './src/hooks/useIOSAudioSession.ts';
import { useResponsiveness } from './src/hooks/useResponsiveness.ts';
import { useModalState } from './src/hooks/useModalState.ts';
import { DesktopApp } from './components/DesktopApp.tsx';
import { MobileApp, MobileTab } from './components/MobileApp.tsx';
import { MobileAppDrawer } from './components/MobileAppDrawer.tsx';
import { TabletApp } from './components/TabletApp.tsx';
import { FirstRunModal } from './components/FirstRunModal.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { AccessGate } from './components/AccessGate.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { OnboardingModal, PrivacySettings } from './components/OnboardingModal.tsx';
import { DataExportPanel } from './components/DataExportPanel.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { AccessKeyService } from './services/AccessKeyService.ts';

/**
 * Main App Component
 *
 * Refactored to use custom hooks and extract UI into separate components.
 * Responsibilities:
 * - Manage core application state (protocol selection, app mode, etc.)
 * - Coordinate between hooks and UI components
 * - Handle safety gating logic
 * - Route between mobile and desktop layouts
 */
const App: React.FC = () => {
  // ── Access gate ───────────────────────────────────────────────────────────
  // Show admin panel when ?admin is in the URL
  const isAdminRoute = new URLSearchParams(window.location.search).has('admin');
  const isDemoRoute =
    window.location.pathname === '/demo' ||
    window.location.pathname === '/free-demo' ||
    new URLSearchParams(window.location.search).has('demo');

  // Try to restore session from localStorage on first render
  const cachedMeta = AccessKeyService.getCachedSessionMeta();
  const [accessSession, setAccessSession] = useState<AccessSession | null>(
    // If we have a cached (non-expired) session meta and user data, build a
    // lightweight placeholder so the app renders immediately.  Full data is
    // already in localStorage — we synthesise a minimal session object here.
    () => {
      if (!cachedMeta) return null;
      const ud = AccessKeyService.getLocalUserData(cachedMeta.uid);
      if (!ud) return null;
      return {
        token:    { uid: cachedMeta.uid, iat: 0, exp: cachedMeta.exp, plan: cachedMeta.plan },
        userData: ud,
        fileBlob: new Blob([]),   // placeholder — real blob restored on next upload
        filename: 'session',
      } satisfies AccessSession;
    },
  );

  // Get audio engine from context
  const audioEngine = useAudioEngine();
  const { theme, toggleTheme } = useTheme();
  const { reduceMotion, setReduceMotion } = useMotion();

  // Use custom hooks for reusable state
  const { audioState, play, pause, resume, stop, setVolume } = useAudioPlayback(audioEngine);
  const { isMobile, layoutMode } = useResponsiveness();
  const { modals, open, close } = useModalState();

  // Remaining state that doesn't fit into hooks
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [appMode, setAppMode] = useState<'scientific' | 'speculative'>('scientific');
  const [mobileTab, setMobileTab] = useState<MobileTab>('archive');
  const [safetyCleared, setSafetyCleared] = useState(false);
  const [uiMode, setUiMode] = useState<'guided' | 'expert'>(
    () => {
      const savedMode = localStorage.getItem('synsync_ui_mode') as 'guided' | 'expert' | null;
      if (isDemoRoute && !savedMode) return 'expert';
      return savedMode || 'guided';
    }
  );
  const [showAccessGate, setShowAccessGate] = useState(() => !accessSession && !isDemoRoute);

  useEffect(() => {
    if (!isDemoRoute || accessSession) return;
    let cancelled = false;
    AccessKeyService.createDemoSession()
      .then((session) => {
        if (cancelled) return;
        setAccessSession(session);
        setShowAccessGate(false);
      })
      .catch((error) => {
        console.error('Could not create demo session:', error);
        if (!cancelled) setShowAccessGate(true);
      });
    return () => {
      cancelled = true;
    };
  }, [accessSession, isDemoRoute]);

  // First-run welcome screen
  const [showWelcome, setShowWelcome] = useState<boolean>(
    () => !isDemoRoute && !localStorage.getItem('synsync_seen_welcome')
  );
  const handleDismissWelcome = () => {
    localStorage.setItem('synsync_seen_welcome', '1');
    setShowWelcome(false);
  };

  // Onboarding modal for new users (profile + privacy setup)
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    // Show onboarding if user hasn't completed it and has an active session
    if (!accessSession) return false;
    const prefs = accessSession.userData.preferences || {};
    return !prefs.onboardingCompleted;
  });

  const handleOnboardingComplete = (profile: Partial<UserData>, privacy: PrivacySettings) => {
    if (!accessSession) return;
    
    // Update user data with profile and privacy settings
    const updatedUserData: UserData = {
      ...accessSession.userData,
      ...profile,
      preferences: {
        ...accessSession.userData.preferences,
        ...profile.preferences,
        privacy,
      },
    };

    // Save to localStorage
    AccessKeyService.setLocalUserData(accessSession.token.uid, updatedUserData);

    // Update session state
    setAccessSession({
      ...accessSession,
      userData: updatedUserData,
    });

    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    // Mark as completed with defaults
    handleOnboardingComplete(
      { 
        displayName: 'Explorer',
        preferences: { onboardingCompleted: true, onboardingCompletedAt: Date.now() }
      },
      {
        trackSessionDuration: true,
        trackProtocolUsage: true,
        trackTimeOfDay: true,
        trackDeviceInfo: false,
        allowResearchExport: false,
        researchExportAnonymized: true,
      }
    );
  };

  // Settings state
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(
    () => localStorage.getItem('synsync_scanlines') !== 'false'
  );
  const [defaultVolume, setDefaultVolume] = useState<number>(
    () => parseFloat(localStorage.getItem('synsync_default_volume') || '0.5')
  );
  const [headphoneWarning, setHeadphoneWarning] = useState<boolean>(
    () => localStorage.getItem('synsync_headphone_warning') !== 'false'
  );

  // Persist uiMode preference
  useEffect(() => {
    localStorage.setItem('synsync_ui_mode', uiMode);
  }, [uiMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('synsync_scanlines', String(scanlinesEnabled));
  }, [scanlinesEnabled]);

  useEffect(() => {
    localStorage.setItem('synsync_default_volume', String(defaultVolume));
  }, [defaultVolume]);

  useEffect(() => {
    localStorage.setItem('synsync_headphone_warning', String(headphoneWarning));
  }, [headphoneWarning]);

  // Check if onboarding should show when session changes
  useEffect(() => {
    if (accessSession) {
      const prefs = accessSession.userData.preferences || {};
      if (!prefs.onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [accessSession?.token.uid]);

  // iOS: keep audio alive on lock screen, prevent screen sleep, unlock AudioContext early
  useIOSAudioSession({
    audioContext: audioEngine.ctx,
    isPlaying: audioState.isPlaying && !audioState.isPaused,
    title: activeProtocol?.title,
    artist: 'SynSync Pro',
  });

  // Reset safety cleared when protocol changes
  useEffect(() => {
    setSafetyCleared(false);
  }, [activeProtocol?.id]);

  // Handle play button logic — declared BEFORE the useEffect that references it
  // to avoid a const TDZ crash in the production bundle.
  const handlePlay = useCallback(() => {
    try {
      if (!activeProtocol) return;

      const isNewSelection = audioState.currentProtocolId !== activeProtocol.id;

      // Safety check for new protocols
      if (!safetyCleared && (isNewSelection || !audioState.isPlaying)) {
        open('safetyGate');
        return;
      }

      // Toggle play/pause for same protocol
      if (!isNewSelection && audioState.isPlaying && !audioState.isPaused) {
        pause();
      } else if (!isNewSelection && audioState.isPaused) {
        resume();
      } else {
        // Play new protocol
        stop();
        play(activeProtocol);
        if (isMobile) setMobileTab('session');
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [activeProtocol, audioState, safetyCleared, open, pause, resume, stop, play, isMobile, setMobileTab]);

  // Global spacebar shortcut — play / pause active protocol
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Skip when user is typing in a form field
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePlay]);

  // Check if we're currently playing the selected protocol
  const isPlayingCurrent =
    audioState.isPlaying &&
    !audioState.isPaused &&
    audioState.currentProtocolId === activeProtocol?.id;

  // Handle safety gate clearance
  const handleSafetyCleared = () => {
    setSafetyCleared(true);
    close('safetyGate');
    if (activeProtocol) {
      stop();
      play(activeProtocol);
      if (isMobile) setMobileTab('session');
    }
  };

  // Media Session action handlers for lock-screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handleMediaPause = () => {
      if (audioState.isPlaying && !audioState.isPaused) pause();
    };
    const handleMediaPlay = () => {
      if (audioState.isPaused) resume();
    };
    const handleMediaStop = () => {
      stop();
    };

    navigator.mediaSession.setActionHandler('pause', handleMediaPause);
    navigator.mediaSession.setActionHandler('play', handleMediaPlay);
    navigator.mediaSession.setActionHandler('stop', handleMediaStop);

    return () => {
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [audioState.isPlaying, audioState.isPaused, pause, resume, stop]);

  // Handle modal updates - convert string keys to proper modal keys
  const handleOpenModal = (modal: string) => {
    open(modal as any);
  };

  const handleCloseModal = (modal: string) => {
    close(modal as any);
  };

  // Prepare common props for both mobile and desktop
  const commonProps = {
    audioEngine,
    activeProtocol,
    audioState,
    appMode,
    uiMode,
    isPlayingCurrent,
    modals: modals as Record<string, boolean>,
    theme,
    toggleTheme,
    scanlinesEnabled,
    reduceMotion,
    defaultVolume,
    headphoneWarning,
    onSelectProtocol: setActiveProtocol,
    onSetAppMode: setAppMode,
    onSetUiMode: setUiMode,
    onPlay: handlePlay,
    onVolumeChange: setVolume,
    onOpenModal: handleOpenModal,
    onCloseModal: handleCloseModal,
    onSafetyCleared: handleSafetyCleared,
    onScanlinesToggle: setScanlinesEnabled,
    onReduceMotionToggle: setReduceMotion,
    onDefaultVolumeChange: setDefaultVolume,
    onHeadphoneWarningToggle: setHeadphoneWarning,
  };

  // ── Routing ───────────────────────────────────────────────────────────────

  // Admin panel (owner only — accessed via ?admin in URL)
  if (isAdminRoute) return <AdminPanel />;

  // Access gate — shown until a valid .syns file is uploaded.
  if (showAccessGate || !accessSession) {
    return (
      <AccessGate 
        onAccess={(session) => {
          setAccessSession(session);
          setShowAccessGate(false);
        }} 
      />
    );
  }

  // Route between compact (mobile), medium (tablet), and cockpit (desktop)
  if (layoutMode === 'compact') {
    return (
      <>
        {showWelcome && <FirstRunModal onDismiss={handleDismissWelcome} />}
        {showOnboarding && (
          <OnboardingModal 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
        <DataExportPanel
          isOpen={modals.dataExport || false}
          onClose={() => close('dataExport')}
          accessSession={accessSession}
        />
        <UserProfile
          isOpen={modals.userProfile || false}
          onClose={() => close('userProfile')}
          accessSession={accessSession}
          onUpdateSession={setAccessSession}
          onRequestNewFile={() => {
            setAccessSession(null);
            setShowAccessGate(true);
          }}
        />
        <MobileAppDrawer
          {...commonProps}
          safetyCleared={safetyCleared}
          accessSession={accessSession}
          onUpdateSession={setAccessSession}
        />
      </>
    );
  }

  if (layoutMode === 'medium') {
    return (
      <>
        {showWelcome && <FirstRunModal onDismiss={handleDismissWelcome} />}
        {showOnboarding && (
          <OnboardingModal 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
        <DataExportPanel
          isOpen={modals.dataExport || false}
          onClose={() => close('dataExport')}
          accessSession={accessSession}
        />
        <UserProfile
          isOpen={modals.userProfile || false}
          onClose={() => close('userProfile')}
          accessSession={accessSession}
          onUpdateSession={setAccessSession}
          onRequestNewFile={() => {
            setAccessSession(null);
            setShowAccessGate(true);
          }}
        />
        <SettingsPanel
          isOpen={modals.settings || false}
          onClose={() => close('settings')}
          uiMode={uiMode}
          scanlinesEnabled={scanlinesEnabled}
          reduceMotion={reduceMotion}
          defaultVolume={defaultVolume}
          theme={theme}
          headphoneWarning={headphoneWarning}
          onUiModeChange={setUiMode}
          onScanlinesToggle={setScanlinesEnabled}
          onReduceMotionToggle={setReduceMotion}
          onDefaultVolumeChange={setDefaultVolume}
          onThemeChange={toggleTheme}
          onHeadphoneWarningToggle={setHeadphoneWarning}
          onOpenDataExport={() => open('dataExport')}
          onOpenUserProfile={() => open('userProfile')}
        />
        <TabletApp
          {...commonProps}
          accessSession={accessSession}
          onUpdateSession={setAccessSession}
        />
      </>
    );
  }

  return (
    <>
      {showWelcome && <FirstRunModal onDismiss={handleDismissWelcome} />}
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <DataExportPanel
        isOpen={modals.dataExport || false}
        onClose={() => close('dataExport')}
        accessSession={accessSession}
      />
      <UserProfile
        isOpen={modals.userProfile || false}
        onClose={() => close('userProfile')}
        accessSession={accessSession}
        onUpdateSession={setAccessSession}
        onRequestNewFile={() => {
          setAccessSession(null);
          setShowAccessGate(true);
        }}
      />
      <SettingsPanel
        isOpen={modals.settings || false}
        onClose={() => close('settings')}
        uiMode={uiMode}
        scanlinesEnabled={scanlinesEnabled}
        reduceMotion={reduceMotion}
        defaultVolume={defaultVolume}
        theme={theme}
        headphoneWarning={headphoneWarning}
        onUiModeChange={setUiMode}
        onScanlinesToggle={setScanlinesEnabled}
        onReduceMotionToggle={setReduceMotion}
        onDefaultVolumeChange={setDefaultVolume}
        onThemeChange={toggleTheme}
        onHeadphoneWarningToggle={setHeadphoneWarning}
        onOpenDataExport={() => open('dataExport')}
        onOpenUserProfile={() => open('userProfile')}
      />
      <DesktopApp
        {...commonProps}
        accessSession={accessSession}
        onUpdateSession={setAccessSession}
      />
    </>
  );
};

export default App;
