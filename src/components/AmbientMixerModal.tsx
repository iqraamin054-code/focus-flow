import React, { useState } from 'react';
import { SOUNDS } from '../data/moods';
import { actions } from '../utils/store';
import { setVolume, getVolume, setSound } from '../utils/audio';

interface AmbientMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSound: string;
}

const SOUND_POSTER_MAP: Record<string, string> = {
  rain: "/assets/posters/bg-rainy.jpg",
  cafe: "/assets/posters/bg-cafe.jpg",
  forest: "/assets/posters/bg-forest.jpg",
  lofi: "/assets/posters/bg-cyber.jpg",
  fireplace: "/assets/posters/bg-noir.jpg",
};

const SOUND_GRADIENT_MAP: Record<string, string> = {
  vinyl: "linear-gradient(135deg, #2a2a2a, #555555, #888888)",
  exam: "linear-gradient(135deg, #1a1814, #3d3529, #c4a574)",
  silence: "linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)",
  ocean: "linear-gradient(135deg, #0a2a4a, #1a5a8a, #4aa0d0)",
  thunderstorm: "linear-gradient(135deg, #1a1a2a, #2a2a3a, #4a4a6a)",
  wind: "linear-gradient(135deg, #1a2a1a, #3a5a3a, #8aaa8a)",
  night: "linear-gradient(135deg, #05050f, #0d0d2b, #1a1a4a)",
};

const SOUND_ICON_MAP: Record<string, string> = {
  rain: "🌧️",
  cafe: "☕",
  forest: "🌲",
  lofi: "🎧",
  fireplace: "🔥",
  vinyl: "💿",
  exam: "📖",
  silence: "🔇",
  ocean: "🌊",
  thunderstorm: "⛈️",
  wind: "🌬️",
  night: "🌙",
};

export const AmbientMixerModal: React.FC<AmbientMixerModalProps> = ({
  isOpen,
  onClose,
  activeSound,
}) => {
  const [volVal, setVolVal] = useState<number>(getVolume());

  if (!isOpen) return null;

  const handleSoundSelect = (id: string) => {
    actions.setSound(id);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolVal(val);
    setVolume(val);
  };

  return (
    <div id="modal-sounds" className="modal-wrapper active modal-full">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>🎧</span> Ambient Mixer
          </h2>
          <button
            onClick={onClose}
            className="panel-close-btn text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div id="sound-buttons-container" className="grid grid-cols-2 gap-3 mb-4">
          {SOUNDS.map(({ id, label }) => {
            const isActive = id === activeSound;
            const poster = SOUND_POSTER_MAP[id];
            const gradient = SOUND_GRADIENT_MAP[id];

            return (
              <div
                key={id}
                onClick={() => handleSoundSelect(id)}
                className={`sound-vinyl-wrapper ${isActive ? 'active' : ''}`}
                data-sound={id}
              >
                <div
                  className="sound-sleeve"
                  style={
                    poster
                      ? { backgroundImage: `url(${poster})` }
                      : { background: gradient || "linear-gradient(135deg, #1a1a2e, #16213e)" }
                  }
                >
                  <div className="sound-sleeve-content">
                    <span className="sound-label-icon">{SOUND_ICON_MAP[id] || "🎵"}</span>
                    <span className="sound-label">{label}</span>
                  </div>
                </div>
                <div className="sound-vinyl-disc">
                  <div className="sound-vinyl-label" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border/30 pt-3">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex justify-between">
              <span>Volume</span>
              <span id="volume-val">{Math.round(volVal * 100)}%</span>
            </span>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volVal}
              onChange={handleVolumeChange}
              className="w-full accent-primary mt-2 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
