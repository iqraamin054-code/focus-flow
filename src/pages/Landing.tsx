import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LandingScene3D } from '../components/LandingScene3D';
import { HeroReactor } from '../components/HeroReactor';
import { TiltCard } from '../components/TiltCard';

const BADGE_QUOTES = [
  'Built for the hour that matters',
  'Your mind deserves this space',
  'Deep work starts here',
  'One mission at a time',
  'Enter your focus era',
  'The study sanctuary',
];

export const Landing: React.FC = () => {
  const [badgeQuoteIndex, setBadgeQuoteIndex] = useState(0);
  const [badgeOpacity, setBadgeOpacity] = useState(1);

  // Badge quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeOpacity(0);
      setTimeout(() => {
        setBadgeQuoteIndex((prev) => (prev + 1) % BADGE_QUOTES.length);
        setBadgeOpacity(1);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-shell relative min-h-screen overflow-x-hidden cine-vignette">
      {/* 3D WebGL Canvas */}
      <LandingScene3D />

      {/* Atmospheric grid, halo, noise */}
      <div className="landing-grid" />
      <div className="landing-halo" />
      <div className="landing-noise" />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Portal Entrance */}
      <section className="portal-entrance relative z-10 min-h-[calc(100vh-80px)] px-5 pb-16 pt-8 md:px-10 md:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-accent backdrop-blur-xl animate-fade-in-down">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent)]" />
              <span
                id="hero-quote-text"
                className="transition-opacity duration-500"
                style={{ opacity: badgeOpacity }}
              >
                {BADGE_QUOTES[badgeQuoteIndex]}
              </span>
            </div>

            <h1 className="parallax-text font-display text-[clamp(3.5rem,9vw,9rem)] font-extrabold leading-[0.88] tracking-normal text-foreground animate-fade-in-up">
              <span data-depth="1.2">Lock in.</span>
              <br />
              <span data-depth="0.8">Let the world</span>
              <span className="block text-primary" data-depth="1.6">
                fade out.
              </span>
            </h1>

            <p
              className="mt-8 max-w-2xl text-lg font-medium leading-8 text-muted-foreground md:text-xl animate-fade-in-up delay-150"
              data-depth="0.5"
            >
              FocusFlow turns studying, exam prep, and deep work into a cinematic focus room: a timer, a mission, tasks, and atmosphere that makes concentration feel physical.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              <Link
                to="/workspace"
                className="group rounded-full bg-primary px-8 py-4 text-base font-extrabold text-primary-foreground shadow-[0_0_50px_color-mix(in_oklch,var(--color-primary)_35%,transparent)] transition hover:scale-105"
              >
                Enter the workspace{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <a
                href="#moods"
                className="rounded-full border border-border bg-card/40 px-8 py-4 font-extrabold text-foreground backdrop-blur-xl transition hover:border-primary/60 hover:bg-card"
              >
                Explore rooms
              </a>
            </div>
          </div>

          {/* 3D Hero Reactor */}
          <HeroReactor />
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="relative z-10 border-y border-border bg-card/25 px-5 py-6 backdrop-blur-xl md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
          <div className="stat-3d py-5 text-center md:text-left">
            <div className="stat-value font-display text-4xl font-extrabold text-primary">25m</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              Pomodoro sprint
            </div>
          </div>
          <div className="stat-3d py-5 text-center md:text-left" style={{ transitionDelay: '100ms' }}>
            <div className="stat-value font-display text-4xl font-extrabold text-primary">6</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              Sound worlds
            </div>
          </div>
          <div className="stat-3d py-5 text-center md:text-left" style={{ transitionDelay: '200ms' }}>
            <div className="stat-value font-display text-4xl font-extrabold text-primary">0</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              Feed traps
            </div>
          </div>
          <div className="stat-3d py-5 text-center md:text-left" style={{ transitionDelay: '300ms' }}>
            <div className="stat-value font-display text-4xl font-extrabold text-primary">1</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              Mission at a time
            </div>
          </div>
        </div>
      </section>

      {/* Theme Rooms Showcase */}
      <section id="moods" className="relative z-10 px-5 py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal-3d mb-14 max-w-4xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-accent">
              Immersive focus rooms
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
              Choose the atmosphere your brain believes.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-6">
            <TiltCard
              intensity={10}
              revealDelay={100}
              className="group min-h-80 overflow-hidden rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl transition duration-300 hover:border-primary/60 md:col-span-3"
            >
              <div
                className="absolute inset-0 opacity-35 transition duration-300 group-hover:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0f1a14, #264a32, #7aa67a)' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex gap-2">
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#0f1a14' }} />
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#264a32' }} />
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#7aa67a' }} />
                </div>
                <div className="mt-20">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                    Pine, breeze, birdsong.
                  </p>
                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    Misty Forest
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    Dawn light through tall pines, a soft chorus of birds, leaves drifting on the wind.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              intensity={10}
              revealDelay={200}
              className="group min-h-80 overflow-hidden rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl transition duration-300 hover:border-primary/60 md:col-span-3"
            >
              <div
                className="absolute inset-0 opacity-35 transition duration-300 group-hover:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3a2a1a, #8a6a44, #d4b58a)' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex gap-2">
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#3a2a1a' }} />
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#8a6a44' }} />
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: '#d4b58a' }} />
                </div>
                <div className="mt-20">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                    Cozy. Warm. Endless pages.
                  </p>
                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    Rainy Library
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    Brass lamps, mahogany shelves, and a soft drizzle on the window.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              intensity={14}
              revealDelay={300}
              className="group min-h-80 overflow-hidden rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl transition duration-300 hover:border-primary/60 md:col-span-2"
            >
              <div
                className="absolute inset-0 opacity-35 transition duration-300 group-hover:opacity-60"
                style={{ background: 'linear-gradient(135deg, #2a1d12, #7a4a2a, #c08a5a)' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="mt-auto">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                    Espresso steam and quiet chatter.
                  </p>
                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    Café Focus
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    Warm timber, the hiss of an espresso machine, paper-thin daylight.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              intensity={14}
              revealDelay={400}
              className="group min-h-80 overflow-hidden rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl transition duration-300 hover:border-primary/60 md:col-span-2"
            >
              <div
                className="absolute inset-0 opacity-35 transition duration-300 group-hover:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0a0420, #3a1a6a, #c040ff)' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="mt-auto">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                    Neon rain on glass towers.
                  </p>
                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    Cyber Night
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    Magenta haze, scanlines, and the hum of a sleepless megacity.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              intensity={14}
              revealDelay={500}
              className="group min-h-80 overflow-hidden rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl transition duration-300 hover:border-primary/60 md:col-span-2"
            >
              <div
                className="absolute inset-0 opacity-35 transition duration-300 group-hover:opacity-60"
                style={{ background: 'linear-gradient(135deg, #000000, #2a2a2a, #cfcfcf)' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="mt-auto">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                    Black, white, and ink.
                  </p>
                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    Noir Study
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    Cinematic monochrome with film grain and long shadows.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Focus Operating System Features */}
      <section id="system" className="relative z-10 border-y border-border px-5 py-28 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal-3d">
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-accent">
              The focus operating system
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold leading-tight text-foreground md:text-6xl">
              Less app. More cockpit.
            </h2>
            <p className="mt-6 text-lg font-medium leading-8 text-muted-foreground">
              Everything on screen has one job: make starting easier, staying longer, and finishing feel inevitable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TiltCard intensity={8} revealDelay={100} className="rounded-[2rem] border border-border bg-card/70 p-6 backdrop-blur-xl transition hover:border-primary/60">
              <h3 className="font-display text-2xl font-extrabold text-foreground">Timer with gravity</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                A breathing focus timer that makes time visible without turning into pressure.
              </p>
            </TiltCard>
            <TiltCard intensity={8} revealDelay={200} className="rounded-[2rem] border border-border bg-card/70 p-6 backdrop-blur-xl transition hover:border-primary/60">
              <h3 className="font-display text-2xl font-extrabold text-foreground">Sound that fits</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                Rain, cafe chatter, forest ambience, and sound tracks match the room you choose.
              </p>
            </TiltCard>
            <TiltCard intensity={8} revealDelay={300} className="rounded-[2rem] border border-border bg-card/70 p-6 backdrop-blur-xl transition hover:border-primary/60">
              <h3 className="font-display text-2xl font-extrabold text-foreground">Cinematic moods</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                Video-backed scenes shift the entire workspace so studying feels like entering a place.
              </p>
            </TiltCard>
            <TiltCard intensity={8} revealDelay={400} className="rounded-[2rem] border border-border bg-card/70 p-6 backdrop-blur-xl transition hover:border-primary/60">
              <h3 className="font-display text-2xl font-extrabold text-foreground">Tiny task flow</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                Write what matters today, clear it, and keep momentum without managing a giant system.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Ritual Steps */}
      <section id="ritual" className="relative z-10 px-5 py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal-3d mb-14 max-w-4xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-accent">
              A ritual, not a dashboard
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
              From scattered to locked-in in four beats.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <TiltCard intensity={10} revealDelay={100} className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-7 backdrop-blur-xl">
              <div className="absolute right-5 top-4 font-display text-7xl font-extrabold text-primary/15">
                01
              </div>
              <h3 className="relative mt-16 font-display text-2xl font-extrabold text-foreground">
                Pick a room
              </h3>
              <p className="relative mt-3 text-sm font-medium leading-6 text-muted-foreground">
                Forest, rainy library, cafe, cyber night, noir, or exam mode set the emotional frame.
              </p>
            </TiltCard>
            <TiltCard intensity={10} revealDelay={200} className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-7 backdrop-blur-xl">
              <div className="absolute right-5 top-4 font-display text-7xl font-extrabold text-primary/15">
                02
              </div>
              <h3 className="relative mt-16 font-display text-2xl font-extrabold text-foreground">
                Name the mission
              </h3>
              <p className="relative mt-3 text-sm font-medium leading-6 text-muted-foreground">
                One sentence tells your brain exactly what this session is for.
              </p>
            </TiltCard>
            <TiltCard intensity={10} revealDelay={300} className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-7 backdrop-blur-xl">
              <div className="absolute right-5 top-4 font-display text-7xl font-extrabold text-primary/15">
                03
              </div>
              <h3 className="relative mt-16 font-display text-2xl font-extrabold text-foreground">
                Start the sprint
              </h3>
              <p className="relative mt-3 text-sm font-medium leading-6 text-muted-foreground">
                The Pomodoro ring takes over while the interface gets out of the way.
              </p>
            </TiltCard>
            <TiltCard intensity={10} revealDelay={400} className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-7 backdrop-blur-xl">
              <div className="absolute right-5 top-4 font-display text-7xl font-extrabold text-primary/15">
                04
              </div>
              <h3 className="relative mt-16 font-display text-2xl font-extrabold text-foreground">
                Leave with proof
              </h3>
              <p className="relative mt-3 text-sm font-medium leading-6 text-muted-foreground">
                Completed tasks and quiet stats show progress without pulling you into a dashboard.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="reveal-3d relative z-10 px-5 py-28 text-center md:px-10">
        <p className="mx-auto max-w-3xl font-display text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
          Make your next hour feel impossible to waste.
        </p>
        <Link
          to="/workspace"
          className="mt-10 inline-flex rounded-full bg-primary px-10 py-4 text-lg font-extrabold text-primary-foreground shadow-[0_0_60px_color-mix(in_oklch,var(--color-primary)_38%,transparent)] transition hover:scale-105 active:scale-95 active:translate-y-0.5"
        >
          Start now
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-wrap justify-between gap-4 border-t border-border px-5 py-8 text-sm font-semibold text-muted-foreground md:px-10">
        <span>© FocusFlow</span>
        <span>Cinematic focus for students and deep work.</span>
      </footer>
    </div>
  );
};
