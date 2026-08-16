import { useEffect, useRef, useCallback } from 'react';

/**
 * useIOSAudioSession
 *
 * Solves two iOS-specific Web Audio problems:
 *
 * 1. First-play failure: iOS requires AudioContext.resume() to be called
 *    from a direct user gesture. We attach a one-shot touchstart/click
 *    listener that unlocks the context on the very first interaction,
 *    so by the time the user taps "Play" the context is already running.
 *
 * 2. Audio stops on screen lock: iOS suspends Web Audio when the screen
 *    sleeps. A silent <audio> element looping a tiny WAV keeps the
 *    hardware audio session alive (the same trick YouTube/Spotify use).
 *    Combined with the Screen Wake Lock API to discourage the screen
 *    from dimming in the first place, and MediaSession metadata so the
 *    lock-screen shows transport controls.
 */

// 0.1 s silence encoded as a base64 WAV (44100 Hz, 16-bit mono)
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

interface UseIOSAudioSessionOptions {
  audioContext: AudioContext | null;
  isPlaying: boolean;
  title?: string;
  artist?: string;
}

export function useIOSAudioSession({
  audioContext,
  isPlaying,
  title,
  artist,
}: UseIOSAudioSessionOptions) {
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const unlocked = useRef(false);

  // ── 1. Early AudioContext unlock on first user gesture ──────────
  useEffect(() => {
    if (!audioContext || unlocked.current) return;

    const earlyUnlock = async () => {
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch {
          // Will retry on next gesture
        }
      }
      if (audioContext.state === 'running') {
        unlocked.current = true;
        window.removeEventListener('touchstart', earlyUnlock, true);
        window.removeEventListener('touchend', earlyUnlock, true);
        window.removeEventListener('click', earlyUnlock, true);
      }
    };

    window.addEventListener('touchstart', earlyUnlock, true);
    window.addEventListener('touchend', earlyUnlock, true);
    window.addEventListener('click', earlyUnlock, true);

    return () => {
      window.removeEventListener('touchstart', earlyUnlock, true);
      window.removeEventListener('touchend', earlyUnlock, true);
      window.removeEventListener('click', earlyUnlock, true);
    };
  }, [audioContext]);

  // ── 2. Silent <audio> element for background audio session ─────
  useEffect(() => {
    if (silentAudioRef.current) return;

    const el = new Audio();
    el.src = SILENT_WAV;
    el.loop = true;
    el.volume = 0.01; // Near-silent but nonzero so iOS keeps session alive
    el.setAttribute('playsinline', 'true');
    // Allow the audio to play without requiring a media element to be visible
    (el as any).webkitPreservesPitch = true;
    silentAudioRef.current = el;

    return () => {
      el.pause();
      el.src = '';
      silentAudioRef.current = null;
    };
  }, []);

  // Start/stop the silent audio in sync with playback state
  useEffect(() => {
    const el = silentAudioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.play().catch(() => {
        // Will succeed on next user gesture
      });
    } else {
      el.pause();
    }
  }, [isPlaying]);

  // ── 3. Screen Wake Lock API ────────────────────────────────────
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Wake lock denied (e.g., low battery)
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Already released
      }
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again (iOS releases it on blur)
  useEffect(() => {
    if (!isPlaying) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock();
        // Also nudge AudioContext back to running
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isPlaying, audioContext, requestWakeLock]);

  // ── 4. Media Session API (lock-screen controls) ────────────────
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (isPlaying && title) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist ?? 'SynSync Pro',
        album: 'Neuroacoustic Protocol',
      });
      navigator.mediaSession.playbackState = 'playing';
    } else {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying, title, artist]);
}
