import React, { useMemo, useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  Activity,
  PhoneCall,
  Info,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Protocol } from '../types.ts';
import { classifyProtocolSafety, ProtocolSafetyProfile } from '../services/ProtocolSafety.ts';

/**
 * Check if safety clearance is still valid (not expired)
 */
export function isSafetyClearanceValid(): boolean {
  try {
    const stored = localStorage.getItem('synsync_safety_cleared');
    if (!stored) return false;

    const { cleared, expiry } = JSON.parse(stored);
    if (!cleared || !expiry) return false;

    const expiryDate = new Date(expiry);
    const now = new Date();

    return now < expiryDate;
  } catch {
    return false;
  }
}

export interface SafetyGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearance: () => void;
  protocol: Protocol | null;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Medical', 'Safety', 'Consent'] as const;

interface StepBarProps {
  current: 1 | 2 | 3;
}
const StepBar: React.FC<StepBarProps> = ({ current }) => (
  <div className="flex items-center gap-1 px-6 py-3 border-b border-neuro-700/50 bg-neuro-900/40">
    {STEPS.map((label, i) => {
      const idx = (i + 1) as 1 | 2 | 3;
      const done = idx < current;
      const active = idx === current;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                done    ? 'bg-neuro-500 text-black' :
                active  ? 'bg-neuro-700 border-2 border-neuro-500 text-white' :
                          'bg-neuro-800 border border-neuro-700 text-gray-600'
              }`}
            >
              {done ? '✓' : idx}
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:block ${
              active ? 'text-white' : done ? 'text-neuro-500' : 'text-gray-600'
            }`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-1 ${idx < current ? 'bg-neuro-500' : 'bg-neuro-700'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * SafetyGateModal — 3-step wizard
 *
 * Step 1 — Medical: seizure/epilepsy history (hard gate)
 * Step 2 — Safety:  photosensitivity + audio level acknowledgments
 * Step 3 — Consent: crisis resources + informed consent
 */
export const SafetyGateModal: React.FC<SafetyGateModalProps> = ({
  isOpen,
  onClose,
  onClearance,
  protocol,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hasSeizureHistory, setHasSeizureHistory] = useState<boolean | null>(null);
  const [ackPhotosensitive, setAckPhotosensitive] = useState(false);
  const [ackAudio, setAckAudio] = useState(false);
  const [ackEmergency, setAckEmergency] = useState(false);
  const [ackUnderstand, setAckUnderstand] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const safetyProfile: ProtocolSafetyProfile | null = useMemo(() => {
    if (!protocol) return null;
    return classifyProtocolSafety(protocol);
  }, [protocol]);

  if (!isOpen) return null;

  const has3to30Hz        = !!safetyProfile?.has3to30Hz;
  const hasHighRisk10to25 = !!safetyProfile?.has10to25Hz;
  const hasGamma40Hz      = !!safetyProfile?.gamma40Hz;
  const hasSevereContra   = safetyProfile?.contraindicationsSeverity === 'severe';
  const contraindicationList = safetyProfile?.contraindications ?? [];

  const hardBlockForSeizure =
    !!protocol &&
    hasSeizureHistory === true &&
    (hasSevereContra || contraindicationList.some(c => /epilepsy|seizure/i.test(c)));

  // Step-specific gating
  const step1CanAdvance  = hasSeizureHistory === false;
  const step2CanAdvance  = ackPhotosensitive && ackAudio;
  const step3CanProceed  = ackEmergency && ackUnderstand;
  const canProceed       = step1CanAdvance && step2CanAdvance && step3CanProceed;

  const handleProceed = () => {
    if (!canProceed) return;

    // Save clearance to localStorage if "remember me" is checked
    if (rememberMe) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
      localStorage.setItem('synsync_safety_cleared', JSON.stringify({
        cleared: true,
        expiry: expiryDate.toISOString()
      }));
    }

    onClearance();
  };

  // Reset state on close
  const handleClose = () => {
    setStep(1);
    setHasSeizureHistory(null);
    setAckPhotosensitive(false);
    setAckAudio(false);
    setAckEmergency(false);
    setAckUnderstand(false);
    onClose();
  };

  const protocolName = protocol?.title || 'Selected protocol';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-neuro-700 flex justify-between items-start bg-neuro-800/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0" />
              Safety Screening
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Required before starting&nbsp;
              <span className="text-neuro-100 font-medium">{protocolName}</span>
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors ml-3 shrink-0">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <StepBar current={step} />

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

          {/* ── Step 1: Medical ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" />
                Seizure &amp; epilepsy history
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                If you or an immediate family member has a history of seizures or epilepsy, certain high-intensity protocols may not be appropriate. Please answer honestly.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setHasSeizureHistory(false)}
                  className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    hasSeizureHistory === false
                      ? 'bg-green-500/10 border-green-500 text-green-300'
                      : 'bg-black/20 border-neuro-700 text-gray-400 hover:border-neuro-600'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  No seizure history
                </button>
                <button
                  type="button"
                  onClick={() => setHasSeizureHistory(true)}
                  className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    hasSeizureHistory === true
                      ? 'bg-red-500/10 border-red-500 text-red-300'
                      : 'bg-black/20 border-neuro-700 text-gray-400 hover:border-neuro-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  I have seizure history
                </button>
              </div>

              {hasSeizureHistory === null && (
                <p className="text-[10px] text-gray-600 text-center font-mono">Select one option above to continue</p>
              )}

              {hardBlockForSeizure && (
                <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 text-xs text-red-100 space-y-1">
                  <p className="font-semibold">This protocol is not safe to proceed with a seizure history.</p>
                  <p>It is flagged with <strong>severe contraindications</strong> for neurological instability. Do not use without clearance from a licensed clinician.</p>
                </div>
              )}

              {hasSeizureHistory === true && !hardBlockForSeizure && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 text-xs text-yellow-100">
                  <p className="font-semibold mb-1">Caution required.</p>
                  <p>Discuss brainwave entrainment with your neurologist before use. Stop immediately if you feel unwell.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Safety ──────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Photosensitivity */}
              <div>
                <div className="flex items-center gap-2 text-yellow-300 font-semibold text-xs uppercase tracking-widest mb-3">
                  <Activity className="w-4 h-4" />
                  Photosensitivity &amp; entrainment rate
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  People with photosensitive epilepsy are most likely to have seizures triggered by flickering stimuli between 3–30 Hz, with highest risk around 10–25 Hz.
                </p>

                {has3to30Hz && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs mb-3">
                    <p className="font-semibold text-yellow-200 mb-1">This protocol uses frequencies in the 3–30 Hz caution range.</p>
                    {hasHighRisk10to25 && (
                      <p className="text-yellow-100">One or more phases fall in the 10–25 Hz band — especially associated with photosensitive risk.</p>
                    )}
                    {!hasHighRisk10to25 && (
                      <p className="text-yellow-100">Use extra caution if visually sensitive or have seizure history.</p>
                    )}
                  </div>
                )}

                {hasGamma40Hz && (
                  <div className="bg-purple-500/10 border border-purple-500/40 rounded-lg p-3 text-xs text-purple-100 mb-3">
                    <p className="font-semibold mb-1">40 Hz gamma stimulation present.</p>
                    <p>Rapid 40 Hz stimulation coupled with visual flicker may increase photosensitive risk.</p>
                  </div>
                )}

                {contraindicationList.length > 0 && (
                  <div className="bg-neuro-800/50 border border-neuro-700 rounded-lg p-3 text-xs mb-3">
                    <p className="font-semibold text-neuro-400 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Specific contraindications:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                      {contraindicationList.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackPhotosensitive}
                    onChange={e => setAckPhotosensitive(e.target.checked)}
                    className="mt-0.5 accent-neuro-500 shrink-0"
                  />
                  <span className="text-gray-300 leading-relaxed">
                    I do <strong>not</strong> have diagnosed photosensitive epilepsy, I understand the 3–30 Hz caution range, and I will stop immediately if I experience visual discomfort or pre-seizure sensations.
                  </span>
                </label>
              </div>

              <div className="border-t border-neuro-700/40 pt-5">
                {/* Audio safety */}
                <div className="flex items-center gap-2 text-neuro-400 font-semibold text-xs uppercase tracking-widest mb-3">
                  <Volume2 className="w-4 h-4" />
                  Audio level safety
                </div>
                <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1 mb-3 leading-relaxed">
                  <li>Keep volume at the lowest comfortable level.</li>
                  <li>Avoid stacking multiple loud sessions back-to-back.</li>
                  <li>Stop if you notice ringing, muffled hearing, or discomfort.</li>
                </ul>
                <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackAudio}
                    onChange={e => setAckAudio(e.target.checked)}
                    className="mt-0.5 accent-neuro-500 shrink-0"
                  />
                  <span className="text-gray-300 leading-relaxed">
                    I will run this session at a comfortable listening level and stop if I notice any auditory discomfort.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ── Step 3: Consent ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Crisis resources */}
              <div>
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs uppercase tracking-widest mb-3">
                  <PhoneCall className="w-4 h-4" />
                  Crisis &amp; emergency support
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  This software is not a crisis service. If you feel at risk or experience severe distress, contact emergency services immediately.
                </p>
                <div className="bg-black/30 border border-neuro-700 rounded-lg p-3 text-xs text-gray-200 mb-3 space-y-1">
                  <p className="font-semibold text-gray-100 mb-1">U.S. 24/7 crisis lines:</p>
                  <p>Dial <strong>988</strong> — Suicide &amp; Crisis Lifeline</p>
                  <p>Text <strong>HOME</strong> to <strong>741741</strong> — Crisis Text Line</p>
                  <p>SAMHSA: <strong>1-800-662-4357</strong></p>
                </div>
                <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackEmergency}
                    onChange={e => setAckEmergency(e.target.checked)}
                    className="mt-0.5 accent-neuro-500 shrink-0"
                  />
                  <span className="text-gray-300 leading-relaxed">
                    I understand this is not a crisis intervention tool and I will contact appropriate services if I experience acute distress.
                  </span>
                </label>
              </div>

              <div className="border-t border-neuro-700/40 pt-5">
                {/* Informed consent */}
                <div className="flex items-center gap-2 text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">
                  <Info className="w-4 h-4" />
                  Informed experimental use
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  SynSync is an experimental neuroacoustic system — not a medical device and not cleared to diagnose, treat, or prevent any disease or disorder.
                </p>
                <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackUnderstand}
                    onChange={e => setAckUnderstand(e.target.checked)}
                    className="mt-0.5 accent-neuro-500 shrink-0"
                  />
                  <span className="text-gray-300 leading-relaxed">
                    I am using this voluntarily, understand the experimental nature of these protocols, and accept full responsibility.
                  </span>
                </label>
              </div>

              {/* Remember me checkbox */}
              <div className="border-t border-neuro-700/40 pt-5">
                <label className="flex items-start gap-2.5 text-xs cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="mt-0.5 accent-neuro-500 shrink-0"
                  />
                  <span className="text-neuro-400 group-hover:text-neuro-300 leading-relaxed transition-colors">
                    <strong>Remember my clearance for 30 days</strong>
                    <span className="block text-gray-500 text-[11px] mt-1">
                      Don't show this safety screening again for the next 30 days
                    </span>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t border-neuro-700 bg-neuro-900/80 flex items-center justify-between gap-3">
          {/* Back */}
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest border border-neuro-700 rounded-lg text-gray-400 hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            {step === 1 && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest border border-neuro-700 rounded-lg text-gray-500 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Step label */}
          <span className="text-[10px] font-mono text-gray-600 hidden sm:block">
            Step {step} of 3
          </span>

          {/* Next / Begin */}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              disabled={step === 1 ? !step1CanAdvance || hardBlockForSeizure : !step2CanAdvance}
              className={`px-5 py-2 text-[11px] font-mono uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-all ${
                (step === 1 ? step1CanAdvance && !hardBlockForSeizure : step2CanAdvance)
                  ? 'bg-neuro-700 text-white hover:bg-neuro-600'
                  : 'bg-neuro-800/40 text-gray-600 border border-neuro-700/40 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={`px-5 py-2 text-[11px] font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all ${
                canProceed
                  ? 'bg-neuro-500 text-black hover:bg-neuro-400 shadow-lg shadow-neuro-500/30'
                  : 'bg-neuro-700/40 text-gray-500 border border-neuro-700 cursor-not-allowed'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Begin Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
