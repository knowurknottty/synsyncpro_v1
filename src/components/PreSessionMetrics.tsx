/**
 * Pre-Session Metrics Form Component
 *
 * Collects metrics before session starts
 * Supports scale, boolean, text, and number input types
 */

import React, { useState } from 'react';
import { Activity, SkipForward } from 'lucide-react';
import type { PlanMetric } from '../types/plan';

interface PreSessionMetricsProps {
  metrics: PlanMetric[];
  onSubmit: (values: Record<string, any>) => void;
  onSkip?: () => void;
}

export const PreSessionMetrics: React.FC<PreSessionMetricsProps> = ({
  metrics,
  onSubmit,
  onSkip,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Filter for per-session metrics
  const sessionMetrics = metrics.filter(
    (m) => m.frequency === 'per_session' && m.required
  );

  if (sessionMetrics.length === 0 && onSkip) {
    // No metrics to collect, auto-skip
    React.useEffect(() => {
      onSkip();
    }, []);
    return null;
  }

  /**
   * Handle value change
   */
  const handleChange = (metricId: string, value: any) => {
    setValues((prev) => ({ ...prev, [metricId]: value }));
    setTouched((prev) => new Set(prev).add(metricId));
  };

  /**
   * Check if form is valid
   */
  const isValid = () => {
    return sessionMetrics.every((metric) => {
      if (!metric.required) return true;
      return values[metric.metric_id] !== undefined;
    });
  };

  /**
   * Handle submit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-neuro-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">
              Pre-Session Check-In
            </h2>
            <p className="text-sm text-gray-400">
              How are you feeling before this session?
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-6">
          {sessionMetrics.map((metric) => (
            <div
              key={metric.metric_id}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700"
            >
              {/* Label */}
              <label className="block mb-3">
                <span className="text-sm font-medium text-white">
                  {metric.label}
                  {metric.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </span>
                {metric.description && (
                  <span className="block text-xs text-gray-400 mt-1">
                    {metric.description}
                  </span>
                )}
              </label>

              {/* Scale Input */}
              {metric.type === 'scale' && (
                <div className="space-y-3">
                  <input
                    type="range"
                    min={metric.scale_min}
                    max={metric.scale_max}
                    value={values[metric.metric_id] || metric.scale_min}
                    onChange={(e) =>
                      handleChange(metric.metric_id, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                  />
                  <div className="flex items-center justify-between">
                    {metric.scale_labels ? (
                      <>
                        <span className="text-xs text-gray-500">
                          {
                            metric.scale_labels[
                              metric.scale_min || 0
                            ]
                          }
                        </span>
                        <span className="text-lg font-semibold text-neuro-400">
                          {values[metric.metric_id] || metric.scale_min}
                        </span>
                        <span className="text-xs text-gray-500">
                          {
                            metric.scale_labels[
                              metric.scale_max || 10
                            ]
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500">
                          {metric.scale_min}
                        </span>
                        <span className="text-lg font-semibold text-neuro-400">
                          {values[metric.metric_id] || metric.scale_min}
                        </span>
                        <span className="text-xs text-gray-500">
                          {metric.scale_max}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Boolean Input */}
              {metric.type === 'boolean' && (
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleChange(metric.metric_id, true)}
                    className={`
                      flex-1 py-3 rounded-lg font-medium transition-all
                      ${
                        values[metric.metric_id] === true
                          ? 'bg-neuro-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }
                    `}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange(metric.metric_id, false)}
                    className={`
                      flex-1 py-3 rounded-lg font-medium transition-all
                      ${
                        values[metric.metric_id] === false
                          ? 'bg-neuro-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }
                    `}
                  >
                    No
                  </button>
                </div>
              )}

              {/* Number Input */}
              {metric.type === 'number' && (
                <input
                  type="number"
                  value={values[metric.metric_id] || ''}
                  onChange={(e) =>
                    handleChange(metric.metric_id, parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neuro-500"
                  placeholder="Enter value"
                  required={metric.required}
                />
              )}

              {/* Text Input */}
              {metric.type === 'text' && (
                <textarea
                  value={values[metric.metric_id] || ''}
                  onChange={(e) => handleChange(metric.metric_id, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neuro-500 resize-none"
                  placeholder="Enter your response"
                  rows={3}
                  required={metric.required}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!isValid()}
            className={`
              ml-auto px-8 py-3 rounded-lg font-medium transition-all
              ${
                isValid()
                  ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};
