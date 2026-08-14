/**
 * MIGRATION CANDIDATE — main.js
 *
 * This file is NOT loaded by the browser. The active entry point is
 * src/main.tsx (React). All functionality has been migrated to:
 *
 *   - src/components/LandingScene3D.tsx  (WebGL 3D scene)
 *   - src/components/HeroReactor.tsx     (reactor timer + mantra orb)
 *   - src/pages/Landing.tsx             (scroll parallax, scroll reveals,
 *                                        stats reveal, hero orbit parallax,
 *                                        badge quote rotation)
 *
 * Safe to delete after build verification passes.
 */

import { init3DTilt } from './app.js';
import { LandingScene, isWebGLAvailable } from './landing-scene.js';
import {
  initTiltCards,
  initScrollReveals,
  initParallaxText,
  initStatsReveal,
  initHeroCardOrbit,
} from './landing-cards-3d.js';

let scene = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Initialize all 3D systems
document.addEventListener('DOMContentLoaded', () => {
  init3DTilt();
  initScrollAnimations();
  initReactorTimer();
  initReactorOrb();

  // WebGL 3D scene (only if supported and user doesn't prefer reduced motion)
  if (isWebGLAvailable() && !prefersReducedMotion()) {
    const canvas = document.getElementById('landing-3d-canvas');
    if (canvas) {
      scene = new LandingScene(canvas);
    }
  }

  // Quote rotation in badge
  initQuoteRotation();

  // CSS 3D card interactions
  initTiltCards();
  initScrollReveals();
  initParallaxText();
  initStatsReveal();
  initHeroCardOrbit();

  // React to reduced-motion preference changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', (e) => {
    if (e.matches && scene) {
      scene.destroy();
      scene = null;
    } else if (!e.matches && !scene && isWebGLAvailable()) {
      const canvas = document.getElementById('landing-3d-canvas');
      if (canvas) scene = new LandingScene(canvas);
    }
  });
});

// Scroll Parallax animations matching Framer Motion
function initScrollAnimations() {
  const grid = document.querySelector('.landing-grid');
  const halo = document.querySelector('.landing-halo');
  
  if (!grid && !halo) return;

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (grid) {
      grid.style.transform = `translateY(${progress * -220}px)`;
    }

    if (halo) {
      // Scale from 1 to 1.35 over first 55% of the scroll progress
      const scaleProgress = Math.min(progress / 0.55, 1);
      const scale = 1 + scaleProgress * 0.35;
      halo.style.transform = `scale(${scale})`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run initially
}

// Reactor card countdown animation
function initReactorTimer() {
  const timerEl = document.getElementById('reactor-timer');
  if (!timerEl) return;

  let min = 24;
  let sec = 13;

  setInterval(() => {
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
    timerEl.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, 1000);
}

// Cycle focus mantras through the core orb
function initReactorOrb() {
  const orb = document.getElementById('reactor-orb');
  const orbText = document.getElementById('reactor-orb-text');
  if (!orb || !orbText) return;

  const mantras = ['Focus', 'Flow', 'Deep Work', 'Lock In', 'Study', 'Create'];
  let index = 0;

  function fitText(text) {
    if (text.length > 6) return 'text-3xl';
    if (text.length > 4) return 'text-4xl';
    return 'text-5xl';
  }

  setInterval(() => {
    orbText.style.opacity = '0';
    orbText.style.transform = 'scale(0.85)';

    setTimeout(() => {
      index = (index + 1) % mantras.length;
      const next = mantras[index];
      orbText.textContent = next;
      orbText.className = `font-display font-extrabold transition-all duration-300 ${fitText(next)}`;

      orbText.style.opacity = '1';
      orbText.style.transform = 'scale(1)';
    }, 300);
  }, 4000);
}

// Rotate study quotes in the hero badge
function initQuoteRotation() {
  const el = document.getElementById('hero-quote-text');
  if (!el) return;

  const quotes = [
    'Built for the hour that matters',
    'Your mind deserves this space',
    'Deep work starts here',
    'One mission at a time',
    'Enter your focus era',
    'The study sanctuary',
  ];
  let i = 0;

  setInterval(() => {
    el.classList.add('hidden');
    setTimeout(() => {
      i = (i + 1) % quotes.length;
      el.textContent = quotes[i];
      el.classList.remove('hidden');
    }, 500);
  }, 5000);
}
