/**
 * Plan Overview Component
 *
 * Displays protocol plan details, progress, and current status
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Target,
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import type { ProtocolPlan } from '../types/plan';
import { getSessionsByPlan, updatePlanStatus, deletePlan } from '../services/PlanDatabase';
import type { SessionRecord } from '../types/plan';

interface PlanOverviewProps {
  plan: ProtocolPlan;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const PlanOverview: React.FC<PlanOverviewProps> = ({
  plan,
  onUpdate,
  onDelete,
}) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [adherence, setAdherence] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate stats
  useEffect(() => {
    if (!plan._id) return;

    getSessionsByPlan(plan._id).then((sessionRecords) => {
      setSessions(sessionRecords);

      // Calculate adherence
      const completed = sessionRecords.filter((s) => s.status === 'completed').length;
      const total = sessionRecords.length;
      setAdherence(total > 0 ? Math.round((completed / total) * 100) : 0);

      // Determine current phase based on sessions
      const today = new Date();
      const startDate = plan.schedule.start_date
        ? new Date(plan.schedule.start_date)
        : new Date(plan._imported_at || Date.now());

      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let phase = 1;
      for (const p of plan.schedule.phases) {
        if (daysSinceStart >= p.start_day - 1) {
          phase = p.phase_number;
        }
      }
      setCurrentPhase(phase);
    });
  }, [plan]);

  /**
   * Handle pause/resume
   */
  const handleTogglePause = async () => {
    if (!plan._id) return;

    const newStatus = plan._status === 'paused' ? 'active' : 'paused';
    await updatePlanStatus(plan._id, newStatus);
    onUpdate?.();
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!plan._id) return;

    await deletePlan(plan._id);
    onDelete?.();
  };

  return (
    <div className="w-full">
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neuro-500/20 to-blue-500/20 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">
                {plan.plan.title}
              </h2>
              <p className="text-sm text-gray-400">{plan.plan.description}</p>
            </div>

            {/* Status Badge */}
            <div
              className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${
                plan._status === 'active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : plan._status === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : plan._status === 'completed'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }
            `}
            >
              {plan._status || 'active'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Practitioner Info */}
          <div className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg">
            <User className="w-5 h-5 text-neuro-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {plan.meta.practitioner.name}
              </p>
              {plan.meta.practitioner.credentials && (
                <p className="text-xs text-gray-400">
                  {plan.meta.practitioner.credentials}
                </p>
              )}
              {plan.meta.practitioner.organization && (
                <p className="text-xs text-gray-400">
                  {plan.meta.practitioner.organization}
                </p>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-neuro-400" />
              <h3 className="text-sm font-medium text-white">Goals</h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-gray-900/30 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Primary Goal</p>
                <p className="text-sm text-gray-300">{plan.plan.primary_goal}</p>
              </div>
              {plan.plan.secondary_goals && plan.plan.secondary_goals.length > 0 && (
                <div className="p-3 bg-gray-900/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Secondary Goals</p>
                  <ul className="space-y-1">
                    {plan.plan.secondary_goals.map((goal, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-neuro-500 mr-2">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <p className="text-2xl font-semibold text-white">
                {plan.plan.duration_weeks}
                <span className="text-sm text-gray-400 ml-1">weeks</span>
              </p>
            </div>

            {/* Current Phase */}
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">Current Phase</p>
              </div>
              <p className="text-2xl font-semibold text-white">
                {currentPhase}
                <span className="text-sm text-gray-400 ml-1">
                  of {plan.schedule.phases.length}
                </span>
              </p>
              {plan.schedule.phases[currentPhase - 1] && (
                <p className="text-xs text-gray-400 mt-1">
                  {plan.schedule.phases[currentPhase - 1].title}
                </p>
              )}
            </div>

            {/* Adherence */}
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">Adherence</p>
              </div>
              <p className="text-2xl font-semibold text-white">
                {adherence}
                <span className="text-sm text-gray-400 ml-1">%</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {sessions.filter((s) => s.status === 'completed').length} of{' '}
                {sessions.length} sessions
              </p>
            </div>
          </div>

          {/* Tamper Warning */}
          {plan._tampered && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    Security Warning
                  </h4>
                  <p className="text-xs text-red-300">
                    This plan has been tampered with. Use with caution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleTogglePause}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {plan._status === 'paused' ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume Plan</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Plan</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Protocol Plan?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This will permanently delete the plan and all associated session data,
              metrics, and check-ins. This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
