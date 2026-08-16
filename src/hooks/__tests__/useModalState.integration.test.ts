import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState } from '../useModalState.ts';

/**
 * Integration tests for useModalState hook
 * Tests modal state management and interactions
 */

describe('useModalState Integration Tests', () => {
  describe('initial state', () => {
    it('should initialize all modals as closed', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.modals.sources).toBe(false);
      expect(result.current.modals.legal).toBe(false);
      expect(result.current.modals.download).toBe(false);
      expect(result.current.modals.safetyGate).toBe(false);
      expect(result.current.modals.manual).toBe(false);
      expect(result.current.modals.biofeedback).toBe(false);
    });
  });

  describe('open modal', () => {
    it('should open a single modal', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
      });

      expect(result.current.modals.sources).toBe(true);
      expect(result.current.modals.legal).toBe(false);
    });

    it('should open multiple modals independently', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
        result.current.open('legal');
      });

      expect(result.current.modals.sources).toBe(true);
      expect(result.current.modals.legal).toBe(true);
    });

    it('should keep modal open if already open', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
        result.current.open('sources');
      });

      expect(result.current.modals.sources).toBe(true);
    });
  });

  describe('close modal', () => {
    it('should close an open modal', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
      });

      expect(result.current.modals.sources).toBe(true);

      act(() => {
        result.current.close('sources');
      });

      expect(result.current.modals.sources).toBe(false);
    });

    it('should not affect other modals when closing one', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
        result.current.open('legal');
      });

      act(() => {
        result.current.close('sources');
      });

      expect(result.current.modals.sources).toBe(false);
      expect(result.current.modals.legal).toBe(true);
    });

    it('should handle closing an already closed modal', () => {
      const { result } = renderHook(() => useModalState());

      expect(() => {
        act(() => {
          result.current.close('sources');
        });
      }).not.toThrow();

      expect(result.current.modals.sources).toBe(false);
    });
  });

  describe('toggle modal', () => {
    it('should toggle closed modal to open', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.toggle('sources');
      });

      expect(result.current.modals.sources).toBe(true);
    });

    it('should toggle open modal to closed', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
      });

      expect(result.current.modals.sources).toBe(true);

      act(() => {
        result.current.toggle('sources');
      });

      expect(result.current.modals.sources).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.toggle('sources');
        result.current.toggle('sources');
        result.current.toggle('sources');
      });

      expect(result.current.modals.sources).toBe(true);
    });
  });

  describe('close all modals', () => {
    it('should close all open modals', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
        result.current.open('legal');
        result.current.open('download');
      });

      expect(result.current.modals.sources).toBe(true);
      expect(result.current.modals.legal).toBe(true);
      expect(result.current.modals.download).toBe(true);

      act(() => {
        result.current.closeAll();
      });

      expect(result.current.modals.sources).toBe(false);
      expect(result.current.modals.legal).toBe(false);
      expect(result.current.modals.download).toBe(false);
      expect(result.current.modals.safetyGate).toBe(false);
    });

    it('should handle closeAll when no modals are open', () => {
      const { result } = renderHook(() => useModalState());

      expect(() => {
        act(() => {
          result.current.closeAll();
        });
      }).not.toThrow();
    });
  });

  describe('state consistency', () => {
    it('should maintain correct state after multiple operations', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.open('sources');
        result.current.open('legal');
        result.current.close('sources');
        result.current.toggle('download');
        result.current.open('safetyGate');
        result.current.closeAll();
      });

      // All should be closed after closeAll
      Object.values(result.current.modals).forEach((isOpen) => {
        expect(isOpen).toBe(false);
      });
    });
  });

  describe('modal types', () => {
    it('should support all modal types', () => {
      const { result } = renderHook(() => useModalState());

      const modalTypes: (keyof typeof result.current.modals)[] = [
        'sources',
        'legal',
        'download',
        'safetyGate',
        'manual',
        'biofeedback',
      ];

      modalTypes.forEach((type) => {
        act(() => {
          result.current.open(type);
        });
        expect(result.current.modals[type]).toBe(true);

        act(() => {
          result.current.close(type);
        });
        expect(result.current.modals[type]).toBe(false);
      });
    });
  });

  describe('performance', () => {
    it('should handle rapid open/close cycles', () => {
      const { result } = renderHook(() => useModalState());

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            result.current.toggle('sources');
          }
        });
      }).not.toThrow();

      expect(result.current.modals.sources).toBe(false);
    });
  });
});
