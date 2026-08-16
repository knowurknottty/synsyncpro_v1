/**
 * Upcoming Sessions Widget
 *
 * Displays next 5 upcoming sessions with countdown timers and quick launch
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { SessionRecord } from '../types/plan';
import { getUpcomingSessions } from '../services/PlanScheduler';
import { PROTOCOLS } from '../audio/constants';

interface UpcomingSessionsProps {
  planId: string;
  timezone: string;
  limit?: number;
  onStartSession: (session: SessionRecord) => void;
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  planId,
  timezone,
  limit = 5,
  onStartSession,
}) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  /**
   * Load upcoming sessions
   */
  const loadSessions = useCallback(async () => {
    setLoading(true);

    try {
      const upcoming = await getUpcomingSessions(planId, limit);
      setSessions(upcoming);
    } catch (err) {
      console.error('Failed to load upcoming sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [planId, limit]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Update current time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  /**
   * Check if session is starting soon (within 15 minutes)
   */
  const isStartingSoon = (session: SessionRecord): boolean => {
    const diff = session.scheduled_time - currentTime;
    return diff > 0 && diff <= 15 * 60 * 1000;
  };

  /**
   * Check if session can be started (within 30 minute window)
   */
  const canStart = (session: SessionRecord): boolean => {
    const diff = Math.abs(session.scheduled_time - currentTime);
    return diff <= 30 * 60 * 1000;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-neuro-400" />
          <h3 className="text-lg font-semibold text-white">Upcoming Sessions</h3>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={loadSessions}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-4 border-neuro-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-800/30 rounded-xl">
          <Calendar className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">No upcoming sessions scheduled</p>
        </div>
      )}

      {/* Sessions List */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const protocol = PROTOCOLS[session.protocol_id];
            const sessionTime = toZonedTime(
              new Date(session.scheduled_time),
              timezone
            );
            const startingSoon = isStartingSoon(session);
            const canStartNow = canStart(session);

            return (
              <div
                key={session.id}
                className={`
                  p-4 rounded-xl border transition-all
                  ${
                    startingSoon
                      ? 'bg-neuro-500/10 border-neuro-500/30 ring-2 ring-neuro-500/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  {/* Session Info */}
                  <div className="flex-1">
                    {/* Index badge */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${
                          index === 0
                            ? 'bg-neuro-500/20 text-neuro-400'
                            : 'bg-gray-700 text-gray-400'
                        }
                      `}
                      >
                        {index === 0 ? 'Next' : `#${index + 1}`}
                      </span>

                      {startingSoon && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium animate-pulse">
                          Starting Soon
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1">
                      {protocol?.title || session.protocol_id}
                    </h4>

                    {/* Time info */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {formatDistanceToNow(sessionTime, { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span>
                        {sessionTime.toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Duration */}
                    {protocol && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(protocol.duration / 60)} min session
                      </div>
                    )}
                  </div>

                  {/* Quick Launch Button */}
                  <button
                    onClick={() => onStartSession(session)}
                    disabled={!canStartNow}
                    className={`
                      p-2 rounded-lg transition-all
                      ${
                        canStartNow
                          ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }
                    `}
                    title={
                      canStartNow ? 'Start session' : 'Session not in time window yet'
                    }
                  >
                    <Play className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar for next session */}
                {index === 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Time until session</span>
                      <span>
                        {Math.max(
                          0,
                          Math.floor(
                            (session.scheduled_time - currentTime) / (1000 * 60)
                          )
                        )}{' '}
                        min
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`
                          h-full transition-all duration-1000
                          ${
                            startingSoon
                              ? 'bg-gradient-to-r from-neuro-400 to-neuro-500'
                              : 'bg-gray-600'
                          }
                        `}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              ((60 * 60 * 1000 -
                                (session.scheduled_time - currentTime)) /
                                (60 * 60 * 1000)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show More Link */}
      {!loading && sessions.length >= limit && (
        <button className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          View All Sessions →
        </button>
      )}
    </div>
  );
};
