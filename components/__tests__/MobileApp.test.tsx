import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileApp } from '../MobileApp.tsx';
import { Protocol, AudioState, AccessSession } from '../../types.ts';

// Mock dependencies
vi.mock('../Visualizer.tsx', () => ({
  Visualizer: () => <div data-testid="visualizer">Visualizer</div>,
}));

vi.mock('../ProtocolList.tsx', () => ({
  ProtocolList: ({ onSelect }: any) => (
    <div data-testid="protocol-list" onClick={() => onSelect({ id: 'test' })}>
      Protocol List
    </div>
  ),
}));

vi.mock('../ProtocolGallery.tsx', () => ({
  ProtocolGallery: ({ onSelect, onNavigateToSession }: any) => (
    <div
      data-testid="protocol-gallery"
      onClick={() => {
        onSelect({ id: 'test-protocol', title: 'Test Protocol' });
        onNavigateToSession();
      }}
    >
      Atmospheric Gallery
    </div>
  ),
}));

vi.mock('../SessionProgress.tsx', () => ({
  SessionProgress: () => <div data-testid="session-progress">Progress</div>,
}));

vi.mock('../SourcesModal.tsx', () => ({
  SourcesModal: () => <div data-testid="sources-modal">Sources</div>,
}));

vi.mock('../LegalModal.tsx', () => ({
  LegalModal: () => <div data-testid="legal-modal">Legal</div>,
}));

vi.mock('../SafetyGateModal.tsx', () => ({
  SafetyGateModal: ({ onClose }: any) => (
    <div data-testid="safety-gate-modal" onClick={onClose}>
      Safety Gate
    </div>
  ),
}));

vi.mock('../ManualTuningPanel.tsx', () => ({
  ManualTuningPanel: () => <div data-testid="manual-tuning">Tuning</div>,
}));

vi.mock('../../services/ProtocolVault.ts', () => ({
  ProtocolVault: {
    getAllProtocols: () => [],
  },
}));

const mockProtocol: Protocol = {
  id: 'test-protocol',
  title: 'Test Protocol',
  description: 'Test Description',
  duration: 60,
  category: 'test',
  section: 'focus',
  evidenceLevel: 'I',
  usageGoal: 'Test goal',
  algoDesc: 'Algorithm description',
  researchContext: 'Research context',
  phases: [],
};

const mockAudioState: AudioState = {
  isPlaying: false,
  isPaused: false,
  volume: 0.5,
  currentProtocolId: null,
  currentPhaseIndex: 0,
};

const mockAccessSession: AccessSession = {
  token: {
    uid: 'test-user',
    iat: 1,
    exp: null,
    plan: 'lifetime',
  },
  userData: {
    displayName: 'Test User',
    favoriteProtocols: [],
    sessionsCompleted: 0,
    totalMinutes: 0,
    lastProtocolId: null,
    notes: '',
    preferences: {},
    history: [],
    createdAt: 1,
    lastSeen: 1,
  },
  fileBlob: new Blob(['{}'], { type: 'application/octet-stream' }),
  filename: 'test.syns',
};

const mockAudioEngine = {
  playProtocol: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  setVolume: vi.fn(),
} as any;

const defaultProps = {
  audioEngine: mockAudioEngine,
  activeProtocol: mockProtocol,
  audioState: mockAudioState,
  appMode: 'scientific' as const,
  uiMode: 'guided' as const,
  mobileTab: 'archive' as const,
  safetyCleared: true,
  isPlayingCurrent: false,
  modals: {},
  onSelectProtocol: vi.fn(),
  onSetAppMode: vi.fn(),
  onSetUiMode: vi.fn(),
  onSetMobileTab: vi.fn(),
  onPlay: vi.fn(),
  onVolumeChange: vi.fn(),
  onOpenModal: vi.fn(),
  onCloseModal: vi.fn(),
  onSafetyCleared: vi.fn(),
  accessSession: mockAccessSession,
  onUpdateSession: vi.fn(),
};

describe('MobileApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<MobileApp {...defaultProps} />);
      expect(screen.getByText(/SYNSYNC PRO/i)).toBeInTheDocument();
    });

    it('should render header with title', () => {
      render(<MobileApp {...defaultProps} />);
      expect(screen.getByText(/SYNSYNC/)).toBeInTheDocument();
    });

    it('should render volume control in header', () => {
      render(<MobileApp {...defaultProps} />);
      const volumeInput = screen.getByRole('slider', { name: /volume/i });
      expect(volumeInput).toBeInTheDocument();
      expect(volumeInput).toHaveValue(String(mockAudioState.volume));
    });

    it('should render bottom navigation with four tabs', () => {
      render(<MobileApp {...defaultProps} />);
      expect(screen.getByLabelText('Gallery')).toBeInTheDocument();
      expect(screen.getByLabelText('Session')).toBeInTheDocument();
      expect(screen.getByLabelText('Insights')).toBeInTheDocument();
      expect(screen.getByLabelText('Visualize')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should render archive tab content when selected', () => {
      render(<MobileApp {...defaultProps} mobileTab="archive" />);
      expect(screen.getByTestId('protocol-gallery')).toBeInTheDocument();
    });

    it('should show UI mode toggle buttons (Guided/Expert) in header', () => {
      render(<MobileApp {...defaultProps} mobileTab="archive" />);
      expect(screen.getByRole('button', { name: /Guided mode/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Expert mode/i })).toBeInTheDocument();
    });

    it('should render session tab content when selected', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" />);
      expect(screen.getByTestId('visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('session-progress')).toBeInTheDocument();
    });

    it('should render tech tab content when selected', () => {
      render(<MobileApp {...defaultProps} mobileTab="tech" />);
      expect(screen.getByTestId('manual-tuning')).toBeInTheDocument();
    });

    it('should call onSetMobileTab when clicking navigation buttons', () => {
      const { rerender } = render(<MobileApp {...defaultProps} mobileTab="archive" />);

      const sessionBtn = screen.getByLabelText('Session');
      fireEvent.click(sessionBtn);

      expect(defaultProps.onSetMobileTab).toHaveBeenCalledWith('session');
    });
  });

  describe('ui mode selection', () => {
    it('should call onSetUiMode when clicking Guided button', () => {
      render(<MobileApp {...defaultProps} uiMode="expert" />);
      const guidedBtn = screen.getByRole('button', { name: /Guided mode/i });
      fireEvent.click(guidedBtn);
      expect(defaultProps.onSetUiMode).toHaveBeenCalledWith('guided');
    });

    it('should call onSetUiMode when clicking Expert button', () => {
      render(<MobileApp {...defaultProps} uiMode="guided" />);
      const expertBtn = screen.getByRole('button', { name: /Expert mode/i });
      fireEvent.click(expertBtn);
      expect(defaultProps.onSetUiMode).toHaveBeenCalledWith('expert');
    });

    it('should highlight active ui mode button', () => {
      render(<MobileApp {...defaultProps} uiMode="guided" />);
      const guidedBtn = screen.getByRole('button', { name: /Guided mode/i });
      expect(guidedBtn).toHaveClass('bg-neuro-500');
    });

    // Note: App mode (scientific/speculative) filtering is not exposed as toggle buttons in mobile UI
    // It's passed as a prop and used internally by ProtocolGallery
  });

  describe('protocol playback', () => {
    it('should show play button when not playing', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" isPlayingCurrent={false} />);
      const playBtn = screen.getByLabelText('Play');
      expect(playBtn).toBeInTheDocument();
    });

    it('should show pause button when playing', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" isPlayingCurrent={true} />);
      const pauseBtn = screen.getByLabelText('Pause');
      expect(pauseBtn).toBeInTheDocument();
    });

    it('should call onPlay when clicking play button', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" isPlayingCurrent={false} />);
      const playBtn = screen.getByLabelText('Play');
      fireEvent.click(playBtn);
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });

    it('should display protocol title in session tab', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" />);
      expect(screen.getByText(mockProtocol.title)).toBeInTheDocument();
    });

    it('should display session goal in session tab', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" />);
      expect(screen.getByText(mockProtocol.usageGoal!)).toBeInTheDocument();
    });
  });

  describe('volume control', () => {
    it('should call onVolumeChange when volume slider changes', () => {
      render(<MobileApp {...defaultProps} />);
      const volumeInput = screen.getByRole('slider', { name: /volume/i });
      fireEvent.change(volumeInput, { target: { value: '0.75' } });
      expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.75);
    });
  });

  describe('modals', () => {
    it('should render safety gate modal when open', () => {
      render(<MobileApp {...defaultProps} modals={{ safetyGate: true }} />);
      expect(screen.getByTestId('safety-gate-modal')).toBeInTheDocument();
    });

    it('should render sources modal when open', () => {
      render(<MobileApp {...defaultProps} modals={{ sources: true }} />);
      expect(screen.getByTestId('sources-modal')).toBeInTheDocument();
    });

    it('should render legal modal when open', () => {
      render(<MobileApp {...defaultProps} modals={{ legal: true }} />);
      expect(screen.getByTestId('legal-modal')).toBeInTheDocument();
    });

    it('should call onCloseModal when safety gate modal closes', () => {
      render(<MobileApp {...defaultProps} modals={{ safetyGate: true }} />);
      const modal = screen.getByTestId('safety-gate-modal');
      fireEvent.click(modal);
      expect(defaultProps.onCloseModal).toHaveBeenCalledWith('safetyGate');
    });
  });

  describe('no protocol selected', () => {
    it('should show placeholder in session tab when no protocol selected', () => {
      render(<MobileApp {...defaultProps} activeProtocol={null} mobileTab="session" />);
      expect(screen.getByText(/Tap Gallery to browse sessions/i)).toBeInTheDocument();
    });

    it('should show placeholder in tech tab when no protocol selected', () => {
      render(<MobileApp {...defaultProps} activeProtocol={null} mobileTab="tech" />);
      expect(screen.getByText(/Lifetime access/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels for interactive elements', () => {
      render(<MobileApp {...defaultProps} mobileTab="session" />);
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
      expect(screen.getByLabelText(/Volume control/i)).toBeInTheDocument();
    });

    it('should have proper aria labels for tabs', () => {
      render(<MobileApp {...defaultProps} />);
      expect(screen.getByLabelText('Gallery')).toBeInTheDocument();
      expect(screen.getByLabelText('Session')).toBeInTheDocument();
      expect(screen.getByLabelText('Insights')).toBeInTheDocument();
    });
  });
});
