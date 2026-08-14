import React from 'react';
import { MOODS } from '../data/moods';
import { getMoodAssets } from '../data/moodAssets';
import { actions } from '../utils/store';

interface ThemeRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMood: string;
}

export const ThemeRoomModal: React.FC<ThemeRoomModalProps> = ({
  isOpen,
  onClose,
  activeMood,
}) => {
  if (!isOpen) return null;

  return (
    <div id="modal-themes" className="modal-wrapper active modal-full">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>🌅</span> Choose Theme Room
          </h2>
          <button
            onClick={onClose}
            className="panel-close-btn text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div id="mood-selector-container" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {MOODS.map((mood) => {
            const assets = getMoodAssets(mood.id);
            const isActive = mood.id === activeMood;

            return (
              <div
                key={mood.id}
                onClick={() => actions.setMood(mood.id)}
                className={`vinyl-card-wrapper ${isActive ? 'active' : ''}`}
                data-id={mood.id}
              >
                <div
                  className="theme-sleeve"
                  style={
                    assets.poster
                      ? { backgroundImage: `url(${assets.poster})` }
                      : { background: `linear-gradient(135deg, ${mood.swatches[1] || '#000'}, ${mood.swatches[2] || '#fff'})` }
                  }
                >
                  <div className="theme-sleeve-content">
                    <div className="flex gap-1 mb-2">
                      {mood.swatches.map((c, idx) => (
                        <span
                          key={idx}
                          className="h-2 w-2 rounded-full border border-white/20"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="font-display font-extrabold text-sm text-white drop-shadow">
                      {mood.name}
                    </div>
                    <div className="text-[10px] text-white/80 mt-0.5 line-clamp-1 drop-shadow">
                      {mood.tagline}
                    </div>
                  </div>
                </div>

                <div className="vinyl-disc">
                  <div
                    className="vinyl-label"
                    style={{ backgroundColor: mood.swatches[2] || 'var(--color-primary)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
