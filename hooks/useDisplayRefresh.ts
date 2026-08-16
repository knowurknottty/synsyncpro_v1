// hooks/useDisplayRefresh.ts
// Measures the display's true refresh rate by timing requestAnimationFrame
// callbacks. navigator gives no reliable refresh value, and it can change at
// runtime (external monitor, ProMotion throttling), so we measure empirically
// and report the median inter-frame interval converted to Hz.

import { useEffect, useState } from 'react';

export interface RefreshMeasurement {
  hz: number | null;       // null while measuring
  samples: number;
  measuring: boolean;
}

/**
 * @param sampleCount number of frame intervals to median over (default 40)
 */
export function useDisplayRefresh(sampleCount = 40): RefreshMeasurement {
  const [state, setState] = useState<RefreshMeasurement>({
    hz: null,
    samples: 0,
    measuring: true,
  });

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const intervals: number[] = [];
    let cancelled = false;

    const tick = (t: number) => {
      if (cancelled) return;
      if (last > 0) {
        const dt = t - last;
        // Discard absurd intervals (tab throttling, breakpoints)
        if (dt > 1 && dt < 100) intervals.push(dt);
      }
      last = t;

      if (intervals.length >= sampleCount) {
        const sorted = [...intervals].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        setState({ hz: 1000 / median, samples: intervals.length, measuring: false });
        return;
      }
      setState((s) => ({ ...s, samples: intervals.length }));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [sampleCount]);

  return state;
}
