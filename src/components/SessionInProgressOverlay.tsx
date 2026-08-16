/**
 * Session In Progress Overlay Component
 *
 * Displays during active session with timer and instructions
 * Can be minimized or stopped early
 */

import React, { useState, useEffect } from 'react';
import { Clock, Minimize2, X, Info } from 'lucide-react';

interface SessionInProgressOverlayProps {
  startTime: number;
  durationSeconds: number;
  protocolName: string;
  instructions?: string;
  onStop: () => void;
  onMinimize?: () => void;
}

export const SessionInProgressOverlay: React.FC<
  SessionInProgressOverlayProps
> = ({ startTime, durationSeconds, protocolName, instructions, onStop, onMinimize }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);

      // Auto-hide instructions after 30 seconds
      if (elapsed > 30) {
        setShowInstructions(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
  const progressPercent = Math.min(
    100,
    (elapsedSeconds / durationSeconds) * 100
  );

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle minimize
   */
  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  if (isMinimized) {
    // Minimized view (small floating indicator)
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-3 px-4 py-3 bg-neuro-500 hover:bg-neuro-600 rounded-xl shadow-lg transition-colors"
        >
          <Clock className="w-5 h-5 text-white" />
          <div className="text-left">
            <p className="text-sm font-medium text-white">Session In Progress</p>
            <p className="text-xs text-neuro-100">{formatTime(remainingSeconds)} remaining</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        {/* Main Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-neuro-500/20 to-blue-500/20 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {protocolName}
                </h3>
                <p className="text-sm text-gray-400">Session in progress</p>
              </div>

              <div className="flex items-center space-x-2">
                {onMinimize && (
                  <button
                    onClick={handleMinimize}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Minimize"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Timer Display */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-6 h-6 text-neuro-400" />
                <span className="text-sm text-gray-400">Time Remaining</span>
              </div>

              <div className="text-6xl font-bold text-white tabular-nums">
                {formatTime(remainingSeconds)}
              </div>

              <div className="text-sm text-gray-400">
                Elapsed: {formatTime(elapsedSeconds)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neuro-500 to-blue-500 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{Math.round(progressPercent)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Instructions */}
            {instructions && showInstructions && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-400 mb-1">
                      During Session
                    </h4>
                    <p className="text-xs text-blue-300 leading-relaxed">
                      {instructions}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={onStop}
                className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Stop Session Early
              </button>
            </div>
          </div>
        </div>

        {/* Ambient Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Relax and let the audio guide you
          </p>
        </div>
      </div>
    </div>
  );
};
