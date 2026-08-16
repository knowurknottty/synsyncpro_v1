/**
 * Milestone Celebration Component
 *
 * Displays celebration when milestone is achieved
 * Shows badge, title, and reward message
 */

import React, { useEffect, useState } from 'react';
import { Award, Star, Trophy, Target, Zap, CheckCircle2 } from 'lucide-react';
import type { Milestone } from '../types/plan';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onContinue: () => void;
  reduceMotion?: boolean;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onContinue,
  reduceMotion = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(!reduceMotion);

  // Auto-hide confetti after 3 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  /**
   * Get icon for milestone
   */
  const getIcon = () => {
    const iconName = milestone.badge_icon?.toLowerCase();

    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'star':
        return Star;
      case 'target':
        return Target;
      case 'zap':
        return Zap;
      case 'check':
        return CheckCircle2;
      default:
        return Award;
    }
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Confetti Effect (CSS animation) */}
      {showConfetti && !reduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: [
                  '#3b82f6',
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981',
                ][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration Card */}
      <div
        className={`
        relative w-full max-w-lg mx-4
        ${!reduceMotion && 'animate-celebration-bounce'}
      `}
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border-2 border-neuro-500 shadow-2xl overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-neuro-500/20 to-blue-500/20 blur-xl" />

          {/* Content */}
          <div className="relative p-8 space-y-6 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div
                className={`
                p-6 bg-gradient-to-br from-neuro-500 to-blue-500 rounded-full
                ${!reduceMotion && 'animate-pulse-slow'}
              `}
              >
                <Icon className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {milestone.title}
              </h2>
              <p className="text-gray-400">{milestone.description}</p>
            </div>

            {/* Reward Message */}
            {milestone.reward_message && (
              <div className="p-4 bg-neuro-500/10 border border-neuro-500/30 rounded-xl">
                <p className="text-sm text-neuro-300 leading-relaxed">
                  {milestone.reward_message}
                </p>
              </div>
            )}

            {/* Achievement Stats */}
            <div className="flex items-center justify-center space-x-8 pt-4">
              {milestone.day !== undefined && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-neuro-400">
                    {milestone.day}
                  </p>
                  <p className="text-xs text-gray-500">Days</p>
                </div>
              )}

              {milestone.required_sessions !== undefined && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-neuro-400">
                    {milestone.required_sessions}
                  </p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <button
                onClick={onContinue}
                className="w-full px-8 py-4 bg-gradient-to-r from-neuro-500 to-blue-500 hover:from-neuro-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Sparkle Effects */}
        {!reduceMotion && (
          <>
            <div className="absolute -top-4 -left-4 w-8 h-8 animate-ping">
              <Star className="w-full h-full text-yellow-400 opacity-50" />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 animate-ping animation-delay-500">
              <Star className="w-full h-full text-blue-400 opacity-50" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 animate-ping animation-delay-1000">
              <Star className="w-full h-full text-purple-400 opacity-50" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 animate-ping animation-delay-1500">
              <Star className="w-full h-full text-pink-400 opacity-50" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
