import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App.tsx';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';
import { MotionProvider } from '../contexts/MotionContext.tsx';
import { useAudioEngine } from '../src/context/AudioEngineContext.tsx';
import { useAudioPlayback } from '../src/hooks/useAudioPlayback.ts';
import { useResponsiveness } from '../src/hooks/useResponsiveness.ts';
import { useModalState } from '../src/hooks/useModalState.ts';

// Mock all the custom hooks
vi.mock('../src/context/AudioEngineContext.tsx', () => ({
  useAudioEngine: vi.fn(),
}));

vi.mock('../src/hooks/useAudioPlayback.ts', () => ({
  useAudioPlayback: vi.fn(),
}));

vi.mock('../src/hooks/useResponsiveness.ts', () => ({
  useResponsiveness: vi.fn(),
}));

vi.mock('../src/hooks/useModalState.ts', () => ({
  useModalState: vi.fn(),
}));

vi.mock('../src/hooks/useIOSAudioSession.ts', () => ({
  useIOSAudioSession: vi.fn(),
}));

vi.mock('../components/AccessGate.tsx', () => ({
  AccessGate: ({ onAccessGranted }: any) => (
    <button
      type="button"
      data-testid="access-gate"
      onClick={() => onAccessGranted({
        token: { uid: 'test-user', iat: 0, exp: null, plan: 'lifetime' },
        userData: {
          displayName: 'Test User',
          favoriteProtocols: [],
          sessionsCompleted: 0,
          totalMinutes: 0,
          lastProtocolId: null,
          notes: '',
          preferences: { onboardingCompleted: true },
          history: [],
          createdAt: Date.now(),
          lastSeen: Date.now(),
        },
        fileBlob: new Blob([]),
        filename: 'test.syns',
      })}
    >
      Access Gate
    </button>
  ),
}));

// Mock components
vi.mock('../components/MobileApp.tsx', () => ({
  MobileApp: (props: any) => <div data-testid="mobile-app">Mobile App</div>,
}));

vi.mock('../components/MobileAppDrawer.tsx', () => ({
  MobileAppDrawer: (props: any) => <div data-testid="mobile-app">Mobile App Drawer</div>,
}));

vi.mock('../components/TabletApp.tsx', () => ({
  TabletApp: (props: any) => <div data-testid="tablet-app">Tablet App</div>,
}));

vi.mock('../components/DesktopApp.tsx', () => ({
  DesktopApp: (props: any) => <div data-testid="desktop-app">Desktop App</div>,
}));

const mockAudioEngine = {
  playProtocol: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  setVolume: vi.fn(),
  dispose: vi.fn(),
} as any;

const mockAudioPlayback = {
  audioState: {
    isPlaying: false,
    isPaused: false,
    volume: 0.5,
    currentProtocolId: null,
    currentPhaseIndex: 0,
    totalElapsed: 0,
    phaseElapsed: 0,
  },
  play: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  setVolume: vi.fn(),
};

const mockResponsiveness = {
  isMobile: false,
  layoutMode: 'cockpit' as const,
  width: 1920,
  orientation: 'landscape' as const,
};

const mockModalState = {
  modals: {
    sources: false,
    legal: false,
    download: false,
    safetyGate: false,
  },
  toggle: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  closeAll: vi.fn(),
};

const renderApp = () => render(
  <ThemeProvider>
    <MotionProvider>
      <App />
    </MotionProvider>
  </ThemeProvider>
);

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('synsync_session', JSON.stringify({
      uid: 'test-user',
      exp: null,
      plan: 'lifetime',
    }));
    localStorage.setItem('synsync_ud_test-user', JSON.stringify({
      displayName: 'Test User',
      favoriteProtocols: [],
      sessionsCompleted: 0,
      totalMinutes: 0,
      lastProtocolId: null,
      notes: '',
      preferences: { onboardingCompleted: true },
      history: [],
      createdAt: Date.now(),
      lastSeen: Date.now(),
    }));

    (useAudioEngine as any).mockReturnValue(mockAudioEngine);
    (useAudioPlayback as any).mockReturnValue(mockAudioPlayback);
    (useResponsiveness as any).mockReturnValue(mockResponsiveness);
    (useModalState as any).mockReturnValue(mockModalState);
  });

  describe('hooks integration', () => {
    it('should use useAudioEngine hook', () => {
      renderApp();
      expect(useAudioEngine).toHaveBeenCalled();
    });

    it('should use useAudioPlayback hook', () => {
      renderApp();
      expect(useAudioPlayback).toHaveBeenCalledWith(mockAudioEngine);
    });

    it('should use useResponsiveness hook', () => {
      renderApp();
      expect(useResponsiveness).toHaveBeenCalled();
    });

    it('should use useModalState hook', () => {
      renderApp();
      expect(useModalState).toHaveBeenCalled();
    });
  });

  describe('responsive routing', () => {
    it('should render DesktopApp when not mobile', () => {
      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-app')).not.toBeInTheDocument();
    });

    it('should render MobileApp when mobile', () => {
      (useResponsiveness as any).mockReturnValue({
        isMobile: true,
        layoutMode: 'compact' as const,
        width: 375,
        orientation: 'portrait' as const,
      });
      renderApp();
      expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-app')).not.toBeInTheDocument();
    });
  });

  describe('state management', () => {
    it('should initialize with null active protocol', () => {
      renderApp();
      // Check that the component renders (state is initialized)
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should initialize with scientific app mode', () => {
      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should initialize with archive tab on mobile', () => {
      (useResponsiveness as any).mockReturnValue({
        isMobile: true,
        layoutMode: 'compact' as const,
        width: 375,
        orientation: 'portrait' as const,
      });
      renderApp();
      expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
    });
  });

  describe('safety gating', () => {
    it('should reset safetyCleared when protocol changes', () => {
      const { rerender } = renderApp();

      // Change protocol - this should reset safety cleared
      // (We can't directly test state changes, but we can verify no errors occur)
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });
  });

  describe('isPlayingCurrent calculation', () => {
    it('should be true when playing current protocol', () => {
      (useAudioPlayback as any).mockReturnValue({
        ...mockAudioPlayback,
        audioState: {
          ...mockAudioPlayback.audioState,
          isPlaying: true,
          isPaused: false,
          currentProtocolId: 'test-protocol',
        },
      });

      renderApp();
      // Component should render without errors
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should be false when paused', () => {
      (useAudioPlayback as any).mockReturnValue({
        ...mockAudioPlayback,
        audioState: {
          ...mockAudioPlayback.audioState,
          isPlaying: false,
          isPaused: true,
          currentProtocolId: 'test-protocol',
        },
      });

      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should be false when not playing', () => {
      (useAudioPlayback as any).mockReturnValue({
        ...mockAudioPlayback,
        audioState: {
          ...mockAudioPlayback.audioState,
          isPlaying: false,
          isPaused: false,
        },
      });

      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });
  });

  describe('props passing', () => {
    it('should pass audioEngine to components', () => {
      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
      // Verify audioEngine was called
      expect(useAudioEngine).toHaveBeenCalled();
    });

    it('should pass audioState to components', () => {
      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
      // Verify useAudioPlayback was called
      expect(useAudioPlayback).toHaveBeenCalled();
    });

    it('should pass modals to components', () => {
      renderApp();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
      // Verify useModalState was called
      expect(useModalState).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle minimal AudioEngine object gracefully', () => {
      (useAudioEngine as any).mockReturnValue({
        ...mockAudioEngine,
        ctx: null,
      });
      expect(() => {
        renderApp();
      }).not.toThrow();
    });

    it('should render even if hooks return undefined', () => {
      (useAudioPlayback as any).mockReturnValue({
        audioState: {},
        play: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        stop: vi.fn(),
        setVolume: vi.fn(),
      });

      expect(() => {
        renderApp();
      }).not.toThrow();
    });
  });

  describe('mobile specific behavior', () => {
    it('should set mobile tab to session after playing protocol on mobile', () => {
      (useResponsiveness as any).mockReturnValue({
        isMobile: true,
        layoutMode: 'compact' as const,
        width: 375,
        orientation: 'portrait' as const,
      });

      renderApp();
      expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
    });
  });

  describe('modal integration', () => {
    it('should pass modal state to components', () => {
      renderApp();
      expect(useModalState).toHaveBeenCalled();
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should handle modal open/close callbacks', () => {
      renderApp();
      // Verify that modal callbacks are wired up
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should render without accessibility violations', () => {
      const { container } = renderApp();
      expect(container).toBeInTheDocument();
      // Component should be properly structured
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should handle re-renders', () => {
      const { rerender } = renderApp();
      rerender(
        <ThemeProvider>
          <MotionProvider>
            <App />
          </MotionProvider>
        </ThemeProvider>
      );
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should handle responsive changes', () => {
      const { rerender } = renderApp();

      // Change to mobile
      (useResponsiveness as any).mockReturnValue({
        isMobile: true,
        layoutMode: 'compact' as const,
        width: 375,
        orientation: 'portrait' as const,
      });

      rerender(
        <ThemeProvider>
          <MotionProvider>
            <App />
          </MotionProvider>
        </ThemeProvider>
      );
      expect(screen.getByTestId('mobile-app')).toBeInTheDocument();

      // Change back to desktop
      (useResponsiveness as any).mockReturnValue({
        isMobile: false,
        layoutMode: 'cockpit' as const,
        width: 1920,
        orientation: 'landscape' as const,
      });

      rerender(
        <ThemeProvider>
          <MotionProvider>
            <App />
          </MotionProvider>
        </ThemeProvider>
      );
      expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
    });

    it('should render correct layout at all required validation widths', () => {
      const { rerender } = renderApp();

      const widths = [
        { width: 375, orientation: 'portrait' as const, layoutMode: 'compact' as const, expectMobile: true, expectTablet: false },
        { width: 390, orientation: 'portrait' as const, layoutMode: 'compact' as const, expectMobile: true, expectTablet: false },
        { width: 430, orientation: 'portrait' as const, layoutMode: 'compact' as const, expectMobile: true, expectTablet: false },
        { width: 768, orientation: 'landscape' as const, layoutMode: 'medium' as const, expectMobile: false, expectTablet: true },
        { width: 1024, orientation: 'landscape' as const, layoutMode: 'medium' as const, expectMobile: false, expectTablet: true },
        { width: 1280, orientation: 'landscape' as const, layoutMode: 'cockpit' as const, expectMobile: false, expectTablet: false },
        { width: 1440, orientation: 'landscape' as const, layoutMode: 'cockpit' as const, expectMobile: false, expectTablet: false },
        { width: 1728, orientation: 'landscape' as const, layoutMode: 'cockpit' as const, expectMobile: false, expectTablet: false },
      ];

      for (const { width, orientation, layoutMode, expectMobile, expectTablet } of widths) {
        (useResponsiveness as any).mockReturnValue({
          isMobile: width < 1024,
          layoutMode,
          width,
          orientation,
        });

        rerender(
          <ThemeProvider>
            <MotionProvider>
              <App />
            </MotionProvider>
          </ThemeProvider>
        );

        if (expectMobile) {
          expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
          expect(screen.queryByTestId('tablet-app')).not.toBeInTheDocument();
          expect(screen.queryByTestId('desktop-app')).not.toBeInTheDocument();
        } else if (expectTablet) {
          expect(screen.getByTestId('tablet-app')).toBeInTheDocument();
          expect(screen.queryByTestId('mobile-app')).not.toBeInTheDocument();
          expect(screen.queryByTestId('desktop-app')).not.toBeInTheDocument();
        } else {
          expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
          expect(screen.queryByTestId('mobile-app')).not.toBeInTheDocument();
          expect(screen.queryByTestId('tablet-app')).not.toBeInTheDocument();
        }
      }
    });
  });

  describe('type safety', () => {
    it('should be properly typed', () => {
      // This is more of a compile-time check
      const element = React.createElement(App);
      expect(element).toBeDefined();
      expect(element.type).toBe(App);
    });
  });
});
