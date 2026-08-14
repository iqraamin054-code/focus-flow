import React, { useState, useEffect } from 'react';
import { actions } from '../utils/store';

interface MissionEditorProps {
  mission: string;
}

export const MissionEditor: React.FC<MissionEditorProps> = ({ mission }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>(mission);

  useEffect(() => {
    setValue(mission);
  }, [mission]);

  const handleSave = () => {
    actions.setMission(value.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div id="mission-wrapper" className="relative group mt-8 max-w-md w-full">
      {!isEditing ? (
        <div
          onClick={() => setIsEditing(true)}
          id="mission-text-view"
          className="cursor-pointer bg-card/10 border border-border/10 hover:bg-card/30 hover:border-border/40 px-6 py-3 rounded-2xl backdrop-blur-sm transition"
        >
          <h3 id="mission-heading" className="font-display text-lg font-semibold tracking-tight text-foreground break-words">
            {mission ? mission : "What is the mission today?"}
          </h3>
          <span id="mission-sub" className="text-[10px] uppercase tracking-widest text-muted-foreground block mt-1 font-bold">
            Today's mission · click to edit
          </span>
        </div>
      ) : (
        <div id="mission-input-view">
          <input
            id="mission-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="What's the mission today?"
            autoFocus
            className="w-full bg-card/35 border border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-3 outline-none font-display text-base font-semibold text-center text-foreground"
          />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mt-1">
            Press enter or click outside to set
          </span>
        </div>
      )}
    </div>
  );
};
