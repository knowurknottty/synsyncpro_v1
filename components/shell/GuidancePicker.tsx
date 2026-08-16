import React from 'react';
import { Headphones, Wind, Brain, Mic2, Hexagon } from 'lucide-react';
import { SessionGuidance } from '../../types.ts';

/**
 * Shared guidance mode multi-select picker.
 *
 * Both DesktopApp and MobileApp render the same set of guidance toggles
 * with nearly identical markup. This component unifies them.
 *
 * Props:
 * - active: Set of currently active guidance modes
 * - onToggle: callback when a mode is toggled
 * - onClearAll: callback to clear all (audio_only)
 * - compact: smaller text/padding for mobile
 * - showLabel: whether to show the "Guide:" label (desktop only)
 */

const GUIDANCE_OPTIONS: { id: SessionGuidance; label: string; Icon: React.ElementType }[] = [
  { id: 'breathwork', label: 'Breathe',  Icon: Wind },
  { id: 'mantra',     label: 'Mantra',   Icon: Mic2 },
  { id: 'socratic',   label: 'Reflect',  Icon: Brain },
  { id: 'geometry',   label: 'Geometry', Icon: Hexagon },
];

export interface GuidancePickerProps {
  active: Set<SessionGuidance>;
  onToggle: (id: SessionGuidance) => void;
  onClearAll: () => void;
  compact?: boolean;
  showLabel?: boolean;
}

export const GuidancePicker: React.FC<GuidancePickerProps> = React.memo(({
  active,
  onToggle,
  onClearAll,
  compact = false,
  showLabel = false,
}) => {
  const textSize = compact ? 'text-[9px]' : 'text-[10px]';
  const padSize = compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5';
  const iconSize = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';

  const btnClass = (isActive: boolean) =>
    `flex items-center gap-1 ${padSize} ${textSize} font-mono uppercase tracking-widest rounded-full whitespace-nowrap transition-all border ${
      isActive
        ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent'
        : 'bg-transparent border-neuro-700/50 text-gray-600 hover:border-neuro-600 hover:text-gray-400'
    }`;

  return (
    <div className={`flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0 items-center`}>
      {showLabel && (
        <span className={`${textSize} font-mono uppercase tracking-widest text-gray-600 whitespace-nowrap mr-1`}>
          Guide:
        </span>
      )}

      {/* Audio Only = clear all */}
      <button
        onClick={onClearAll}
        className={btnClass(active.size === 0)}
        aria-label="Audio only — clear all guidance"
      >
        <Headphones className={iconSize} />
        {compact ? 'Audio' : 'Audio Only'}
      </button>

      {GUIDANCE_OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onToggle(id)}
          className={btnClass(active.has(id))}
          aria-label={`Toggle ${label} guidance`}
          aria-pressed={active.has(id)}
        >
          <Icon className={iconSize} />
          {label}
        </button>
      ))}
    </div>
  );
});

GuidancePicker.displayName = 'GuidancePicker';
