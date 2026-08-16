// src/components/InfoTooltip.tsx
// Contextual help tooltips to reduce confusion

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Tooltip for providing contextual help
 * Appears on hover/focus, accessible via keyboard
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  side = 'top',
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800'
  };

  const triggerHandlers = {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false)
  };

  const trigger = children ? (
    <span
      className="inline-flex items-center cursor-help"
      tabIndex={0}
      aria-label={content}
      {...triggerHandlers}
    >
      {children}
    </span>
  ) : (
    <button
      type="button"
      className="inline-flex items-center justify-center group"
      aria-label="More information"
      {...triggerHandlers}
    >
      <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
    </button>
  );

  return (
    <div className={`relative inline-flex ${className}`}>
      {trigger}

      {/* Tooltip */}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[side]} w-64 animate-fade-in`}
          role="tooltip"
        >
          {/* Content */}
          <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <p className="text-xs text-gray-300 leading-relaxed">
              {content}
            </p>
          </div>

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[side]}`}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Inline tooltip - wraps text with dotted underline
 */
export const InlineTooltip: React.FC<{
  children: React.ReactNode;
  content: string;
}> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      <span
        className="border-b border-dotted border-gray-500 cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 animate-fade-in">
          <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <p className="text-xs text-gray-300 leading-relaxed">
              {content}
            </p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800" />
        </div>
      )}
    </span>
  );
};
