/**
 * Plan Consent Screen Component
 *
 * Displays consent form and contraindications before user accepts a protocol plan
 * Records signature timestamp and user agent for audit trail
 */

import React, { useState, useCallback } from 'react';
import { AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import type { ProtocolPlan } from '../types/plan';
import { logAudit } from '../services/PlanDatabase';

interface PlanConsentScreenProps {
  plan: ProtocolPlan;
  onAccept: () => void;
  onDecline: () => void;
}

export const PlanConsentScreen: React.FC<PlanConsentScreenProps> = ({
  plan,
  onAccept,
  onDecline,
}) => {
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());
  const [allAcknowledged, setAllAcknowledged] = useState(false);

  /**
   * Handle individual acknowledgment checkbox
   */
  const handleAcknowledgment = useCallback(
    (index: number, checked: boolean) => {
      const newAcknowledged = new Set(acknowledged);

      if (checked) {
        newAcknowledged.add(index);
      } else {
        newAcknowledged.delete(index);
      }

      setAcknowledged(newAcknowledged);
      setAllAcknowledged(
        newAcknowledged.size === plan.consent.acknowledgments.length
      );
    },
    [acknowledged, plan.consent.acknowledgments.length]
  );

  /**
   * Handle accept button
   */
  const handleAccept = useCallback(async () => {
    // Log consent acceptance
    await logAudit('plan_consent_accepted', {
      plan_id: plan._id,
      plan_title: plan.plan.title,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
    });

    onAccept();
  }, [plan, onAccept]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-neuro-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Consent & Information
              </h2>
              <p className="text-sm text-gray-400">
                Please review and acknowledge before continuing
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Practitioner Info */}
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">
              Practitioner Information
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Name:</span>{' '}
                {plan.meta.practitioner.name}
              </p>
              {plan.meta.practitioner.credentials && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Credentials:</span>{' '}
                  {plan.meta.practitioner.credentials}
                </p>
              )}
              {plan.meta.practitioner.organization && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Organization:</span>{' '}
                  {plan.meta.practitioner.organization}
                </p>
              )}
              {plan.meta.practitioner.contact_email && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Contact:</span>{' '}
                  {plan.meta.practitioner.contact_email}
                </p>
              )}
            </div>
          </div>

          {/* Plan Overview */}
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Plan Overview</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Title:</span> {plan.plan.title}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Duration:</span>{' '}
                {plan.plan.duration_weeks} weeks
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Primary Goal:</span>{' '}
                {plan.plan.primary_goal}
              </p>
            </div>
          </div>

          {/* Contraindications */}
          {plan.plan.contraindications && plan.plan.contraindications.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-400 mb-2">
                    Contraindications
                  </h3>
                  <ul className="space-y-1 text-sm text-red-300 list-disc list-inside">
                    {plan.plan.contraindications.map((contraindication, idx) => (
                      <li key={idx}>{contraindication}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {plan.plan.safety_notes && plan.plan.safety_notes.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-400 mb-2">
                    Safety Notes
                  </h3>
                  <ul className="space-y-1 text-sm text-yellow-300 list-disc list-inside">
                    {plan.plan.safety_notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Consent Text */}
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-3">
              Consent Agreement
            </h3>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {plan.consent.text}
            </div>
          </div>

          {/* Acknowledgments */}
          {plan.consent.acknowledgments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">
                Please acknowledge the following:
              </h3>
              {plan.consent.acknowledgments.map((acknowledgment, idx) => (
                <label
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-gray-900/30 rounded-lg cursor-pointer hover:bg-gray-900/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={acknowledged.has(idx)}
                    onChange={(e) => handleAcknowledgment(idx, e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300 flex-1">
                    {acknowledgment}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-xs text-gray-400 leading-relaxed">
            <p className="font-medium text-gray-300 mb-2">Important Notice:</p>
            <p>
              This protocol plan is not a medical prescription and does not constitute
              medical advice. SynSync Pro is a wellness tool for brainwave entrainment
              and should not replace professional medical treatment. If you have any
              medical conditions, consult your healthcare provider before beginning any
              new wellness program. By accepting this plan, you acknowledge that you are
              using this software at your own discretion and risk.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={onDecline}
              className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Decline
            </button>

            <button
              onClick={handleAccept}
              disabled={!allAcknowledged}
              className={`
                px-8 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  allAcknowledged
                    ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {allAcknowledged ? (
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Plan</span>
                </span>
              ) : (
                'Accept Plan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
