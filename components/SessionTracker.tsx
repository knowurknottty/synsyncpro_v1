// src/components/SessionTracker.tsx
// Track active protocol sessions - stores locally

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Star, AlertCircle, MessageSquare } from 'lucide-react';
import { LocalStorageManager } from '../src/utils/local-storage-manager';
import type { SessionRecord } from '../src/utils/local-storage-manager';

interface SessionTrackerProps {
  protocolId: string;
  protocolTitle: string;
  expectedDuration: number; // seconds
  onComplete?: (session: SessionRecord) => void;
}

/**
 * Session tracker for active protocol use
 * Tracks time, allows rating and notes
 * All data stored locally
 */
export const SessionTracker: React.FC<SessionTrackerProps> = ({
  protocolId,
  protocolTitle,
  expectedDuration,
  onComplete
}) => {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [notes, setNotes] = useState('');
  const [sideEffects, setSideEffects] = useState<string[]>([]);

  useEffect(() => {
    // Start session automatically
    const newSession = LocalStorageManager.startSession(protocolId, protocolTitle);
    setSession(newSession);
    setIsRunning(true);
  }, [protocolId, protocolTitle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = (completed: boolean) => {
    setIsRunning(false);

    if (completed && elapsed < expectedDuration * 0.8) {
      if (!confirm('You haven\'t finished the full protocol duration. Mark as completed anyway?')) {
        return;
      }
    }

    setShowRating(true);
  };

  const handleSubmitRating = () => {
    if (!session) return;

    // End session
    LocalStorageManager.endSession(session.id, true, notes || undefined);

    // Save rating if provided
    if (rating) {
      LocalStorageManager.rateSession(
        session.id,
        rating,
        sideEffects.length > 0 ? sideEffects : undefined
      );
    }

    // Call completion callback
    const updatedSession: SessionRecord = {
      ...session,
      endTime: new Date().toISOString(),
      duration: elapsed,
      completed: true,
      rating: rating || undefined,
      notes: notes || undefined,
      sideEffects: sideEffects.length > 0 ? sideEffects : undefined
    };

    onComplete?.(updatedSession);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / expectedDuration) * 100, 100);
  const isOvertime = elapsed > expectedDuration;

  const commonSideEffects = [
    'Headache',
    'Dizziness',
    'Anxiety',
    'Restlessness',
    'Nausea',
    'Eye strain'
  ];

  // Rating view
  if (showRating) {
    return (
      <div className="p-6 rounded-lg bg-neuro-900 border border-neuro-700 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <Star className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Session Complete!</h3>
          <p className="text-sm text-gray-400">
            Duration: {formatTime(elapsed)} • {protocolTitle}
          </p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            How effective was this session?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  rating === value
                    ? 'bg-yellow-500 border-yellow-500 text-white scale-110'
                    : 'bg-neuro-800 border-neuro-700 text-gray-400 hover:border-yellow-500'
                }`}
              >
                <span className="text-2xl">★</span>
              </button>
            ))}
          </div>
        </div>

        {/* Side Effects */}
        <div>
          <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            Any side effects? (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {commonSideEffects.map(effect => (
              <button
                key={effect}
                onClick={() => {
                  setSideEffects(prev =>
                    prev.includes(effect)
                      ? prev.filter(e => e !== effect)
                      : [...prev, effect]
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sideEffects.includes(effect)
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-neuro-800 text-gray-400 border border-neuro-700 hover:border-neuro-600'
                }`}
              >
                {effect}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any observations?"
            className="w-full px-3 py-2 bg-neuro-800 border border-neuro-700 rounded-lg text-white placeholder-gray-500 focus:border-neuro-500 focus:ring-1 focus:ring-neuro-500 resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmitRating}
          className="w-full py-3 bg-neuro-500 hover:bg-neuro-600 text-white font-bold rounded-lg transition-colors"
        >
          Save & Finish
        </button>
      </div>
    );
  }

  // Active session view
  return (
    <div className="p-6 rounded-lg bg-neuro-900 border border-neuro-700 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-1">{protocolTitle}</h3>
        <p className="text-sm text-gray-400">
          Expected duration: {formatTime(expectedDuration)}
        </p>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className={`text-6xl font-bold ${isOvertime ? 'text-yellow-400' : 'text-white'} mb-2`}>
          {formatTime(elapsed)}
        </div>
        {isOvertime && (
          <p className="text-sm text-yellow-400">Extended session</p>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-neuro-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOvertime
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                : 'bg-gradient-to-r from-neuro-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {isRunning ? (
          <button
            onClick={handlePause}
            className="px-6 py-3 bg-neuro-700 hover:bg-neuro-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Pause className="w-5 h-5" />
            Pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-neuro-500 hover:bg-neuro-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Resume
          </button>
        )}

        <button
          onClick={() => handleStop(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Square className="w-5 h-5" />
          Complete
        </button>
      </div>

      {/* Quick Exit */}
      <button
        onClick={() => {
          if (confirm('End session without completing? Progress will not be tracked.')) {
            if (session) {
              LocalStorageManager.endSession(session.id, false);
            }
            onComplete?.(session!);
          }
        }}
        className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        End Session
      </button>

      {/* Privacy Notice */}
      <div className="pt-4 border-t border-neuro-700">
        <p className="text-xs text-gray-500 text-center">
          🔒 Session data stored locally on your device
        </p>
      </div>
    </div>
  );
};
