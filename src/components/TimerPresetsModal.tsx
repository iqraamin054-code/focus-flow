import React from 'react';
import { UserStats } from '../types/focus';
import { PRESETS } from './FocusTimer';

interface TimerPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetIndex: number;
  onSelectPreset: (index: number) => void;
  stats: UserStats;
}

export const TimerPresetsModal: React.FC<TimerPresetsModalProps> = ({
  isOpen,
  onClose,
  activePresetIndex,
  onSelectPreset,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div id="modal-timer" className="modal-wrapper active modal-full">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>⏱️</span> Pomodoro Presets
          </h2>
          <button
            onClick={onClose}
            className="panel-close-btn text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {PRESETS.map((preset, index) => {
            const isActive = index === activePresetIndex;
            return (
              <button
                key={preset.label}
                id={`preset-${index}`}
                onClick={() => {
                  onSelectPreset(index);
                  onClose();
                }}
                className={`preset-btn py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'border border-primary bg-primary text-primary-foreground'
                    : 'border border-border bg-secondary/35 text-foreground hover:border-primary/50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border/30 pt-4">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
            Session Stats
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/20 rounded-xl p-3 border border-border/30">
              <div id="stat-sessions" className="font-display text-xl font-bold tabular-nums text-foreground">
                {stats.sessions}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                Sessions
              </div>
            </div>
            <div className="bg-secondary/20 rounded-xl p-3 border border-border/30">
              <div id="stat-tasks" className="font-display text-xl font-bold tabular-nums text-foreground">
                {stats.tasksDone}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                Completed
              </div>
            </div>
            <div className="bg-secondary/20 rounded-xl p-3 border border-border/30">
              <div id="stat-minutes" className="font-display text-xl font-bold tabular-nums text-foreground">
                {Math.round(stats.focusSeconds / 60)}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                Minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
