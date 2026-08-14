import React from 'react';
import { Clock, Image as ImageIcon, Headphones, CheckSquare, User, Eye } from 'lucide-react';

interface DockNavProps {
  activeModal: string | null;
  onToggleModal: (modalId: string) => void;
  isZenActive: boolean;
  onToggleZen: () => void;
}

export const DockNav: React.FC<DockNavProps> = ({
  activeModal,
  onToggleModal,
  isZenActive,
  onToggleZen,
}) => {
  const getBtnClass = (modalId: string) => {
    const isActive = activeModal === modalId;
    return `dock-item group relative p-3 rounded-full hover:bg-secondary/40 text-foreground transition-all duration-300 cursor-pointer ${
      isActive ? 'text-primary bg-primary/10' : ''
    }`;
  };

  return (
    <footer className="w-full flex justify-center pointer-events-auto mt-6 z-40">
      <div className="dock-bar flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-card/60 backdrop-blur-xl shadow-xl transition-all duration-500">
        {/* Timer Toggle button */}
        <button
          id="dock-btn-timer"
          onClick={() => onToggleModal('timer')}
          className={getBtnClass('timer')}
          aria-label="Timer presets"
        >
          <Clock className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Timer Presets</span>
        </button>

        {/* Themes rooms selector button */}
        <button
          id="dock-btn-themes"
          onClick={() => onToggleModal('themes')}
          className={getBtnClass('themes')}
          aria-label="Theme rooms"
        >
          <ImageIcon className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Themes & Rooms</span>
        </button>

        {/* Ambient Mixer button */}
        <button
          id="dock-btn-sounds"
          onClick={() => onToggleModal('sounds')}
          className={getBtnClass('sounds')}
          aria-label="Ambient sounds"
        >
          <Headphones className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Ambient Mixer</span>
        </button>

        {/* Tasks panel button */}
        <button
          id="dock-btn-tasks"
          onClick={() => onToggleModal('tasks')}
          className={getBtnClass('tasks')}
          aria-label="Tasks list"
        >
          <CheckSquare className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Tasks Checklist</span>
        </button>

        <div className="h-6 w-px bg-border/40 mx-1" />

        {/* Profile / Auth account button */}
        <button
          id="dock-btn-profile"
          onClick={() => onToggleModal('profile')}
          className={getBtnClass('profile')}
          aria-label="User profile"
        >
          <User className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Account Profile</span>
        </button>

        {/* Zen mode toggle button */}
        <button
          id="dock-btn-zen"
          onClick={onToggleZen}
          className={`dock-item group relative p-3 rounded-full hover:bg-secondary/40 text-foreground transition-all duration-300 cursor-pointer ${
            isZenActive ? 'text-primary bg-primary/10' : ''
          }`}
          aria-label="Zen mode toggle"
        >
          <Eye className="h-5 w-5 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <span className="dock-tooltip">Zen Focus Mode</span>
        </button>
      </div>
    </footer>
  );
};
