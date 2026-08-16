/**
 * Plan Calendar Component
 *
 * Month view calendar with session indicators
 * Color-coded by plan, shows completed/missed/upcoming sessions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  XCircle,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';
import type { SessionRecord } from '../types/plan';
import { getSessionsInRange } from '../services/PlanScheduler';

interface PlanCalendarProps {
  planId: string;
  timezone: string;
  onSelectDay: (date: Date, sessions: SessionRecord[]) => void;
}

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: SessionRecord[];
  completedCount: number;
  missedCount: number;
  pendingCount: number;
}

export const PlanCalendar: React.FC<PlanCalendarProps> = ({
  planId,
  timezone,
  onSelectDay,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Load sessions for current month
   */
  const loadSessions = useCallback(async () => {
    setLoading(true);

    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Get calendar view bounds (includes prev/next month days)
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      // Load all sessions in range
      const sessions = await getSessionsInRange(
        planId,
        calendarStart,
        calendarEnd,
        timezone
      );

      // Build day info array
      const dayInfos: DayInfo[] = [];
      let day = calendarStart;

      while (day <= calendarEnd) {
        const daySessions = sessions.filter((s) => {
          const sessionDate = new Date(s.scheduled_time);
          return isSameDay(sessionDate, day);
        });

        const completedCount = daySessions.filter(
          (s) => s.status === 'completed'
        ).length;
        const missedCount = daySessions.filter(
          (s) => s.status === 'missed'
        ).length;
        const pendingCount = daySessions.filter(
          (s) => s.status === 'pending'
        ).length;

        dayInfos.push({
          date: new Date(day),
          isCurrentMonth: isSameMonth(day, currentMonth),
          isToday: isSameDay(day, new Date()),
          sessions: daySessions,
          completedCount,
          missedCount,
          pendingCount,
        });

        day = addDays(day, 1);
      }

      setDays(dayInfos);
    } catch (err) {
      console.error('Failed to load calendar sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [planId, currentMonth, timezone]);

  // Load sessions when month changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * Handle day click
   */
  const handleDayClick = useCallback(
    (dayInfo: DayInfo) => {
      setSelectedDate(dayInfo.date);
      onSelectDay(dayInfo.date, dayInfo.sessions);
    },
    [onSelectDay]
  );

  /**
   * Navigate to previous month
   */
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate(null);
  }, []);

  /**
   * Navigate to next month
   */
  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate(null);
  }, []);

  /**
   * Go to today
   */
  const handleToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-neuro-400" />
          <h3 className="text-lg font-semibold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Today
          </button>

          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-neuro-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Calendar days */}
        {!loading && (
          <div className="grid grid-cols-7 gap-2">
            {days.map((dayInfo, idx) => (
              <button
                key={idx}
                onClick={() => handleDayClick(dayInfo)}
                className={`
                  relative aspect-square p-2 rounded-lg transition-all
                  ${
                    !dayInfo.isCurrentMonth
                      ? 'text-gray-600'
                      : dayInfo.isToday
                      ? 'bg-neuro-500/20 border-2 border-neuro-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }
                  ${
                    selectedDate && isSameDay(selectedDate, dayInfo.date)
                      ? 'ring-2 ring-neuro-400'
                      : ''
                  }
                `}
              >
                {/* Day number */}
                <span className="text-sm font-medium">
                  {format(dayInfo.date, 'd')}
                </span>

                {/* Session indicators */}
                {dayInfo.sessions.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center space-x-0.5">
                    {/* Completed */}
                    {dayInfo.completedCount > 0 && (
                      <div className="flex items-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                        {dayInfo.completedCount > 1 && (
                          <span className="text-[8px] text-green-400 ml-0.5">
                            {dayInfo.completedCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Missed */}
                    {dayInfo.missedCount > 0 && (
                      <div className="flex items-center">
                        <XCircle className="w-2.5 h-2.5 text-red-400" />
                        {dayInfo.missedCount > 1 && (
                          <span className="text-[8px] text-red-400 ml-0.5">
                            {dayInfo.missedCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pending */}
                    {dayInfo.pendingCount > 0 && (
                      <div className="flex items-center">
                        <Circle className="w-2.5 h-2.5 text-blue-400" />
                        {dayInfo.pendingCount > 1 && (
                          <span className="text-[8px] text-blue-400 ml-0.5">
                            {dayInfo.pendingCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>Completed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <XCircle className="w-4 h-4 text-red-400" />
          <span>Missed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Circle className="w-4 h-4 text-blue-400" />
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
};
