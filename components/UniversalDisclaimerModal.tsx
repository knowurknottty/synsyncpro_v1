// src/components/UniversalDisclaimerModal.tsx
// First-time warning modal - sets expectations correctly

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface UniversalDisclaimerModalProps {
  onAccept: () => void;
}

/**
 * Universal disclaimer modal - shown once on first use
 * Sets correct expectations: this is experimental tech, not medical treatment
 */
export const UniversalDisclaimerModal: React.FC<UniversalDisclaimerModalProps> = ({ onAccept }) => {
  const [understood, setUnderstood] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem('synsync_disclaimer_accepted');
    if (!hasAccepted) {
      setShow(true);
    } else {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('synsync_disclaimer_accepted', 'true');
    setShow(false);
    onAccept();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neuro-900 border border-neuro-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neuro-900 border-b border-neuro-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Welcome to SynSync Pro
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Experimental Brainwave Entrainment Research Platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What This Is */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              What This Is
            </h3>
            <div className="pl-6 space-y-2 text-sm text-gray-300">
              <p>• Open-source platform for experimenting with brainwave entrainment</p>
              <p>• 100+ protocols based on neuroscience research</p>
              <p>• Evidence-graded: Established → Experimental → Exploratory</p>
              <p>• You control the parameters (frequency, amplitude, modulation)</p>
              <p>• Your feedback helps validate what actually works</p>
            </div>
          </div>

          {/* What This Is NOT */}
          <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h3 className="font-semibold text-red-300 flex items-center gap-2">
              <X className="w-4 h-4" />
              What This Is NOT
            </h3>
            <div className="pl-6 space-y-2 text-sm text-red-200">
              <p>• <strong>NOT</strong> FDA-approved medical treatment</p>
              <p>• <strong>NOT</strong> a replacement for healthcare</p>
              <p>• <strong>NOT</strong> guaranteed to work for you</p>
              <p>• <strong>NOT</strong> suitable for everyone (see contraindications)</p>
            </div>
          </div>

          {/* Evidence Transparency */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Evidence Transparency</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-lg">✓</span>
                <div>
                  <p className="text-sm font-semibold text-green-300">Established</p>
                  <p className="text-xs text-gray-400">Multiple peer-reviewed studies. Effects modest and variable.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-300">Experimental</p>
                  <p className="text-xs text-gray-400">Limited research, promising signals. Needs more validation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <span className="text-lg">🔬</span>
                <div>
                  <p className="text-sm font-semibold text-blue-300">Exploratory</p>
                  <p className="text-xs text-gray-400">Theoretical basis only. Human efficacy unknown.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Role */}
          <div className="space-y-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h3 className="font-semibold text-purple-300">Your Role: Co-Researcher</h3>
            <p className="text-sm text-gray-300">
              You're not just a user - you're a co-researcher. Track your results, share feedback,
              help us learn what actually works vs. what's theoretical. We don't know which protocols
              will work best for which people. Let's figure it out together.
            </p>
          </div>

          {/* Critical Safety */}
          <div className="space-y-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <h3 className="font-semibold text-orange-300">Critical Safety Information</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• <strong>Photosensitive Epilepsy:</strong> Some protocols contraindicated</p>
              <p>• <strong>Medical Conditions:</strong> Consult healthcare provider first</p>
              <p>• <strong>Volume Safety:</strong> Built-in safety monitoring prevents hearing damage</p>
              <p>• <strong>Mental Health:</strong> Some protocols require existing practice foundation</p>
              <p>• <strong>Stop if Adverse:</strong> Discontinue immediately if you experience distress</p>
            </div>
          </div>

          {/* Legal */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
              By using SynSync Pro, you acknowledge: (1) This is experimental technology, (2) Individual
              results vary significantly and unpredictably, (3) This is not medical treatment or advice,
              (4) You will consult healthcare providers for medical conditions, (5) Your anonymized usage
              data may contribute to research. This platform is for educational and experimental purposes.
              We make no guarantees about efficacy for any individual user.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-neuro-500 focus:ring-neuro-500"
            />
            <span className="text-sm text-gray-300">
              I understand this is experimental technology, not medical treatment. I will track my results
              and provide feedback to help validate what works. I have read and understand the safety information.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neuro-900 border-t border-neuro-700 p-6 flex gap-3 justify-end">
          <button
            onClick={handleAccept}
            disabled={!understood}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              understood
                ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            I Understand - Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
};
