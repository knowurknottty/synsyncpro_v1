import React from 'react';

/**
 * Shared visualizer mode picker.
 *
 * Both DesktopApp and MobileApp render a row of mode buttons.
 * DesktopApp shows more modes in expert mode; MobileApp is simpler.
 * This component handles both via the `modes` prop.
 */

export interface VizMode {
  id: string;
  label: string;
  description?: string;
}

export interface VizModePickerProps {
  modes: VizMode[];
  active: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export const VizModePicker: React.FC<VizModePickerProps> = React.memo(({
  modes,
  active,
  onSelect,
  compact = false,
}) => {
  const textSize = compact ? 'text-[9px]' : 'text-[10px]';
  const padSize = compact ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          title={m.description || m.label}
          className={`${padSize} ${textSize} font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
            active === m.id
              ? 'bg-neuro-500/20 border-neuro-500 text-neuro-300'
              : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
});

VizModePicker.displayName = 'VizModePicker';
