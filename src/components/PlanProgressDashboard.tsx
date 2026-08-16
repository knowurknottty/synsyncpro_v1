/**
 * Plan Progress Dashboard Component
 *
 * Comprehensive progress view with adherence, streaks, and milestones
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import type { ProtocolPlan, SessionRecord } from '../types/plan';
import { getSessionsByPlan } from '../services/PlanDatabase';
import { calculateAdherence } from '../utils/AdherenceCalculator';
import { getMilestoneProgress, getAchievedMilestones } from '../services/MilestoneChecker';
import { getCheckInStatus } from '../services/CheckInManager';

interface PlanProgressDashboardProps {
  plan: ProtocolPlan;
}

export const PlanProgressDashboard: React.FC<PlanProgressDashboardProps> = ({
  plan,
}) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [adherence, setAdherence] = useState<any>(null);
  const [milestoneProgress, setMilestoneProgress] = useState<any>(null);
  const [achievedCount, setAchievedCount] = useState(0);
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState(1);

  useEffect(() => {
    loadProgress();
  }, [plan]);

  const loadProgress = async () => {
    if (!plan._id) return;

    const sessionRecords = await getSessionsByPlan(plan._id);
    setSessions(sessionRecords);

    const adherenceMetrics = calculateAdherence(sessionRecords);
    setAdherence(adherenceMetrics);

    const progress = await getMilestoneProgress(plan, sessionRecords);
    setMilestoneProgress(progress);

    const achieved = await getAchievedMilestones(plan._id);
    setAchievedCount(achieved.length);

    const checkIns = await getCheckInStatus(plan);
    setCheckInStatus(checkIns);

    // Calculate current phase
    const startDate = plan.schedule.start_date
      ? new Date(plan.schedule.start_date)
      : new Date(plan._imported_at || Date.now());

    const daysSinceStart = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let phase = 1;
    for (const p of plan.schedule.phases) {
      if (daysSinceStart >= p.start_day - 1) {
        phase = p.phase_number;
      }
    }
    setCurrentPhase(phase);
  };

  if (!adherence) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-neuro-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Progress Dashboard</h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Adherence */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-neuro-400" />
            <span className="text-sm text-gray-400">Overall Adherence</span>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            {adherence.overallRate}%
          </p>
          <p className="text-xs text-gray-500">
            {adherence.totalCompleted} of {adherence.totalScheduled} sessions
          </p>
        </div>

        {/* Current Streak */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Current Streak</span>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            {adherence.currentStreak}
          </p>
          <p className="text-xs text-gray-500">
            Longest: {adherence.longestStreak} days
          </p>
        </div>

        {/* Milestones */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Milestones</span>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{achievedCount}</p>
          <p className="text-xs text-gray-500">
            {plan.tracking?.milestones?.length || 0} total
          </p>
        </div>

        {/* Current Phase */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Current Phase</span>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{currentPhase}</p>
          <p className="text-xs text-gray-500">
            of {plan.schedule.phases.length} phases
          </p>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Adherence */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-4">Last 7 Days</h3>
          <div className="flex items-end justify-between h-32">
            <div className="flex-1 text-center">
              <div
                className="bg-neuro-500 rounded-t"
                style={{
                  height: `${adherence.weeklyRate}%`,
                  minHeight: '4px',
                }}
              />
              <p className="text-xs text-gray-500 mt-2">Week</p>
            </div>
            <div className="flex-1 text-center">
              <div
                className="bg-gray-600 rounded-t"
                style={{
                  height: `${adherence.monthlyRate}%`,
                  minHeight: '4px',
                }}
              />
              <p className="text-xs text-gray-500 mt-2">Month</p>
            </div>
            <div className="flex-1 text-center">
              <div
                className="bg-gray-700 rounded-t"
                style={{
                  height: `${adherence.overallRate}%`,
                  minHeight: '4px',
                }}
              />
              <p className="text-xs text-gray-500 mt-2">All Time</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-400">Adherence Rate</span>
            <span className="font-semibold text-neuro-400">
              {adherence.weeklyRate}%
            </span>
          </div>
        </div>

        {/* Next Milestone */}
        {milestoneProgress && (
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="text-sm font-medium text-white mb-4">
              Next Milestone
            </h3>
            <p className="text-lg font-semibold text-white mb-2">
              {milestoneProgress.milestone.title}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {milestoneProgress.remaining} remaining
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neuro-500 to-blue-500"
                  style={{ width: `${milestoneProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                {milestoneProgress.progress}% complete
              </p>
            </div>
          </div>
        )}

        {/* Check-Ins */}
        {checkInStatus && (
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="text-sm font-medium text-white mb-4">Check-Ins</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Completed</span>
                <span className="font-semibold text-green-400">
                  {checkInStatus.completed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Due Now</span>
                <span className="font-semibold text-yellow-400">
                  {checkInStatus.due}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Upcoming</span>
                <span className="font-semibold text-blue-400">
                  {checkInStatus.upcoming}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
