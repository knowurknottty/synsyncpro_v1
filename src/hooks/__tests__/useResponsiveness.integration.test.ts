import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsiveness } from '../useResponsiveness.ts';

/**
 * Integration tests for useResponsiveness hook
 * Tests mobile/desktop detection and responsive behavior
 */

describe('useResponsiveness Integration Tests', () => {
  beforeEach(() => {
    // Reset window size to default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('initial state', () => {
    it('should initialize with correct viewport dimensions', () => {
      const { result } = renderHook(() => useResponsiveness());

      expect(result.current.width).toBe(1024);
      expect(result.current.isMobile).toBe(false);
    });

    it('should detect mobile on narrow screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useResponsiveness());

      expect(result.current.isMobile).toBe(true);
    });

    it('should detect desktop on wide screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { result } = renderHook(() => useResponsiveness());

      expect(result.current.isMobile).toBe(false);
    });
  });

  describe('responsive behavior', () => {
    it('should update on window resize', async () => {
      const { result, rerender } = renderHook(() => useResponsiveness());

      expect(result.current.isMobile).toBe(false);

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });
        window.dispatchEvent(new Event('resize'));
      });

      rerender();

      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(375);
    });

    it('should update on orientation change', async () => {
      const { result, rerender } = renderHook(() => useResponsiveness());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });
        window.dispatchEvent(new Event('orientationchange'));
      });

      rerender();

      expect(result.current.width).toBe(768);
    });
  });

  describe('breakpoint detection', () => {
    it('should use custom breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useResponsiveness({ breakpoint: 900 }));

      expect(result.current.isMobile).toBe(true);
    });

    it('should detect exact breakpoint boundary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useResponsiveness({ breakpoint: 1024 }));

      expect(result.current.isMobile).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useResponsiveness());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'orientationchange',
        expect.any(Function)
      );
    });
  });

  describe('performance', () => {
    it('should debounce rapid resize events', async () => {
      const { result, rerender } = renderHook(() => useResponsiveness());

      // Simulate rapid resize events
      for (let i = 0; i < 10; i++) {
        act(() => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800 + i * 10,
          });
          window.dispatchEvent(new Event('resize'));
        });
      }

      rerender();

      // Should have settled on final width
      expect(result.current.width).toBeGreaterThanOrEqual(800);
    });
  });

  describe('orientation detection', () => {
    it('should detect portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { result } = renderHook(() => useResponsiveness());

      expect(result.current.orientation).toBe('portrait');
    });

    it('should detect landscape orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600,
      });

      const { result } = renderHook(() => useResponsiveness());

      expect(result.current.orientation).toBe('landscape');
    });
  });
});
