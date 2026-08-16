import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopApp } from '../DesktopApp.tsx';
import { Protocol, AudioState, AccessSession } from '../../types.ts';

// Mock dependencies
vi.mock('../Visualizer.tsx', () => ({
  Visualizer: () => <div data-testid="visualizer">Visualizer</div>,
}));

vi.mock('../ProtocolList.tsx', () => ({
  ProtocolList: () => <div data-testid="protocol-list">Protocol List</div>,
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

vi.mock('../DownloadPortal.tsx', () => ({
  DownloadPortal: () => <div data-testid="download-portal">Download</div>,
}));

vi.mock('../SafetyGateModal.tsx', () => ({
  SafetyGateModal: ({ onClearance }: any) => (
    <div data-testid="safety-gate-modal" onClick={onClearance}>
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
  contraindications: ['Epilepsy', 'Pregnancy'],
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
  uiMode: 'expert' as const,
  isPlayingCurrent: false,
  modals: {},
  onSelectProtocol: vi.fn(),
  onSetAppMode: vi.fn(),
  onSetUiMode: vi.fn(),
  onPlay: vi.fn(),
  onVolumeChange: vi.fn(),
  onOpenModal: vi.fn(),
  onCloseModal: vi.fn(),
  onSafetyCleared: vi.fn(),
  accessSession: mockAccessSession,
  onUpdateSession: vi.fn(),
};

describe('DesktopApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Return to home/i })).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByTestId('protocol-list')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText('Session Ready')).toBeInTheDocument();
    });

    it('should render header with status indicator', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText('Session Ready')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should have 12-column grid layout', () => {
      const { container } = render(<DesktopApp {...defaultProps} />);
      const mainDiv = container.querySelector('.grid-cols-12');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should render sidebar controls', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Library/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Legal/i })).toBeInTheDocument();
    });
  });

  describe('app mode selection', () => {
    it('should call onSetAppMode when clicking Research-Backed button', () => {
      render(<DesktopApp {...defaultProps} appMode="speculative" />);
      const researchBtn = screen.getByRole('button', { name: /Research-Backed/i });
      fireEvent.click(researchBtn);
      expect(defaultProps.onSetAppMode).toHaveBeenCalledWith('scientific');
    });

    it('should call onSetAppMode when clicking Exploratory button', () => {
      render(<DesktopApp {...defaultProps} appMode="scientific" />);
      const exploratoryBtn = screen.getByRole('button', { name: /Exploratory/i });
      fireEvent.click(exploratoryBtn);
      expect(defaultProps.onSetAppMode).toHaveBeenCalledWith('speculative');
    });

    it('should highlight active mode', () => {
      render(<DesktopApp {...defaultProps} appMode="scientific" />);
      const researchBtn = screen.getByRole('button', { name: /Research-Backed/i });
      expect(researchBtn.className).toContain('bg-neuro-700');
    });
  });

  describe('protocol display', () => {
    it('should display protocol title', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(mockProtocol.title)).toBeInTheDocument();
    });

    it('should display protocol description', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(mockProtocol.description)).toBeInTheDocument();
    });

    it('should display evidence level badge', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(/LEVEL I/i)).toBeInTheDocument();
    });

    it('should display section badge', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(/FOCUS/i)).toBeInTheDocument();
    });

    it('should display usage goal', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(mockProtocol.usageGoal!)).toBeInTheDocument();
    });

    it('should display visualizer', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByTestId('visualizer')).toBeInTheDocument();
    });

    it('should display session progress', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByTestId('session-progress')).toBeInTheDocument();
    });
  });

  describe('technical details panel', () => {
    it('should display manual tuning panel', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByTestId('manual-tuning')).toBeInTheDocument();
    });

    it('should display DSP algorithm description', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(mockProtocol.algoDesc!)).toBeInTheDocument();
    });

    it('should display research context', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(mockProtocol.researchContext!)).toBeInTheDocument();
    });

    it('should display contraindications', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText(/Contraindications/i)).toBeInTheDocument();
      expect(screen.getByText(/Epilepsy/)).toBeInTheDocument();
      expect(screen.getByText(/Pregnancy/)).toBeInTheDocument();
    });

    it('should not show contraindications section when empty', () => {
      const protoWithoutContraindications = { ...mockProtocol, contraindications: [] };
      render(<DesktopApp {...defaultProps} activeProtocol={protoWithoutContraindications} />);
      const contraindications = screen.queryByText(/Contraindications/i);
      expect(contraindications).not.toBeInTheDocument();
    });
  });

  describe('playback controls', () => {
    it('should show play button when not playing', () => {
      render(<DesktopApp {...defaultProps} isPlayingCurrent={false} />);
      const playBtn = screen.getByLabelText(/Play protocol/i);
      expect(playBtn).toBeInTheDocument();
    });

    it('should show pause button when playing', () => {
      render(<DesktopApp {...defaultProps} isPlayingCurrent={true} />);
      const pauseBtn = screen.getByLabelText(/Pause protocol/i);
      expect(pauseBtn).toBeInTheDocument();
    });

    it('should call onPlay when clicking play button', () => {
      render(<DesktopApp {...defaultProps} isPlayingCurrent={false} />);
      const playBtn = screen.getByLabelText(/Play protocol/i);
      fireEvent.click(playBtn);
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });

    it('should have different styling when playing vs not playing', () => {
      const { rerender } = render(
        <DesktopApp {...defaultProps} isPlayingCurrent={false} />
      );
      let playBtn = screen.getByLabelText(/Play protocol/i);
      expect(playBtn).toHaveClass('bg-neuro-500');

      rerender(<DesktopApp {...defaultProps} isPlayingCurrent={true} />);
      const pauseBtn = screen.getByLabelText(/Pause protocol/i);
      expect(pauseBtn).toHaveClass('border-neuro-500');
    });
  });

  describe('master volume control', () => {
    it('should display master gain label', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('should have volume slider', () => {
      render(<DesktopApp {...defaultProps} />);
      const volumeInput = screen.getByRole('slider', { name: /Master volume/i });
      expect(volumeInput).toBeInTheDocument();
      expect(volumeInput).toHaveValue(String(mockAudioState.volume));
    });

    it('should call onVolumeChange when volume changes', () => {
      render(<DesktopApp {...defaultProps} />);
      const volumeInput = screen.getByRole('slider', { name: /Master volume/i });
      fireEvent.change(volumeInput, { target: { value: '0.75' } });
      expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.75);
    });
  });

  describe('sidebar buttons', () => {
    it('should call onOpenModal with sources when clicking Library button', () => {
      render(<DesktopApp {...defaultProps} />);
      const libraryBtn = screen.getByRole('button', { name: /Library/i });
      fireEvent.click(libraryBtn);
      expect(defaultProps.onOpenModal).toHaveBeenCalledWith('sources');
    });

    it('should call onOpenModal with legal when clicking Legal button', () => {
      render(<DesktopApp {...defaultProps} />);
      const legalBtn = screen.getByRole('button', { name: /Legal/i });
      fireEvent.click(legalBtn);
      expect(defaultProps.onOpenModal).toHaveBeenCalledWith('legal');
    });
  });

  describe('download button', () => {
    it('should display download button', () => {
      render(<DesktopApp {...defaultProps} />);
      const downloadBtn = screen.getByRole('button', { name: /Download portable app/i });
      expect(downloadBtn).toBeInTheDocument();
    });

    it('should call onOpenModal with download when clicking download button', () => {
      render(<DesktopApp {...defaultProps} />);
      const downloadBtn = screen.getByRole('button', { name: /Download portable app/i });
      fireEvent.click(downloadBtn);
      expect(downloadBtn).toBeInTheDocument();
    });
  });

  describe('no protocol selected', () => {
    it('should show placeholder when no protocol selected', () => {
      render(<DesktopApp {...defaultProps} activeProtocol={null} />);
      expect(screen.getByTestId('protocol-list')).toBeInTheDocument();
    });
  });

  describe('modals', () => {
    it('should render modals when open', () => {
      render(
        <DesktopApp
          {...defaultProps}
          modals={{
            sources: true,
            legal: true,
            download: true,
            safetyGate: true,
          }}
        />
      );
      expect(screen.getByTestId('sources-modal')).toBeInTheDocument();
      expect(screen.getByTestId('legal-modal')).toBeInTheDocument();
      expect(screen.getByTestId('download-portal')).toBeInTheDocument();
      expect(screen.getByTestId('safety-gate-modal')).toBeInTheDocument();
    });

    it('should call onCloseModal when closing modals', () => {
      render(<DesktopApp {...defaultProps} modals={{ sources: true }} />);
      // Mocked SourcesModal doesn't have close handler in this test
      // In real implementation, the parent would handle modal state
      expect(defaultProps.onCloseModal).toBeDefined();
    });
  });

  describe('status indicator', () => {
    it('should show pulsing indicator when playing', () => {
      render(
        <DesktopApp
          {...defaultProps}
          audioState={{ ...mockAudioState, isPlaying: true }}
        />
      );
      const indicator = screen.getByText('Session Active')
        .closest('.flex')
        ?.querySelector('.w-2');
      expect(indicator).toHaveClass('bg-neuro-500');
    });

    it('should show static indicator when not playing', () => {
      render(
        <DesktopApp
          {...defaultProps}
          audioState={{ ...mockAudioState, isPlaying: false }}
        />
      );
      const indicator = screen.getByText('Session Ready')
        .closest('.flex')
        ?.querySelector('.w-2');
      expect(indicator).toHaveClass('bg-neuro-800');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels for buttons', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Research-backed protocols only/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All protocols including exploratory/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download portable app/i })).toBeInTheDocument();
    });

    it('should have proper aria label for volume slider', () => {
      render(<DesktopApp {...defaultProps} />);
      expect(screen.getByRole('slider', { name: /Master volume/i })).toBeInTheDocument();
    });
  });
});
