import React, { useState, useEffect } from 'react';
import { GeometryLesson, SessionGuidance, MantraProfile } from '../types';
import { Brain, ArrowRight, Hexagon, Mic2, X } from 'lucide-react';
import { SOCRATIC_STEPS, GEOMETRY_LESSONS } from '../constants';

interface GuidanceOverlayProps {
  /** Array of currently active guidance modes (multi-select supported) */
  modes: SessionGuidance[];
  breathRatio?: readonly [number, number, number, number]; // [inhale, hold, exhale, hold]
  mantra?: MantraProfile;
  elapsedTime: number;
  /** Optional: called when user taps X to dismiss a specific mode */
  onClose?: (mode: SessionGuidance) => void;
}

// Map shape names to SVG assets
const SHAPE_IMAGES: Record<string, string> = {
  'Tetrahedron':        '/geometry/tetrahedron.svg',
  'Hexahedron (Cube)':  '/geometry/hexahedron.svg',
};

export const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({
  modes,
  breathRatio = [4, 4, 4, 4],
  mantra,
  elapsedTime,
  onClose,
}) => {
  const has = (m: SessionGuidance) => modes.includes(m);
  const breathActive = has('breathwork') || has('mantra');

  // ── Breathwork state ──────────────────────────────────────────────────────
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathScale, setBreathScale] = useState(1);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  useEffect(() => {
    if (!breathActive) return;
    const [inDur, hold1, exDur, hold2] = breathRatio;
    const totalCycle = inDur + hold1 + exDur + hold2;
    const start = Date.now();
    let handle: number;
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const t = elapsed % totalCycle;
      let phase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
      let left = 0;
      if (t < inDur) {
        phase = 'Inhale'; left = inDur - t; setBreathScale(0.5 + 0.5 * (t / inDur));
      } else if (t < inDur + hold1) {
        phase = 'Hold'; left = inDur + hold1 - t; setBreathScale(1);
      } else if (t < inDur + hold1 + exDur) {
        phase = 'Exhale'; left = inDur + hold1 + exDur - t;
        setBreathScale(1 - 0.5 * ((t - inDur - hold1) / exDur));
      } else {
        phase = 'Hold'; left = totalCycle - t; setBreathScale(0.5);
      }
      setBreathPhase(phase);
      setPhaseTimeLeft(Math.ceil(left));
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [breathActive, breathRatio]);

  // ── Socratic state ────────────────────────────────────────────────────────
  const [socraticIdx, setSocraticIdx]     = useState(0);
  const [socraticInput, setSocraticInput] = useState('');
  const [history, setHistory]             = useState<{ step: string; val: string }[]>([]);

  // ── Geometry state ────────────────────────────────────────────────────────
  const [geoIdx, setGeoIdx] = useState(0);
  useEffect(() => {
    if (!has('geometry')) return;
    const id = setInterval(() => setGeoIdx(i => (i + 1) % GEOMETRY_LESSONS.length), 30_000);
    return () => clearInterval(id);
  }, [modes]);

  // Nothing active
  if (modes.length === 0) return null;

  // ── Socratic — fullscreen, exclusive ─────────────────────────────────────
  if (has('socratic')) {
    const step = SOCRATIC_STEPS[socraticIdx];
    return (
      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-8 pointer-events-auto bg-black/60 backdrop-blur-sm">
        <div className="max-w-2xl w-full bg-neuro-900 border border-neuro-500/30 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 relative">
          {onClose && (
            <button
              onClick={() => onClose('socratic')}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="Exit Socratic mode"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3 mb-6 text-neuro-400">
            <Brain className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Socratic Reprogramming</h2>
          </div>
          <div className="mb-8">
            <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">
              Step {socraticIdx + 1}: {step.id}
            </div>
            <p className="text-xl text-white leading-relaxed">{step.question}</p>
          </div>
          <textarea
            className="w-full bg-black/30 border border-neuro-700 rounded-xl p-4 text-lg text-white focus:border-neuro-500 focus:ring-1 focus:ring-neuro-500 outline-none mb-6 h-32 resize-none"
            placeholder={step.placeholder}
            value={socraticInput}
            onChange={e => setSocraticInput(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {SOCRATIC_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === socraticIdx ? 'bg-neuro-500' : i < socraticIdx ? 'bg-neuro-800' : 'bg-gray-800'}`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                setHistory([...history, { step: step.id, val: socraticInput }]);
                setSocraticInput('');
                setSocraticIdx(i => (i + 1) % SOCRATIC_STEPS.length);
              }}
              disabled={!socraticInput}
              className="flex items-center gap-2 bg-neuro-500 text-neuro-900 px-6 py-3 rounded-lg font-bold hover:bg-neuro-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step.nextLabel} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Geometry card — corner overlay ────────────────────────────────────────
  const geometryCard = has('geometry') && (() => {
    const lesson = GEOMETRY_LESSONS[geoIdx] as GeometryLesson;
    const imagePath = SHAPE_IMAGES[lesson.shape];
    return (
      <div className="absolute bottom-8 left-8 z-40 max-w-2xl animate-in slide-in-from-bottom-4">
        <div className="bg-black/70 border border-neuro-500/30 backdrop-blur-md p-6 rounded-2xl shadow-xl flex gap-6 relative">
          {onClose && (
            <button
              onClick={() => onClose('geometry')}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="Exit geometry mode"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {imagePath && (
            <div className="w-36 h-36 shrink-0 flex items-center justify-center bg-black/50 rounded-xl border border-neuro-700/50 p-3">
              <img
                src={imagePath}
                alt={lesson.shape}
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(31,184,205,0.3)]"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 text-neuro-400">
              <Hexagon className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Sacred Geometry</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{lesson.shape}</h3>
            <div className="text-xs font-mono text-neuro-300 mb-3">Element: {lesson.element}</div>
            <p className="text-gray-300 leading-relaxed text-sm">{lesson.description}</p>
          </div>
        </div>
      </div>
    );
  })();

  // ── Breathwork + Mantra ───────────────────────────────────────────────────
  const breathMantraOverlay = breathActive && (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
      <div
        className="rounded-full border-4 border-neuro-400/30 flex items-center justify-center transition-all duration-75 shadow-[0_0_50px_rgba(31,184,205,0.2)]"
        style={{ width: 256, height: 256, transform: `scale(${breathScale})` }}
      >
        <div className="w-full h-full bg-neuro-500/10 rounded-full backdrop-blur-sm flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md mb-1">
            {breathPhase}
          </span>
          <span className="text-4xl font-mono font-bold text-neuro-300 drop-shadow-sm">
            {phaseTimeLeft}
          </span>
        </div>
      </div>

      {/* Mantra card — shown during Exhale when mantra is active */}
      {has('mantra') && mantra && (
        <div className="mt-10 max-w-md w-full bg-black/40 backdrop-blur-md border border-neuro-500/20 p-6 rounded-2xl flex flex-col items-center text-center shadow-2xl mx-4">
          <div className="flex items-center gap-2 text-neuro-500 text-xs uppercase font-bold mb-3 tracking-widest">
            <Mic2 className="w-4 h-4" /> Vocalization Guide
          </div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neuro-200 to-neuro-400 mb-2">
            {mantra.phonetic}
          </h2>
          <div className="w-full h-px bg-neuro-800 my-3" />
          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <div className="bg-neuro-900/50 p-3 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pronunciation</div>
              <div className="text-sm text-neuro-300 font-mono">{mantra.pronunciation || mantra.phonetic}</div>
            </div>
            <div className="bg-neuro-900/50 p-3 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tonality</div>
              <div className="text-sm text-neuro-300 italic">{mantra.tonality || 'Natural Voice'}</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4 italic">"{mantra.meaning}"</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {breathMantraOverlay}
      {geometryCard}
    </>
  );
};
