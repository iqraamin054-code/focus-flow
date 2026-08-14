import React from 'react';

interface ParticleLayersProps {
  mood: string;
}

export const ParticleLayers: React.FC<ParticleLayersProps> = ({ mood }) => {
  return (
    <>
      {/* Rain layer */}
      <div
        id="rain-layer"
        className={`rain-layer ${mood === 'rainy' ? 'animate-[fade-in_1s_ease-out]' : 'hidden'}`}
      >
        {mood === 'rainy' &&
          Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${0.6 + Math.random() * 1.2}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.2 + Math.random() * 0.4,
              }}
            />
          ))}
      </div>

      {/* Cyber scan and grid */}
      <div
        id="cyber-scan"
        className={`cyber-scan ${mood === 'cyber' ? 'animate-[fade-in_1s_ease-out]' : 'hidden'}`}
      />
      <div
        id="cyber-grid"
        className={`cyber-grid ${mood === 'cyber' ? 'animate-[fade-in_1s_ease-out]' : 'hidden'}`}
      />

      {/* Cafe steam layer */}
      <div
        id="cafe-steam"
        className={`cafe-steam ${mood === 'cafe' ? 'animate-[fade-in_1s_ease-out]' : 'hidden'}`}
      >
        {mood === 'cafe' &&
          Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${10 + i * 18}%`,
                animationDuration: `${12 + Math.random() * 6}s`,
                animationDelay: `${i * 1.8}s`,
              }}
            />
          ))}
      </div>

      {/* Forest fog layer */}
      <div
        id="forest-fog"
        className={`forest-fog ${mood === 'forest' ? 'animate-[fade-in_1s_ease-out]' : 'hidden'}`}
      />

      {/* Exam glow & dust layer */}
      <div
        id="exam-glow"
        className={`exam-glow ${mood === 'exam' ? 'animate-[fade-in_1.2s_ease-out]' : 'hidden'}`}
      />
      <div
        id="exam-dust"
        className={`exam-dust ${mood === 'exam' ? 'animate-[fade-in_1.2s_ease-out]' : 'hidden'}`}
      >
        {mood === 'exam' &&
          Array.from({ length: 28 }).map((_, i) => {
            const size = 2 + Math.random() * 4;
            return (
              <span
                key={i}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${8 + Math.random() * 14}s`,
                  animationDelay: `${Math.random() * 6}s`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: 0.15 + Math.random() * 0.45,
                }}
              />
            );
          })}
      </div>
    </>
  );
};
