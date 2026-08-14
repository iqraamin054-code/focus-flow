import React, { useState, useEffect } from 'react';
import { TiltCard } from './TiltCard';

const MANTRAS = ['Focus', 'Flow', 'Deep Work', 'Lock In', 'Study', 'Create'];

export const HeroReactor: React.FC = () => {
  const [timerText, setTimerText] = useState('24:13');
  const [mantraIndex, setMantraIndex] = useState(0);
  const [mantraOpacity, setMantraOpacity] = useState(1);
  const [mantraScale, setMantraScale] = useState(1);

  // Timer countdown simulation for hero reactor card
  useEffect(() => {
    let min = 24;
    let sec = 13;
    const interval = setInterval(() => {
      if (sec === 0) {
        if (min === 0) {
          min = 25;
          sec = 0;
        } else {
          min--;
          sec = 59;
        }
      } else {
        sec--;
      }
      setTimerText(`${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mantra text cycler in core orb
  useEffect(() => {
    const interval = setInterval(() => {
      setMantraOpacity(0);
      setMantraScale(0.85);

      setTimeout(() => {
        setMantraIndex((prev) => (prev + 1) % MANTRAS.length);
        setMantraOpacity(1);
        setMantraScale(1);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentMantra = MANTRAS[mantraIndex];
  const fitTextClass =
    currentMantra.length > 6 ? 'text-3xl' : currentMantra.length > 4 ? 'text-4xl' : 'text-5xl';

  return (
    <div className="landing-reactor relative mx-auto flex aspect-square w-full max-w-[650px] items-center justify-center">
      {/* Outer spinning rings */}
      <div className="absolute inset-0 rounded-full border border-border/70 animate-[spin_28s_linear_infinite]" />
      <div className="absolute inset-[11%] rounded-full border border-border/70 animate-[spin_40s_linear_infinite_reverse]" />
      <div className="absolute inset-[22%] rounded-full border border-border/70 animate-[spin_52s_linear_infinite]" />

      {/* Orbit Card 1: Mission */}
      <div className="hero-orbit-card absolute left-[7%] top-[12%] z-10" data-parallax-depth="0.8">
        <TiltCard intensity={15}>
          <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-2xl shadow-xl animate-[float-slow_5s_ease-in-out_infinite]">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
              Mission
            </div>
            <div className="mt-2 max-w-44 font-display text-2xl font-extrabold leading-none text-foreground">
              Finish the chapter
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Orbit Card 2: Deep Work Timer */}
      <div className="hero-orbit-card absolute right-[2%] top-[20%] z-10" data-parallax-depth="1.2">
        <TiltCard intensity={15}>
          <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-2xl shadow-xl animate-[float-slow_6.5s_ease-in-out_infinite_reverse]">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
              Deep work
            </div>
            <div className="mt-1 font-display text-5xl font-extrabold tabular-nums text-foreground">
              {timerText}
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Orbit Card 3: Tasks preview */}
      <div className="hero-orbit-card absolute bottom-[10%] left-[12%] z-10" data-parallax-depth="1.0">
        <TiltCard intensity={15}>
          <div className="w-64 space-y-2 rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-2xl shadow-xl animate-[float-slow_7s_ease-in-out_infinite]">
            <div className="flex items-center gap-3 text-sm font-bold text-foreground opacity-60">
              <span className="h-4 w-4 rounded-full border border-border bg-primary" />
              <span className="line-through text-muted-foreground">Physics derivation</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <span className="h-4 w-4 rounded-full border border-border bg-secondary" />
              <span>Database revision</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <span className="h-4 w-4 rounded-full border border-border bg-secondary" />
              <span>Essay outline</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Glow aura */}
      <div className="absolute inset-[22%] rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_100px_color-mix(in_oklch,var(--color-primary)_34%,transparent)]" />

      {/* Core Orb */}
      <div className="absolute inset-[33%] grid place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_80px_var(--color-primary)] animate-[pulse_3.2s_ease-in-out_infinite] transition-transform duration-300">
        <span
          style={{ opacity: mantraOpacity, transform: `scale(${mantraScale})` }}
          className={`font-display font-extrabold transition-all duration-300 ${fitTextClass}`}
        >
          {currentMantra}
        </span>
      </div>
    </div>
  );
};
