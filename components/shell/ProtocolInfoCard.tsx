import React from 'react';
import { Play, Pause, Target, Clock, ShieldAlert } from 'lucide-react';
import { Protocol } from '../../types.ts';

/**
 * Shared protocol information card used by both DesktopApp and MobileApp.
 *
 * Renders: title, evidence badge, section badge, optional time/onset badges,
 * play/pause button, description, usage goal, and contraindications.
 *
 * Layout variants are controlled by `compact` prop:
 * - compact=false (desktop): larger text, 80px play button, full badges
 * - compact=true (mobile): smaller text, 56px play button, condensed badges
 */

export interface ProtocolInfoCardProps {
  protocol: Protocol;
  isPlaying: boolean;
  uiMode: 'guided' | 'expert';
  compact?: boolean;
  onPlay: () => void;
}

export const ProtocolInfoCard: React.FC<ProtocolInfoCardProps> = React.memo(({
  protocol,
  isPlaying,
  uiMode,
  compact = false,
  onPlay,
}) => {
  const playSize = compact ? 'w-14 h-14' : 'w-20 h-20';
  const playIcon = compact ? 'w-6 h-6' : 'w-8 h-8';
  const titleSize = compact ? 'text-xl' : 'text-4xl';
  const badgeSize = compact ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`bg-neuro-800/40 border border-neuro-700 backdrop-blur-xl ${compact ? 'p-6' : 'p-8'} rounded-2xl flex flex-col gap-4`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h2 className={`${titleSize} font-bold text-white tracking-tight uppercase font-mono mb-2 leading-tight`}>
            {protocol.title}
          </h2>
          <div className="flex gap-2 flex-wrap mt-1">
            {protocol.evidenceLevel && (
              <span className={`${badgeSize} font-mono font-bold px-2 py-1 rounded bg-neuro-500/10 border border-neuro-500/30 text-neuro-400`}>
                Level {protocol.evidenceLevel}
              </span>
            )}
            <span className={`${badgeSize} font-mono font-bold px-2 py-1 rounded bg-neuro-accent/10 border border-neuro-accent/30 text-neuro-accent`}>
              {(protocol.section ?? 'General').toUpperCase()}
            </span>
            {uiMode === 'expert' && protocol.optimalTimeOfDay && (
              <span className={`${badgeSize} font-mono px-2 py-1 rounded bg-black/30 border border-neuro-700/50 text-gray-500 flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                {protocol.optimalTimeOfDay.replace(/-/g, ' ')}
              </span>
            )}
            {uiMode === 'expert' && protocol.expectedOnset != null && (
              <span className={`${badgeSize} font-mono px-2 py-1 rounded bg-black/30 border border-neuro-700/50 text-gray-500`}>
                ~{protocol.expectedOnset} min onset
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onPlay}
          className={`${playSize} rounded-full flex items-center justify-center transition-all shrink-0 ${
            !isPlaying
              ? 'bg-neuro-500 text-black shadow-lg shadow-neuro-500/30 hover:scale-105'
              : 'bg-neuro-900 border-2 border-neuro-500 text-neuro-500 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'
          }`}
          aria-label={isPlaying ? 'Pause protocol' : 'Play protocol'}
        >
          {!isPlaying ? (
            <Play className={`${playIcon} ml-1 fill-current`} />
          ) : (
            <Pause className={`${playIcon} fill-current`} />
          )}
        </button>
      </div>

      {/* Description */}
      <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-300 leading-relaxed`}>
        {protocol.description}
      </p>

      {/* Usage Goal */}
      {protocol.usageGoal && (
        <div className="bg-neuro-900/60 p-4 rounded-xl border border-neuro-500/20">
          <div className="flex items-center gap-2 text-neuro-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Target className="w-4 h-4" /> Session Goal
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{protocol.usageGoal}</p>
        </div>
      )}

      {/* Contraindications */}
      {protocol.contraindications && protocol.contraindications.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" /> Contraindications
          </div>
          <ul className="text-xs text-red-300 space-y-1">
            {protocol.contraindications.map((ci, i) => (
              <li key={i}>• {ci}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

ProtocolInfoCard.displayName = 'ProtocolInfoCard';
