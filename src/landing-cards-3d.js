/**
 * MIGRATION CANDIDATE — landing-cards-3d.js
 *
 * This file is NOT loaded by the browser. Its functionality has been migrated to:
 *   - src/components/TiltCard.tsx    (TiltCard spring-physics 3D tilt)
 *   - src/pages/Landing.tsx          (initScrollReveals, initStatsReveal,
 *                                     initParallaxText, initHeroCardOrbit
 *                                     — all wired via useEffect)
 *
 * Safe to delete after build verification passes.
 */

/**
 * landing-cards-3d.js — Enhanced 3D interactions for all landing-page cards.
 *
 * Features:
 *   - Deep perspective 3D tilt on hover (spring-physics lerp)
 *   - Dynamic light-reflection gradient that follows cursor
 *   - Depth-aware shadow shift
 *   - IntersectionObserver-driven reveal animations
 *   - Parallax text layers on mouse movement
 */

/* ======== 3D Tilt Cards ======== */

const SPRING = 0.08;  // lerp spring factor
const DAMPEN = 0.92;  // velocity damping

class TiltCard {
  constructor(el) {
    this.el = el;
    this.inner = el; // tilt on the element itself
    this.intensity = parseFloat(el.dataset.tiltIntensity || '12');
    this.rx = 0; this.ry = 0;
    this.txr = 0; this.tyr = 0; // targets
    this.vx = 0; this.vy = 0;   // velocity (spring)
    this.lightEl = null;
    this.raf = null;
    this.hovering = false;

    this.setup();
    this.bind();
  }

  setup() {
    this.el.style.transformStyle = 'preserve-3d';
    this.el.style.perspective = '900px';
    this.el.style.willChange = 'transform';

    // Create light reflection overlay
    this.lightEl = document.createElement('div');
    Object.assign(this.lightEl.style, {
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      pointerEvents: 'none',
      zIndex: '5',
      opacity: '0',
      transition: 'opacity 0.4s ease',
      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 60%)',
      mixBlendMode: 'overlay',
    });
    this.el.style.position = 'relative';
    this.el.appendChild(this.lightEl);
  }

  bind() {
    this.el.addEventListener('mouseenter', () => {
      this.hovering = true;
      this.lightEl.style.opacity = '1';
      if (!this.raf) this.tick();
    });

    this.el.addEventListener('mousemove', (e) => {
      const rect = this.el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;  // 0..1
      const ny = (e.clientY - rect.top)  / rect.height;
      this.txr = -(ny - 0.5) * this.intensity;  // rotateX
      this.tyr =  (nx - 0.5) * this.intensity;  // rotateY

      // Move light reflection
      this.lightEl.style.background =
        `radial-gradient(circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.15), transparent 55%)`;
    });

    this.el.addEventListener('mouseleave', () => {
      this.hovering = false;
      this.txr = 0;
      this.tyr = 0;
      this.lightEl.style.opacity = '0';
    });
  }

  tick() {
    // Spring physics
    this.vx += (this.txr - this.rx) * SPRING;
    this.vy += (this.tyr - this.ry) * SPRING;
    this.vx *= DAMPEN;
    this.vy *= DAMPEN;
    this.rx += this.vx;
    this.ry += this.vy;

    const lift = this.hovering ? 18 : 0;

    this.el.style.transform =
      `perspective(900px) rotateX(${this.rx}deg) rotateY(${this.ry}deg) translateZ(${lift}px)`;

    // Dynamic shadow based on tilt
    const shadowX = -this.ry * 1.5;
    const shadowY =  this.rx * 1.5 + 12;
    this.el.style.boxShadow = this.hovering
      ? `${shadowX}px ${shadowY}px 40px -8px rgba(0,0,0,0.45),
         0 0 60px -10px rgba(34,211,238,0.15)`
      : '';

    // Keep animating if still moving
    const moving = Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01;
    if (moving || this.hovering) {
      this.raf = requestAnimationFrame(() => this.tick());
    } else {
      this.el.style.transform = '';
      this.el.style.boxShadow = '';
      this.raf = null;
    }
  }
}

export function initTiltCards() {
  const cards = document.querySelectorAll('.card-3d');
  cards.forEach((el) => new TiltCard(el));
}

/* ======== Scroll Reveal (3D entrance) ======== */

export function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal-3d');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Apply stagger delay from data attribute or index
          const delay = entry.target.dataset.revealDelay || '0';
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ======== Parallax Text Layers ======== */

export function initParallaxText() {
  const container = document.querySelector('.parallax-text');
  if (!container) return;

  const layers = container.querySelectorAll('[data-depth]');
  if (!layers.length) return;

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function tick() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;

    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || '1');
      const x = cx * depth * 12;
      const y = cy * depth * 8;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    requestAnimationFrame(tick);
  }
  tick();
}

/* ======== 3D Stats Counter ======== */

export function initStatsReveal() {
  const stats = document.querySelectorAll('.stat-3d');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  stats.forEach((el) => observer.observe(el));
}

/* ======== Enhanced Hero Card Orbit ======== */

export function initHeroCardOrbit() {
  const cards = document.querySelectorAll('.hero-orbit-card');
  if (!cards.length) return;

  let mx = 0, my = 0;

  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function tick() {
    cards.forEach((card, i) => {
      const depth = parseFloat(card.dataset.parallaxDepth || '1');
      const offsetX = mx * depth * 18;
      const offsetY = my * depth * 12;
      const rotX = my * depth * 4;
      const rotY = -mx * depth * 4;
      card.style.transform =
        `translate3d(${offsetX}px, ${offsetY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    requestAnimationFrame(tick);
  }
  tick();
}
