import React, { useEffect, useRef, useMemo } from 'react';
import { AudioEngine } from '../services/AudioEngine.ts';
import { Protocol } from '../types.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BioInsightsProps {
  audioEngine: AudioEngine;
  activeProtocol: Protocol | null;
  isPlaying: boolean;
}

interface BandEntry {
  key: string;
  pct: number;
  color: string;
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBandDistribution(protocol: Protocol | null): [BandEntry, BandEntry, BandEntry] {
  const fallback: [BandEntry, BandEntry, BandEntry] = [
    { key: 'Alpha', pct: 60, color: '#8b5cf6', label: 'Calm' },
    { key: 'Beta',  pct: 30, color: '#fbbf24', label: 'Active' },
    { key: 'Gamma', pct: 10, color: '#26ffdf', label: 'Peak' },
  ];
  if (!protocol || protocol.phases.length === 0) return fallback;

  const total = protocol.duration || 1;
  const sums = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
  for (const phase of protocol.phases) {
    const hz = phase.beat;
    if (hz < 4)  sums.delta += phase.duration;
    else if (hz < 8)  sums.theta += phase.duration;
    else if (hz < 14) sums.alpha += phase.duration;
    else if (hz < 30) sums.beta  += phase.duration;
    else               sums.gamma += phase.duration;
  }

  const all: BandEntry[] = [
    { key: 'Alpha', pct: Math.round((sums.alpha / total) * 100), color: '#8b5cf6', label: 'Calm' },
    { key: 'Beta',  pct: Math.round((sums.beta  / total) * 100), color: '#fbbf24', label: 'Active' },
    { key: 'Gamma', pct: Math.round((sums.gamma / total) * 100), color: '#26ffdf', label: 'Peak' },
    { key: 'Theta', pct: Math.round((sums.theta / total) * 100), color: '#60a5fa', label: 'Meditate' },
    { key: 'Delta', pct: Math.round((sums.delta / total) * 100), color: '#a78bfa', label: 'Deep Rest' },
  ];

  const top3 = all.sort((a, b) => b.pct - a.pct).slice(0, 3) as [BandEntry, BandEntry, BandEntry];
  if (top3.every(b => b.pct === 0)) return fallback;
  return top3;
}

/** Build a smooth SVG line chart path from protocol beat Hz across W=400 H=150 viewport. */
function buildCoherencePath(protocol: Protocol | null): string {
  if (!protocol || protocol.phases.length === 0) {
    return 'M0,120 Q50,110 80,80 T150,60 T220,90 T300,40 T400,20';
  }
  const W = 400, H = 150, MARGIN = 15;
  const total = protocol.duration || 1;
  const maxHz = Math.max(...protocol.phases.map(p => p.beat), 30);
  const minHz = Math.min(...protocol.phases.map(p => p.beat), 1);
  const range = maxHz - minHz || 1;

  const pts: { x: number; y: number }[] = [];
  let cumulative = 0;
  for (const phase of protocol.phases) {
    cumulative += phase.duration;
    const x = Math.round((cumulative / total) * W);
    const y = Math.round(H - MARGIN - ((phase.beat - minHz) / range) * (H - MARGIN * 2));
    pts.push({ x, y });
  }

  if (pts.length === 1) return `M0,${pts[0].y} L${W},${pts[0].y}`;

  let d = `M0,${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const midX = Math.round((pts[i].x + pts[i + 1].x) / 2);
    const midY = Math.round((pts[i].y + pts[i + 1].y) / 2);
    d += ` Q${pts[i].x},${pts[i].y} ${midX},${midY}`;
  }
  const last = pts[pts.length - 1];
  d += ` T${last.x},${last.y}`;
  return d;
}

// ─── Ring Chart ───────────────────────────────────────────────────────────────

// SVG circle with circumference ≈ 100 (2π × 15.9155 ≈ 100), rotated -90° to start at top.
const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

const RingChart: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <svg viewBox="0 0 36 36" className="size-16" style={{ transform: 'rotate(-90deg)' }}>
    <path d={RING_PATH} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
    <path
      d={RING_PATH}
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray={`${pct}, 100`}
      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
    />
  </svg>
);

// ─── ECG Waveform ─────────────────────────────────────────────────────────────

const ECG_PATH =
  'M0,30 L40,30 L50,10 L65,50 L75,30 L110,30 L120,5 L135,55 L150,30 L190,30 L200,15 L215,45 L225,30 L260,30 L270,10 L285,50 L300,30 L400,30';

// ─── Component ────────────────────────────────────────────────────────────────

export const BioInsights: React.FC<BioInsightsProps> = ({ audioEngine, activeProtocol, isPlaying }) => {
  const bands = useMemo(() => getBandDistribution(activeProtocol), [activeProtocol]);
  const coherencePath = useMemo(() => buildCoherencePath(activeProtocol), [activeProtocol]);

  // Neural Coherence card refs
  const coherenceValueRef = useRef<HTMLSpanElement>(null);
  const coherenceBadgeRef = useRef<HTMLSpanElement>(null);
  const coherenceBadgeWrapRef = useRef<HTMLSpanElement>(null);

  // HRV / Neural Readiness card refs
  const hrvDotRef    = useRef<HTMLSpanElement>(null);
  const hrvStatusRef = useRef<HTMLSpanElement>(null);

  // ECG animation refs
  const ecgGroupRef    = useRef<SVGGElement>(null);
  const ecgOffsetRef   = useRef(0);
  const reqRef         = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      // ── Status state ────────────────────────────────────────────────────────
      let statusLabel: string;
      let statusColor: string;
      let dotColor: string;
      let depthPct = '--';

      if (isPlaying && activeProtocol) {
        const state = audioEngine.getPlaybackState();
        const pct = Math.min(Math.round((state.totalElapsed / activeProtocol.duration) * 100), 100);
        depthPct = String(pct);
        statusLabel = 'ACTIVE';
        statusColor = '#26ffdf';
        dotColor    = '#26ffdf';
      } else if (activeProtocol) {
        const state = audioEngine.getPlaybackState();
        const pct = Math.min(Math.round((state.totalElapsed / activeProtocol.duration) * 100), 100);
        depthPct = pct > 0 ? String(pct) : '--';
        statusLabel = 'READY';
        statusColor = '#fbbf24';
        dotColor    = '#fbbf24';
      } else {
        statusLabel = 'IDLE';
        statusColor = 'rgba(255,255,255,0.3)';
        dotColor    = 'rgba(255,255,255,0.2)';
      }

      // ── Update Neural Coherence card ─────────────────────────────────────
      if (coherenceValueRef.current)    coherenceValueRef.current.textContent = depthPct;
      if (coherenceBadgeRef.current)    coherenceBadgeRef.current.textContent = statusLabel;
      if (coherenceBadgeWrapRef.current) coherenceBadgeWrapRef.current.style.color = statusColor;

      // ── Update HRV card status ───────────────────────────────────────────
      if (hrvDotRef.current)    hrvDotRef.current.style.background    = dotColor;
      if (hrvStatusRef.current) hrvStatusRef.current.style.color      = statusColor;

      // ── Scroll ECG waveform ──────────────────────────────────────────────
      ecgOffsetRef.current -= 0.6;
      if (ecgOffsetRef.current < -400) ecgOffsetRef.current = 0;
      if (ecgGroupRef.current) {
        ecgGroupRef.current.setAttribute('transform', `translate(${ecgOffsetRef.current},0)`);
      }

      reqRef.current = requestAnimationFrame(update);
    };

    reqRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqRef.current);
  }, [audioEngine, activeProtocol, isPlaying]);

  return (
    <div className="space-y-4">
      {/* ── Neural Coherence card ──────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(18, 18, 26, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 30px -10px rgba(38, 255, 223, 0.18)',
        }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">
              Session Depth
            </p>
            <h2 className="text-4xl font-bold tabular-nums leading-none">
              <span ref={coherenceValueRef}>--</span>
              <span className="text-[#26ffdf] text-xl ml-1">%</span>
            </h2>
          </div>
          <span
            ref={coherenceBadgeWrapRef}
            className="px-2 py-1 rounded-md text-[10px] font-bold"
            style={{ background: 'rgba(38,255,223,0.07)', color: 'rgba(255,255,255,0.3)' }}
          >
            <span ref={coherenceBadgeRef}>IDLE</span>
          </span>
        </div>

        {/* SVG line chart */}
        <div className="h-36 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bio-coherence-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%"   stopColor="#26ffdf" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#26ffdf" stopOpacity="0"    />
              </linearGradient>
            </defs>
            <path d={`${coherencePath} V150 H0 Z`} fill="url(#bio-coherence-grad)" />
            <path
              d={coherencePath}
              fill="none"
              stroke="#26ffdf"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 6px rgba(38,255,223,0.55))' }}
            />
          </svg>
          <div className="flex justify-between mt-2 text-[9px] text-white/25 font-mono">
            <span>START</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>NOW</span>
          </div>
        </div>
      </div>

      {/* ── Brainwave Distribution ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Brainwave Distribution
          </p>
          <span className="text-[9px] text-white/25">This session</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {bands.map((band) => (
            <div
              key={band.key}
              className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{
                background: 'rgba(18, 18, 26, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="relative size-16 mb-1">
                <RingChart pct={band.pct} color={band.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold tabular-nums">{band.pct}%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase" style={{ color: band.color }}>
                {band.key}
              </span>
              <span className="text-[9px] text-white/30">{band.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Neural Readiness / HRV card ────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(18, 18, 26, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">
              Neural Readiness
            </p>
            <p className="text-sm font-mono text-white/50 leading-none">
              {activeProtocol
                ? `${activeProtocol.phases.length} phase${activeProtocol.phases.length !== 1 ? 's' : ''}`
                : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              ref={hrvDotRef}
              className="size-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)', boxShadow: '0 0 6px currentColor' }}
            />
            <span
              ref={hrvStatusRef}
              className="text-[10px] font-bold"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              IDLE
            </span>
          </div>
        </div>

        {/* Scrolling ECG waveform */}
        <div className="h-14 w-full overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
            <g ref={ecgGroupRef}>
              <path
                d={ECG_PATH}
                fill="none"
                stroke="rgba(38,255,223,0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Second copy offset by 400 for seamless loop */}
              <path
                d={ECG_PATH}
                transform="translate(400,0)"
                fill="none"
                stroke="rgba(38,255,223,0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        <p className="text-center text-[9px] text-white/25 mt-3 italic">
          {activeProtocol
            ? `${activeProtocol.phases[0]?.beat ?? '—'} Hz → ${activeProtocol.phases[activeProtocol.phases.length - 1]?.beat ?? '—'} Hz entrainment`
            : 'Select a session to begin entrainment'}
        </p>
      </div>
    </div>
  );
};
