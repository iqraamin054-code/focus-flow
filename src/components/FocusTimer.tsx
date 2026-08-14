import React, { useState, useEffect, useRef } from 'react';
import { actions } from '../utils/store';
import { playAlarmNotification } from '../utils/audio';

export const PRESETS = [
  { label: "Focus", seconds: 25 * 60 },
  { label: "Deep", seconds: 50 * 60 },
  { label: "Break", seconds: 5 * 60 },
];

interface FocusTimerProps {
  presetIndex: number;
  onPresetSelect?: (index: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ presetIndex }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PRESETS[presetIndex].seconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Ready');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPresetRef = useRef<number>(presetIndex);

  // Update timer when preset changes
  useEffect(() => {
    if (prevPresetRef.current !== presetIndex) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setSecondsRemaining(PRESETS[presetIndex].seconds);
      setStatusText('Ready');
      prevPresetRef.current = presetIndex;
    }
  }, [presetIndex]);

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      setStatusText('Focusing');
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            setStatusText('Session complete');
            actions.completeSession(PRESETS[presetIndex].seconds);
            playAlarmNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, presetIndex]);

  const handleToggle = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(PRESETS[presetIndex].seconds);
    }
    if (isRunning) {
      setStatusText('Paused');
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setSecondsRemaining(PRESETS[presetIndex].seconds);
    setStatusText('Ready');
  };

  // Format time
  const min = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const sec = (secondsRemaining % 60).toString().padStart(2, '0');

  // SVG ring stroke offset calculation
  // Circumference = 2 * PI * 90 = 565.48
  const total = PRESETS[presetIndex].seconds;
  const pct = 1 - secondsRemaining / total;
  const circumference = 565.48;
  const offset = (1 - pct) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Giant Timer Display */}
      <div
        onClick={handleToggle}
        id="giant-timer-container"
        className="relative flex items-center justify-center group my-2 cursor-pointer transition-transform duration-500 hover:scale-[1.02] select-none"
      >
        <svg viewBox="0 0 200 200" className="w-96 h-96 md:w-[30rem] md:h-[30rem] -rotate-90 drop-shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" fill="none" />
          <circle
            id="timer-progress-ring"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="565.48"
            strokeDashoffset={offset}
            className="transition-all duration-300 ease-linear"
          />
          <defs>
            <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner time text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div id="timer-countdown" className="font-display text-8xl md:text-9xl font-bold tabular-nums tracking-tight text-foreground select-none drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            {min}:{sec}
          </div>
          <div id="timer-status" className="text-xs uppercase tracking-widest text-muted-foreground mt-3 font-bold opacity-60">
            {statusText}
          </div>
        </div>
      </div>

      {/* Quick timer controllers */}
      <div className="flex items-center gap-3 mt-4 z-10">
        <button
          onClick={handleToggle}
          id="timer-toggle-btn"
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition shadow-lg shadow-primary/30 text-sm cursor-pointer"
        >
          {secondsRemaining === 0 ? 'Restart' : isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={handleReset}
          id="timer-reset-btn"
          className="px-6 py-3 rounded-full border border-border font-semibold text-foreground bg-card/45 hover:bg-card hover:border-primary/40 transition text-sm cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
