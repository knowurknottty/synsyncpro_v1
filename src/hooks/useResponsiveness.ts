import { useState, useEffect, useCallback } from 'react';

export type LayoutMode = 'compact' | 'medium' | 'cockpit';

// Only genuinely sub-320px legacy viewports use the stripped compact shell.
// Standard Android phones (320px and above) now receive the responsive cockpit
// so visual identity and graphics stay consistent with desktop.
export const COMPACT_MAX = 319;
export const COCKPIT_MIN = 1100;
export const LEGACY_MOBILE_BREAKPOINT = 1024;

export function classifyLayoutWidth(width: number): LayoutMode {
  if (width <= COMPACT_MAX) return 'compact';
  if (width < COCKPIT_MIN) return 'medium';
  return 'cockpit';
}

const getViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  const viewport = window.visualViewport;
  return {
    width: Math.round(viewport?.width ?? window.innerWidth),
    height: Math.round(viewport?.height ?? window.innerHeight),
  };
};

type ResponsivenessOptions = {
  /**
   * Compatibility override for older callers. Prefer layoutMode for new UI.
   * Existing callers still receive the historical 1024px isMobile behavior
   * until App routing is migrated to compact/medium/cockpit explicitly.
   */
  breakpoint?: number;
};

export function useResponsiveness(
  options: number | ResponsivenessOptions = { breakpoint: LEGACY_MOBILE_BREAKPOINT },
) {
  const compatibilityBreakpoint = typeof options === 'number'
    ? options
    : options.breakpoint ?? LEGACY_MOBILE_BREAKPOINT;
  const initial = getViewport();
  const [width, setWidth] = useState(initial.width);
  const [height, setHeight] = useState(initial.height);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => classifyLayoutWidth(initial.width));
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    () => initial.height > initial.width ? 'portrait' : 'landscape'
  );

  const handleResize = useCallback(() => {
    const next = getViewport();
    setWidth(next.width);
    setHeight(next.height);
    setLayoutMode(classifyLayoutWidth(next.width));
    setOrientation(next.height > next.width ? 'portrait' : 'landscape');
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const compact = window.matchMedia(`(max-width: ${COMPACT_MAX}px)`);
    const cockpit = window.matchMedia(`(min-width: ${COCKPIT_MIN}px)`);

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    viewport?.addEventListener('resize', handleResize, { passive: true });
    compact.addEventListener('change', handleResize);
    cockpit.addEventListener('change', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      viewport?.removeEventListener('resize', handleResize);
      compact.removeEventListener('change', handleResize);
      cockpit.removeEventListener('change', handleResize);
    };
  }, [handleResize]);

  return {
    isMobile: width < compatibilityBreakpoint,
    isCompact: layoutMode === 'compact',
    isMedium: layoutMode === 'medium',
    isCockpit: layoutMode === 'cockpit',
    layoutMode,
    width,
    height,
    orientation,
  };
}
