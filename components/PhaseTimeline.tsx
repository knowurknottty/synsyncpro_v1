import React, { useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';
import { Protocol } from '../types.ts';
import { AudioEngine } from '../services/AudioEngine.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBandColor(hz: number): string {
  if (hz < 4)  return '#a78bfa'; // Delta — purple
  if (hz < 8)  return '#60a5fa'; // Theta — blue
  if (hz < 14) return '#34d399'; // Alpha — green
  if (hz < 30) return '#fbbf24'; // Beta  — yellow
  return '#f87171';              // Gamma — red
}

function getBandSymbol(hz: number): string {
  if (hz < 4)  return 'Δ';
  if (hz < 8)  return 'θ';
  if (hz < 14) return 'α';
  if (hz < 30) return 'β';
  return 'γ';
}

function formatPhaseTime(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return sec ? `${m}m ${sec}s` : `${m}m`;
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const BAND_LEGEND = [
  { symbol: 'Δ', label: 'Delta', color: '#a78bfa', range: '< 4 Hz' },
  { symbol: 'θ', label: 'Theta', color: '#60a5fa', range: '4–8 Hz' },
  { symbol: 'α', label: 'Alpha', color: '#34d399', range: '8–14 Hz' },
  { symbol: 'β', label: 'Beta',  color: '#fbbf24', range: '14–30 Hz' },
  { symbol: 'γ', label: 'Gamma', color: '#f87171', range: '> 30 Hz' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PhaseTimelineProps {
  protocol: Protocol;
  audioEngine: AudioEngine;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ protocol, audioEngine }) => {
  const markerRef   = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);
  const reqRef      = useRef<number>(0);
  const total       = protocol.duration;

  // Animate playback position marker
  useEffect(() => {
    const update = () => {
      const isActive =
        audioEngine.isPlaying &&
        (audioEngine.currentProtocol as Protocol | null)?.id === protocol.id;

      if (isActive && markerRef.current) {
        const state = audioEngine.getPlaybackState();
        const pct   = Math.min((state.totalElapsed / total) * 100, 100);
        markerRef.current.style.left    = `${pct}%`;
        markerRef.current.style.display = 'block';

        if (phaseLabelRef.current) {
          const idx = state.currentPhaseIndex + 1;
          phaseLabelRef.current.innerText = `Phase ${idx}/${protocol.phases.length}`;
        }
      } else {
        if (markerRef.current) markerRef.current.style.display = 'none';
      }

      reqRef.current = requestAnimationFrame(update);
    };

    reqRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqRef.current);
  }, [audioEngine, protocol.id, total, protocol.phases.length]);

  return (
    <div className="bg-neuro-800/40 border border-neuro-700 rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <Layers className="w-3.5 h-3.5" />
          Protocol Structure
        </div>
        <div className="flex items-center gap-2">
          <span ref={phaseLabelRef} className="text-[10px] text-neuro-500 font-mono" />
          <span className="text-[10px] text-gray-600 font-mono">
            {protocol.phases.length} phases · {formatPhaseTime(total)}
          </span>
        </div>
      </div>

      {/* Band legend */}
      <div className="flex gap-3 flex-wrap">
        {BAND_LEGEND.map(({ symbol, label, color, range }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
            <span className="text-[9px] text-gray-600 font-mono">
              {symbol} {label}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="relative">
        <div className="flex h-10 rounded-lg overflow-hidden border border-neuro-700/50">
          {protocol.phases.map((phase, i) => {
            const widthPct = (phase.duration / total) * 100;
            const beat     = phase.beat;
            const color    = getBandColor(beat);
            const symbol   = getBandSymbol(beat);

            return (
              <div
                key={i}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: `${color}22`,
                  borderRight:
                    i < protocol.phases.length - 1
                      ? `1px solid ${color}40`
                      : 'none',
                }}
                className="relative flex items-center justify-center group shrink-0"
                title={`Phase ${i + 1}: ${beat} Hz (${symbol}) — ${formatPhaseTime(phase.duration)}`}
              >
                {widthPct > 7 && (
                  <span
                    className="text-[10px] font-bold select-none"
                    style={{ color }}
                  >
                    {symbol}
                  </span>
                )}

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-neuro-950 border border-neuro-700 rounded text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                  <span style={{ color }} className="font-bold">Phase {i + 1}</span>
                  <span className="text-gray-400"> · {beat} Hz · {formatPhaseTime(phase.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated playback marker */}
        <div
          ref={markerRef}
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)] pointer-events-none"
          style={{ display: 'none' }}
        />
      </div>

      {/* Phase Hz labels row */}
      <div className="flex -mt-2">
        {protocol.phases.map((phase, i) => {
          const widthPct = (phase.duration / total) * 100;
          return (
            <div
              key={i}
              style={{ width: `${widthPct}%` }}
              className="text-center overflow-hidden"
            >
              {widthPct > 6 && (
                <span className="text-[8px] text-gray-700 font-mono tabular-nums">
                  {phase.beat}Hz
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
