// components/GammaVisualEntrainment.tsx
// Synchronized 40 Hz photic stimulation for GENUS-style gamma protocols.
//
// SAFETY INTERLOCKS (all must hold for flicker to run):
//   1. Photosensitivity screening must have returned shouldProceed === true.
//   2. The display refresh must be an integer multiple of 40 Hz (measured,
//      not assumed). 60 Hz displays are refused — a malformed 40 Hz aliases
//      into the 15–25 Hz peak-provocation band.
//   3. prefers-reduced-motion refuses flicker (audio-only fallback offered).
//   4. The user must deliberately hold-to-begin; flicker never auto-starts.
//   5. A persistent Stop control and the Escape key abort instantly.
//   6. Leaving the tab (visibilitychange) auto-stops.
//   7. Intensity is capped; the flash is warm-white (never red/pure-white),
//      soft-edged, with a multi-second onset ramp.
//
// The flicker is driven by an integer frame counter locked to the vsync grid,
// so every cycle is identical with zero scheduling jitter.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldAlert, Square, Eye, Play } from 'lucide-react';
import { AudioEngine } from '../services/AudioEngine.ts';
import { useMotion } from '../contexts/MotionContext.tsx';
import { useDisplayRefresh } from '../hooks/useDisplayRefresh.ts';
import {
  PhotosensitivityScreeningModal,
  type ScreeningResult,
} from './PhotosensitivityScreeningModal.tsx';
import {
  PHOTIC_LIMITS,
  GAMMA_TARGET_HZ,
  evaluateRefreshCompatibility,
  isGammaBeat,
  rgbString,
} from '../utils/photicSafety.ts';

interface Props {
  audioEngine: AudioEngine;
  onClose: () => void;
}

type FlickerState = 'idle' | 'arming' | 'running';

export const GammaVisualEntrainment: React.FC<Props> = ({
  audioEngine,
  onClose,
}) => {
  const { reduceMotion } = useMotion();
  const refresh = useDisplayRefresh();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Screening is owned here so the component is a single drop-in.
  const [screeningCleared, setScreeningCleared] = useState(false);
  const [showScreening, setShowScreening] = useState(false);
  const onRequestScreening = () => setShowScreening(true);
  const handleScreeningComplete = (result: ScreeningResult) => {
    setShowScreening(false);
    setScreeningCleared(result.shouldProceed);
  };

  const [flicker, setFlicker] = useState<FlickerState>('idle');
  const [intensity, setIntensity] = useState<number>(PHOTIC_LIMITS.defaultIntensity);
  const intensityRef = useRef(intensity);
  intensityRef.current = Math.min(intensity, PHOTIC_LIMITS.maxIntensity);

  const compat = refresh.hz != null ? evaluateRefreshCompatibility(refresh.hz) : null;

  // ── Hard stop, usable from anywhere ──────────────────────────────────────
  const stopFlicker = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFlicker('idle');
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = rgbString(PHOTIC_LIMITS.darkRGB);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // ── Abort on tab blur and on Escape ──────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stopFlicker(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') stopFlicker(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onKey);
      stopFlicker();
    };
  }, [stopFlicker]);

  // ── The flicker loop ─────────────────────────────────────────────────────
  const runFlicker = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !compat?.ok) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();

    const { framesPerCycle, onFrames } = compat;
    const [br, bg, bb] = PHOTIC_LIMITS.brightRGB;
    const [dr, dg, db] = PHOTIC_LIMITS.darkRGB;

    let frame = 0;
    let rampStart = 0;

    const draw = (t: number) => {
      if (rampStart === 0) rampStart = t;
      // Soft onset ramp 0 → target intensity
      const elapsed = (t - rampStart) / 1000;
      const ramp = Math.min(1, elapsed / PHOTIC_LIMITS.onsetRampSeconds);

      // Only flash while the audio is genuinely in the 40 Hz gamma phase.
      const beat = audioEngine.getCymaticsFrequencies().beatFreq;
      const gammaActive = audioEngine.isPlaying && isGammaBeat(beat, GAMMA_TARGET_HZ);

      const phaseInCycle = frame % framesPerCycle;
      const isOn = gammaActive && phaseInCycle < onFrames;
      const amp = isOn ? intensityRef.current * ramp : 0;

      // Interpolate dark → bright by amplitude (bounded luminance delta)
      const r = dr + (br - dr) * amp;
      const g = dg + (bg - dg) * amp;
      const b = db + (bb - db) * amp;

      const w = canvas.width;
      const h = canvas.height;
      // Soft-edged field: radial falloff toward the edges
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.hypot(cx, cy);
      const inner = maxR * (1 - PHOTIC_LIMITS.edgeFalloff);
      const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, maxR);
      grad.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      grad.addColorStop(1, rgbString(PHOTIC_LIMITS.darkRGB));
      ctx.fillStyle = rgbString(PHOTIC_LIMITS.darkRGB);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      frame += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }, [audioEngine, compat]);

  useEffect(() => {
    if (flicker === 'running') runFlicker();
  }, [flicker, runFlicker]);

  // ── Gating: figure out the single actionable state ───────────────────────
  const blocker: { title: string; body: string; action?: React.ReactNode } | null = (() => {
    if (reduceMotion) {
      return {
        title: 'Visual flicker disabled by your motion settings',
        body:
          'You have "Reduce motion" enabled, so photic stimulation is turned off. ' +
          'The 40 Hz audio entrainment runs normally.',
      };
    }
    if (refresh.measuring || refresh.hz == null) {
      return { title: 'Checking your display…', body: 'Measuring refresh rate to verify it can show 40 Hz safely.' };
    }
    if (compat && !compat.ok) {
      return { title: 'This display can’t show 40 Hz flicker safely', body: compat.reason };
    }
    if (!screeningCleared) {
      return {
        title: 'Photosensitivity screening required',
        body:
          'Flashing light at 40 Hz can trigger seizures in people with photosensitive ' +
          'epilepsy. A short screening is required before visual stimulation can start.',
        action: (
          <button
            onClick={onRequestScreening}
            className="mt-3 px-4 py-2 rounded-lg font-semibold text-black"
            style={{ background: '#25f4e2' }}
          >
            Start screening
          </button>
        ),
      };
    }
    return null;
  })();

  const canArm = !blocker && flicker === 'idle';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* The flash surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Persistent abort — always on top, always reachable */}
      <button
        onClick={flicker === 'running' ? stopFlicker : onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full font-semibold backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
      >
        <Square className="w-4 h-4 fill-current" />
        {flicker === 'running' ? 'Stop flicker' : 'Close'}
      </button>

      {/* Overlay: either the blocker explanation or the arm/controls panel */}
      {flicker !== 'running' && (
        <div className="relative z-10 m-auto max-w-md w-full px-6">
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(15,17,23,0.92)', border: '1px solid rgba(37,244,226,0.15)' }}
          >
            <div className="flex justify-center mb-3">
              <ShieldAlert className="w-8 h-8" style={{ color: '#f5a623' }} />
            </div>

            {blocker ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">{blocker.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {blocker.body}
                </p>
                {blocker.action}
                {!blocker.action && (
                  <button onClick={onClose} className="mt-4 text-sm underline" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Continue with audio only
                  </button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white mb-1">40 Hz visual entrainment</h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(37,244,226,0.8)' }}>
                  Display verified at {Math.round(refresh.hz!)} Hz ·
                  {' '}{compat?.ok ? compat.framesPerCycle : '—'} frames/cycle
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Gentle, warm-white flashes synchronized to the 40 Hz audio. Keep a
                  comfortable distance, stay relaxed, and stop immediately if you feel
                  any discomfort. Press Escape or “Stop flicker” at any time.
                </p>

                {/* Intensity (capped) */}
                <div className="flex items-center gap-3 mb-5 text-left">
                  <Eye className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <input
                    type="range"
                    min={0.2}
                    max={PHOTIC_LIMITS.maxIntensity}
                    step={0.05}
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="flex-1"
                    aria-label="Flash intensity"
                  />
                  <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {Math.round(intensity * 100)}%
                  </span>
                </div>

                {/* Hold-to-begin (deliberate start, soft onset ramp follows) */}
                <HoldToBegin
                  disabled={!canArm}
                  onConfirm={() => setFlicker('running')}
                />
                <button onClick={onClose} className="mt-3 text-sm underline block mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Audio only
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Self-contained screening flow */}
      <PhotosensitivityScreeningModal
        isOpen={showScreening}
        onClose={() => setShowScreening(false)}
        onComplete={handleScreeningComplete}
      />
    </div>
  );
};

/** A press-and-hold button so flicker can never start from an accidental tap. */
const HoldToBegin: React.FC<{ disabled: boolean; onConfirm: () => void }> = ({ disabled, onConfirm }) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const HOLD_MS = 800;

  const begin = () => {
    if (disabled) return;
    startRef.current = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - startRef.current) / HOLD_MS);
      setProgress(p);
      if (p >= 1) { onConfirm(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setProgress(0);
  };

  return (
    <button
      disabled={disabled}
      onMouseDown={begin}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={begin}
      onTouchEnd={cancel}
      className="relative w-full py-3 rounded-lg font-semibold text-black overflow-hidden disabled:opacity-40"
      style={{ background: '#25f4e2' }}
    >
      <span
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.25)', width: `${(1 - progress) * 100}%`, right: 0, left: 'auto' }}
      />
      <span className="relative flex items-center justify-center gap-2">
        <Play className="w-4 h-4 fill-current" />
        Hold to begin
      </span>
    </button>
  );
};

export default GammaVisualEntrainment;
