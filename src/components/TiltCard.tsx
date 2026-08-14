import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  revealDelay?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 12,
  revealDelay = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [_, setHovering] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let rx = 0, ry = 0;
    let txr = 0, tyr = 0;
    let vx = 0, vy = 0;
    let animationFrame: number | null = null;
    let isHovered = false;

    const SPRING = 0.08;
    const DAMPEN = 0.92;

    const onMouseEnter = () => {
      isHovered = true;
      setHovering(true);
      if (lightRef.current) lightRef.current.style.opacity = '1';
      if (!animationFrame) tick();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      txr = -(ny - 0.5) * intensity;
      tyr = (nx - 0.5) * intensity;

      if (lightRef.current) {
        lightRef.current.style.background = `radial-gradient(circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.15), transparent 55%)`;
      }
    };

    const onMouseLeave = () => {
      isHovered = false;
      setHovering(false);
      txr = 0;
      tyr = 0;
      if (lightRef.current) lightRef.current.style.opacity = '0';
    };

    const tick = () => {
      vx += (txr - rx) * SPRING;
      vy += (tyr - ry) * SPRING;
      vx *= DAMPEN;
      vy *= DAMPEN;
      rx += vx;
      ry += vy;

      const lift = isHovered ? 18 : 0;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;

      const shadowX = -ry * 1.5;
      const shadowY = rx * 1.5 + 12;
      card.style.boxShadow = isHovered
        ? `${shadowX}px ${shadowY}px 40px -8px rgba(0,0,0,0.45), 0 0 60px -10px rgba(34,211,238,0.15)`
        : '';

      const moving = Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01;
      if (moving || isHovered) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
        animationFrame = null;
      }
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', onMouseEnter);
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [intensity]);

  return (
    <div
      ref={cardRef}
      className={`card-3d relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '900px',
        willChange: 'transform',
        transitionDelay: `${revealDelay}ms`,
      }}
    >
      <div
        ref={lightRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 60%)',
          mixBlendMode: 'overlay',
        }}
      />
      {children}
    </div>
  );
};
