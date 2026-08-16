/**
 * Disclaimer Modal Component
 *
 * Shows legal disclaimer on first plan import
 * Only displayed once (localStorage flag)
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerModalProps {
  onClose: () => void;
}

const DISCLAIMER_KEY = 'synsync_plan_disclaimer_shown';

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if disclaimer has been shown before
    const shown = localStorage.getItem(DISCLAIMER_KEY);
    if (!shown) {
      setIsOpen(true);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-yellow-500/10 border-b border-yellow-500/30">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">
              Important Disclaimer
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p className="font-medium text-white">
              Protocol Plans Are Not Medical Prescriptions
            </p>

            <p>
              SynSync Pro allows practitioners to create and share "Protocol Plans" —
              structured recommendations for using brainwave entrainment protocols.
              These plans are <strong className="text-white">not medical prescriptions</strong>{' '}
              and do not constitute medical advice, diagnosis, or treatment.
            </p>

            <div className="p-4 bg-gray-800/50 rounded-lg space-y-2">
              <p className="font-medium text-white">What This Means:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Plans are wellness recommendations, not medical directives</li>
                <li>You are free to modify, pause, or stop any plan at any time</li>
                <li>No practitioner-patient relationship is created by using plans</li>
                <li>Plans do not replace professional medical care</li>
              </ul>
            </div>

            <p className="font-medium text-white">Your Responsibility:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Consult your healthcare provider before starting any new wellness program
              </li>
              <li>
                Do not use brainwave entrainment if you have epilepsy, seizure disorders,
                or photosensitive conditions without medical clearance
              </li>
              <li>
                Stop immediately if you experience adverse effects (headaches, dizziness,
                disorientation)
              </li>
              <li>
                Never use Protocol Plans as a substitute for prescribed medical treatment
              </li>
            </ul>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="font-medium text-red-400 mb-2">Security Warning:</p>
              <p>
                Only import plans from practitioners you trust. Plans contain scheduling
                and tracking instructions that will be executed by the app. Verify the
                practitioner's identity before importing any plan.
              </p>
            </div>

            <p className="font-medium text-white">Data Privacy:</p>
            <p>
              All Protocol Plan data is stored locally on your device. No data is sent
              to servers. You have full control over your data and can export or delete
              it at any time.
            </p>

            <div className="pt-4 border-t border-gray-700 text-xs text-gray-400">
              <p>
                By clicking "I Understand", you acknowledge that you have read and
                understood this disclaimer, and that you are using Protocol Plans at
                your own discretion and risk.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
          <button
            onClick={handleAccept}
            className="w-full px-6 py-3 bg-neuro-500 hover:bg-neuro-600 text-white font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Check if disclaimer has been shown
 */
export function hasShownDisclaimer(): boolean {
  return localStorage.getItem(DISCLAIMER_KEY) === 'true';
}

/**
 * Reset disclaimer (for testing)
 */
export function resetDisclaimer(): void {
  localStorage.removeItem(DISCLAIMER_KEY);
}
