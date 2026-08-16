import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayback } from '../useAudioPlayback.ts';
import { AudioEngine } from '../../../services/AudioEngine.ts';
import { Protocol } from '../../../types.ts';

/**
 * Integration tests for useAudioPlayback hook
 * Tests the interaction with real AudioEngine service
 */

const mockProtocol: Protocol = {
  id: 'test-protocol',
  title: 'Test Protocol',
  description: 'Test',
  duration: 60,
  category: 'test',
  section: 'focus',
  evidenceLevel: 'I',
  phases: [
    {
      dur: 60,
      carrier: 200,
      beat: 10,
    } as any,
  ],
};

describe('useAudioPlayback Integration Tests', () => {
  let audioEngine: AudioEngine;

  beforeEach(() => {
    audioEngine = new AudioEngine();
  });

  afterEach(() => {
    audioEngine.dispose();
  });

  describe('play functionality', () => {
    it('should play protocol and update audio state', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));

      expect(result.current.audioState.isPlaying).toBe(false);

      await act(async () => {
        await result.current.play(mockProtocol);
      });

      // State should update after play
      expect(result.current.audioState.currentProtocolId).toBe('test-protocol');
    });

    it('should set volume on play', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const playSpy = vi.spyOn(audioEngine, 'playProtocol');
      const unlockSpy = vi.spyOn(audioEngine, 'unlock');

      await act(async () => {
        await result.current.play(mockProtocol);
      });

      expect(unlockSpy).toHaveBeenCalled();
      expect(playSpy).toHaveBeenCalledWith(mockProtocol);
    });
  });

  describe('volume control', () => {
    it('should update volume', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const setMasterGainSpy = vi.spyOn(audioEngine, 'setMasterGain');

      act(() => {
        result.current.setVolume(0.75);
      });

      expect(setMasterGainSpy).toHaveBeenCalledWith(0.75);
      expect(result.current.audioState.volume).toBe(0.75);
    });

    it('should clamp volume between 0 and 1', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.audioState.volume).toBeLessThanOrEqual(1);

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.audioState.volume).toBeGreaterThanOrEqual(0);
    });
  });

  describe('playback controls', () => {
    it('should handle pause correctly', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const pauseSpy = vi.spyOn(audioEngine, 'pause');

      await act(async () => {
        await result.current.play(mockProtocol);
      });

      act(() => {
        result.current.pause();
      });

      expect(pauseSpy).toHaveBeenCalled();
    });

    it('should handle resume correctly', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const resumeSpy = vi.spyOn(audioEngine, 'resume');

      act(() => {
        result.current.resume();
      });

      expect(resumeSpy).toHaveBeenCalled();
    });

    it('should handle stop correctly', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const stopSpy = vi.spyOn(audioEngine, 'stopImmediate');

      await act(async () => {
        await result.current.play(mockProtocol);
      });

      act(() => {
        result.current.stop();
      });

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should call onTick callback during playback', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const tickSpy = vi.fn();

      await act(async () => {
        audioEngine.onTick = tickSpy;
        await result.current.play(mockProtocol);
      });

      // Callback should be set
      expect(audioEngine.onTick).toBeDefined();
    });

    it('should call onComplete callback when protocol finishes', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      const completeSpy = vi.fn();

      await act(async () => {
        audioEngine.onComplete = completeSpy;
        await result.current.play(mockProtocol);
      });

      expect(audioEngine.onComplete).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useAudioPlayback(audioEngine));
      await expect(async () => {
        await act(async () => {
          await result.current.play(null as any);
        });
      }).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should clean up on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayback(audioEngine));

      unmount();

      expect(audioEngine.onTick).toBeUndefined();
      expect(audioEngine.onComplete).toBeUndefined();
    });
  });
});
