import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <header className="relative z-30 flex items-center justify-between px-5 py-5 md:px-10">
      <Link to="/" className="flex items-center gap-3" aria-label="FocusFlow home">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-[0_0_45px_color-mix(in_oklch,var(--color-primary)_30%,transparent)] animate-[spin_10s_linear_infinite]">
          <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_25px_var(--color-primary)]" />
        </span>
        <span className="font-display text-xl font-extrabold tracking-normal text-foreground">
          FocusFlow
        </span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
        <a href="#moods" className="transition hover:text-foreground">
          Rooms
        </a>
        <a href="#system" className="transition hover:text-foreground">
          System
        </a>
        <a href="#ritual" className="transition hover:text-foreground">
          Ritual
        </a>
      </nav>
      <Link
        to="/workspace"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[0_0_35px_color-mix(in_oklch,var(--color-primary)_30%,transparent)] transition hover:scale-105"
      >
        Launch focus
      </Link>
    </header>
  );
};
