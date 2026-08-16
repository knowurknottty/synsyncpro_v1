// src/components/SuccessTransition.tsx
// Celebratory transition when routine is generated

import React, { useEffect } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessTransitionProps {
  onComplete: () => void;
  message?: string;
}

/**
 * Success animation between questionnaire and results
 * Provides positive feedback and manages user expectations
 */
export const SuccessTransition: React.FC<SuccessTransitionProps> = ({
  onComplete,
  message = "Your routine is ready!"
}) => {
  useEffect(() => {
    // Auto-advance after 2 seconds
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-neuro-950 to-purple-950">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-neuro-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ top: '10%', left: '20%' }} />
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-500" style={{ bottom: '10%', right: '20%' }} />
      </div>

      {/* Content */}
      <div className="relative text-center space-y-8 px-4">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 animate-scale-in shadow-2xl shadow-green-500/50">
          <CheckCircle className="w-16 h-16 text-white animate-check-draw" />
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white animate-slide-up">
            {message}
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 animate-slide-up animation-delay-200">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <p className="text-sm md:text-base">
              Building your personalized protocol schedule...
            </p>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 animate-fade-in animation-delay-400">
          <div className="w-2 h-2 bg-neuro-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-neuro-800 rounded-full overflow-hidden mx-auto animate-fade-in animation-delay-600">
          <div className="h-full bg-gradient-to-r from-neuro-500 via-purple-500 to-pink-500 animate-progress-bar" />
        </div>
      </div>
    </div>
  );
};
