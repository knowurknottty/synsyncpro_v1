import { useState, useCallback } from 'react';
import { SessionGuidance, MantraProfile, Protocol } from '../../types.ts';

/**
 * Shared session shell state extracted from DesktopApp + MobileApp.
 *
 * Manages vizMode, guidance multi-select, and profile panel — state that
 * both layout variants maintain independently today. Consolidating it here
 * ensures a single source of truth once ResponsiveShell replaces the two
 * separate component trees.
 */

export const DEFAULT_MANTRA: MantraProfile = {
  id: 'universal',
  name: 'Universal',
  phonetic: 'SO HUM',
  meaning: 'I am that — the universal consciousness',
  pronunciation: 'soh · hum',
  tonality: 'Natural voice, low and resonant',
};

export const GUIDANCE_MODES: { id: SessionGuidance; label: string; Icon: React.ElementType }[] = [
  // NOTE: import icons at call site or pass as children.
  // This config is declarative — the caller renders the icons.
  { id: 'audio_only', label: 'Audio Only', Icon: null as any },
  { id: 'breathwork', label: 'Breathe',    Icon: null as any },
  { id: 'mantra',     label: 'Mantra',     Icon: null as any },
  { id: 'socratic',   label: 'Reflect',    Icon: null as any },
  { id: 'geometry',   label: 'Geometry',   Icon: null as any },
];

export function getMantraForOverlay(protocol: Protocol | null): MantraProfile {
  if (protocol?.mantra) {
    return {
      id: protocol.id,
      name: protocol.title,
      phonetic: protocol.mantra.phonetic,
      meaning: protocol.mantra.meaning,
      pronunciation: protocol.mantra.phonetic,
      tonality: 'Natural voice',
    };
  }
  return DEFAULT_MANTRA;
}

export interface UseSessionShellReturn {
  vizMode: string;
  setVizMode: (mode: string) => void;
  activeGuidances: Set<SessionGuidance>;
  toggleGuidance: (id: SessionGuidance) => void;
  clearGuidances: () => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  toggleProfile: () => void;
}

export function useSessionShell(initialVizMode = 'oscilloscope'): UseSessionShellReturn {
  const [vizMode, setVizMode] = useState(initialVizMode);
  const [activeGuidances, setActiveGuidances] = useState<Set<SessionGuidance>>(new Set());
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleGuidance = useCallback((id: SessionGuidance) => {
    setActiveGuidances(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (id === 'socratic') next.clear();
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearGuidances = useCallback(() => {
    setActiveGuidances(new Set());
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen(prev => !prev);
  }, []);

  return {
    vizMode,
    setVizMode,
    activeGuidances,
    toggleGuidance,
    clearGuidances,
    profileOpen,
    setProfileOpen,
    toggleProfile,
  };
}
