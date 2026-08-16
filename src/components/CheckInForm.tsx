/**
 * Check-In Form Component
 *
 * Displays check-in questions and collects responses
 */

import React, { useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import type { CheckIn } from '../types/plan';
import { submitCheckIn } from '../services/CheckInManager';

interface CheckInFormProps {
  planId: string;
  checkIn: CheckIn;
  onComplete: () => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  planId,
  checkIn,
  onComplete,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const isValid = () => {
    return checkIn.questions
      .filter((q) => q.required)
      .every((q) => responses[q.question_id] !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitCheckIn(planId, checkIn.check_in_id, responses);
      onComplete();
    } catch (err) {
      console.error('Failed to submit check-in:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-neuro-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">{checkIn.title}</h2>
            <p className="text-sm text-gray-400">Check-in {checkIn.check_in_id}</p>
          </div>
        </div>

        <div className="space-y-6">
          {checkIn.questions.map((question) => (
            <div
              key={question.question_id}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700"
            >
              <label className="block mb-3">
                <span className="text-sm font-medium text-white">
                  {question.question_text}
                  {question.required && <span className="text-red-400 ml-1">*</span>}
                </span>
              </label>

              {question.response_type === 'text' && (
                <textarea
                  value={responses[question.question_id] || ''}
                  onChange={(e) => handleChange(question.question_id, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neuro-500 resize-none"
                  rows={4}
                  required={question.required}
                />
              )}

              {question.response_type === 'scale' && question.scale_range && (
                <div className="space-y-3">
                  <input
                    type="range"
                    min={question.scale_range[0]}
                    max={question.scale_range[1]}
                    value={responses[question.question_id] || question.scale_range[0]}
                    onChange={(e) =>
                      handleChange(question.question_id, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {question.scale_range[0]}
                    </span>
                    <span className="text-lg font-semibold text-neuro-400">
                      {responses[question.question_id] || question.scale_range[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {question.scale_range[1]}
                    </span>
                  </div>
                </div>
              )}

              {question.response_type === 'multiple_choice' && question.choices && (
                <div className="space-y-2">
                  {question.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange(question.question_id, choice)}
                      className={`
                        w-full px-4 py-3 rounded-lg text-left transition-all
                        ${
                          responses[question.question_id] === choice
                            ? 'bg-neuro-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!isValid() || submitting}
            className={`
              flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
              ${
                isValid() && !submitting
                  ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? 'Submitting...' : 'Submit Check-In'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
