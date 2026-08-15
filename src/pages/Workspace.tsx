import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { getMotivationalGreeting } from '../utils/store';
import { MOODS } from '../data/moods';
import { initGestureUnlock, setSound } from '../utils/audio';

import { VideoBackdrop } from '../components/VideoBackdrop';
import { ParticleLayers } from '../components/ParticleLayers';
import { FocusTimer, PRESETS } from '../components/FocusTimer';
import { MissionEditor } from '../components/MissionEditor';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { DockNav } from '../components/DockNav';

import { ThemeRoomModal } from '../components/ThemeRoomModal';
import { AmbientMixerModal } from '../components/AmbientMixerModal';
import { TasksModal } from '../components/TasksModal';
import { TimerPresetsModal } from '../components/TimerPresetsModal';
import { UserAccountModal } from '../components/UserAccountModal';

export const Workspace: React.FC = () => {
  const state = useStore();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [clockString, setClockString] = useState<string>('--:--');

  // Sync body data-mood and vignetting classes
  useEffect(() => {
    document.body.dataset.mood = state.mood;

    if (state.mood === 'noir') {
      document.body.className =
        'relative min-h-screen overflow-x-hidden transition-all duration-700 cine-vignette cine-grain';
    } else if (state.mood === 'exam') {
      document.body.className =
        'relative min-h-screen overflow-x-hidden transition-all duration-700 exam-mode';
    } else {
      document.body.className =
        'relative min-h-screen overflow-x-hidden transition-all duration-700 cine-vignette';
    }

    if (isZenActive) {
      document.body.classList.add('zen-active');
    } else {
      document.body.classList.remove('zen-active');
    }
  }, [state.mood, isZenActive]);

  // Audio gesture unlock
  useEffect(() => {
    initGestureUnlock();
  }, []);

  // Sync audio engine when state.sound changes (e.g. theme switch auto-selects a sound)
  useEffect(() => {
    setSound(state.sound);
  }, [state.sound]);

  // Live clock interval
  useEffect(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const updateClock = () => {
      const now = new Date();
      const d = days[now.getDay()];
      const m = months[now.getMonth()];
      const date = now.getDate();
      const y = now.getFullYear();
      const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockString(`${d} · ${m} ${date}, ${y} · ${t}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleModal = (modalId: string) => {
    if (activeModal === modalId) {
      setActiveModal(null);
    } else {
      setActiveModal(modalId);
    }
  };

  const handleToggleZen = () => {
    setIsZenActive((prev) => !prev);
    setActiveModal(null);
  };

  const activeMoodName = MOODS.find((m) => m.id === state.mood)?.name || "Focus Mode";
  const motivationalGreetingText = getMotivationalGreeting(state);

  return (
    <div className="relative min-h-screen transition-all duration-700 bg-background text-foreground">
      {/* Dynamic Backgrounds & Particles */}
      <VideoBackdrop mood={state.mood} />
      <div className="aurora" />
      <ParticleLayers mood={state.mood} />

      {/* Main interface shell */}
      <div className="app-interface relative z-10 min-h-screen flex flex-col justify-between p-6 pointer-events-none">
        {/* TOP NAVIGATION BAR */}
        <header className="flex items-center justify-between w-full pointer-events-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_15px_rgba(var(--color-primary),0.35)] transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              FocusFlow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span
              id="live-clock"
              className="text-base md:text-lg font-bold tabular-nums text-foreground bg-card/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-border leading-snug"
            >
              {clockString}
            </span>
            <button
              id="top-profile-btn"
              onClick={() => handleToggleModal('profile')}
              className="text-xs uppercase tracking-widest font-extrabold text-foreground bg-primary/20 hover:bg-primary/30 border border-primary/30 px-4 py-1.5 rounded-full transition shadow-sm cursor-pointer"
            >
              {state.currentUser ? state.currentUser.name : "Sign In"}
            </button>
          </div>
        </header>

        {/* CENTRAL FOCUS AREA */}
        <main
          id="central-focus-area"
          className="flex flex-col items-center justify-center text-center my-auto py-8 pointer-events-auto max-w-2xl mx-auto transition-all duration-700 select-none"
        >
          {/* Motivational Greeting Banner */}
          <div id="greeting-banner" className="mb-4 transform translate-y-0 transition-all duration-700">
            <p id="greeting-text" className="text-sm uppercase tracking-[0.25em] text-accent font-bold mb-1 opacity-80">
              Focus Mode — {activeMoodName}
            </p>
            <h2 id="motivational-greeting" className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground/90">
              {motivationalGreetingText}
            </h2>
          </div>

          {/* Pomodoro Timer */}
          <FocusTimer
            presetIndex={activePresetIndex}
            onPresetSelect={setActivePresetIndex}
          />

          {/* Mission Editor */}
          <MissionEditor mission={state.mission} />
        </main>

        {/* Motivational Quote Banner */}
        <MotivationalQuote />

        {/* Floating Bottom Dock */}
        <DockNav
          activeModal={activeModal}
          onToggleModal={handleToggleModal}
          isZenActive={isZenActive}
          onToggleZen={handleToggleZen}
        />
      </div>

      {/* Modal Overlays */}
      <TimerPresetsModal
        isOpen={activeModal === 'timer'}
        onClose={() => setActiveModal(null)}
        activePresetIndex={activePresetIndex}
        onSelectPreset={setActivePresetIndex}
        stats={state.stats}
      />

      <ThemeRoomModal
        isOpen={activeModal === 'themes'}
        onClose={() => setActiveModal(null)}
        activeMood={state.mood}
      />

      <AmbientMixerModal
        isOpen={activeModal === 'sounds'}
        onClose={() => setActiveModal(null)}
        activeSound={state.sound}
      />

      <TasksModal
        isOpen={activeModal === 'tasks'}
        onClose={() => setActiveModal(null)}
        tasks={state.tasks}
      />

      <UserAccountModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        currentUser={state.currentUser}
      />
    </div>
  );
};
