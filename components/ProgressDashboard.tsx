// src/components/ProgressDashboard.tsx
// Privacy-first progress tracking - all data stays local

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, Zap, Clock, Target, ChevronRight } from 'lucide-react';
import { LocalStorageManager } from '../src/utils/local-storage-manager';
import type { ProgressData, SessionRecord } from '../src/utils/local-storage-manager';

interface ProgressDashboardProps {
  onProtocolClick?: (protocolId: string) => void;
}

/**
 * Progress tracking dashboard
 * Shows stats, streaks, protocol performance
 * All data stored locally - privacy-first
 */
export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onProtocolClick }) => {
  const [progress, setProgress] = useState<ProgressData>(LocalStorageManager.getProgressData());
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    // Refresh data
    setProgress(LocalStorageManager.getProgressData());
    setRecentSessions(LocalStorageManager.getSessionHistory(10));
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getWeeklyTarget = () => progress.weeklyGoal || 5;
  const weeklyCompletion = Math.min((progress.weeklyProgress / getWeeklyTarget()) * 100, 100);

  // Get top protocols by usage
  const topProtocols = Object.entries(progress.protocolStats)
    .sort(([, a], [, b]) => b.sessions - a.sessions)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Progress</h2>
        <p className="text-sm text-gray-400">
          All data stored privately on your device • Never shared
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-neuro-800/50 to-neuro-800/30 border border-neuro-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-neuro-500/20">
              <Zap className="w-5 h-5 text-neuro-400" />
            </div>
            <span className="text-xs text-gray-500">All Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{progress.totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">Total Sessions</p>
        </div>

        {/* Total Time */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-800/50 to-purple-800/30 border border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-500">All Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatDuration(progress.totalDuration)}</p>
          <p className="text-xs text-gray-400 mt-1">Total Time</p>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-800/50 to-orange-800/30 border border-orange-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-gray-500">Current</span>
          </div>
          <p className="text-3xl font-bold text-white">{progress.currentStreak}</p>
          <p className="text-xs text-gray-400 mt-1">Day Streak 🔥</p>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-800/50 to-green-800/30 border border-green-700">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-gray-500">Best</span>
          </div>
          <p className="text-3xl font-bold text-white">{progress.longestStreak}</p>
          <p className="text-xs text-gray-400 mt-1">Best Streak 🏆</p>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="p-6 rounded-lg bg-neuro-900/40 border border-neuro-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neuro-500/20">
              <Target className="w-5 h-5 text-neuro-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">This Week's Goal</h3>
              <p className="text-sm text-gray-400">{progress.weeklyProgress} / {getWeeklyTarget()} sessions</p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${
            weeklyCompletion >= 100 ? 'text-green-400' :
            weeklyCompletion >= 70 ? 'text-yellow-400' :
            'text-gray-400'
          }`}>
            {Math.round(weeklyCompletion)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-neuro-950 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              weeklyCompletion >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              weeklyCompletion >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
              'bg-gradient-to-r from-neuro-500 to-purple-500'
            }`}
            style={{ width: `${weeklyCompletion}%` }}
          />
        </div>

        {weeklyCompletion >= 100 && (
          <p className="text-sm text-green-400 mt-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Goal achieved! Keep it up! 🎉
          </p>
        )}
      </div>

      {/* Top Protocols */}
      {topProtocols.length > 0 && (
        <div className="p-6 rounded-lg bg-neuro-900/40 border border-neuro-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neuro-400" />
            Most Used Protocols
          </h3>
          <div className="space-y-3">
            {topProtocols.map(([protocolId, stats]) => {
              const avgRating = stats.averageRating || 0;
              const completionRate = Math.round(stats.completionRate * 100);

              return (
                <div
                  key={protocolId}
                  className="p-4 rounded-lg bg-neuro-800/30 border border-neuro-700 hover:border-neuro-600 transition-all cursor-pointer group"
                  onClick={() => onProtocolClick?.(protocolId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-neuro-400 transition-colors">
                        {protocolId.replace(/_/g, ' ').replace(/v\d+/g, '').trim()}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{stats.sessions} sessions</span>
                        <span>•</span>
                        <span>{formatDuration(stats.totalDuration)}</span>
                        <span>•</span>
                        <span>{completionRate}% completed</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-neuro-400 transition-colors" />
                  </div>

                  {/* Rating Stars */}
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={star <= avgRating ? 'text-yellow-400' : 'text-gray-700'}>
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({avgRating.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="p-6 rounded-lg bg-neuro-900/40 border border-neuro-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neuro-400" />
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {recentSessions.slice(0, 5).map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-neuro-800/30 border border-neuro-700"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{session.protocolTitle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(session.startTime).toLocaleDateString()} • {formatDuration(session.duration)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {session.completed ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                      Incomplete
                    </span>
                  )}
                  {session.rating && (
                    <span className="text-yellow-400 text-sm">
                      {'★'.repeat(session.rating)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {progress.totalSessions === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neuro-800/50 mb-4">
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-lg text-gray-400 mb-2">No sessions yet</p>
          <p className="text-sm text-gray-500">
            Start a protocol to begin tracking your progress
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-xs text-blue-300 leading-relaxed">
          🔒 <strong>Privacy First:</strong> All your progress data is stored locally on your device.
          It's never sent to our servers or shared with anyone. You can export or delete it anytime.
        </p>
      </div>
    </div>
  );
};
