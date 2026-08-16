import React from 'react';

/**
 * Shared UI mode toggle (Guided / Expert).
 *
 * Both DesktopApp and MobileApp render identical toggle buttons.
 * This component unifies them with a `compact` prop for mobile sizing.
 */

export interface UiModeToggleProps {
  mode: 'guided' | 'expert';
  onChange: (mode: 'guided' | 'expert') => void;
  compact?: boolean;
}

export const UiModeToggle: React.FC<UiModeToggleProps> = React.memo(({
  mode,
  onChange,
  compact = false,
}) => {
  const padSize = compact ? 'px-2.5 py-1' : 'py-2';
  const textSize = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`flex gap-0.5 bg-black/40 p-0.5 border border-neuro-700/50 rounded${compact ? '-lg' : ''}`}>
      <button
        onClick={() => onChange('guided')}
        className={`flex-1 ${padSize} ${textSize} font-bold rounded transition-colors ${
          mode === 'guided'
            ? 'bg-neuro-500 text-black'
            : 'text-gray-500 hover:text-gray-300'
        }`}
        aria-label="Guided mode"
      >
        Guided
      </button>
      <button
        onClick={() => onChange('expert')}
        className={`flex-1 ${padSize} ${textSize} font-bold rounded transition-colors ${
          mode === 'expert'
            ? 'bg-neuro-700 text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
        aria-label="Expert mode"
      >
        Expert
      </button>
    </div>
  );
});

UiModeToggle.displayName = 'UiModeToggle';
