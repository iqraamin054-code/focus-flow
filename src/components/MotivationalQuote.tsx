import React, { useState, useEffect } from 'react';
import { MOTIVATIONAL_QUOTES } from '../data/moods';

export const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [opacity, setOpacity] = useState(1);
  const [transformY, setTransformY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTransformY(6);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setOpacity(1);
        setTransformY(0);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const quote = MOTIVATIONAL_QUOTES[index];

  return (
    <div id="motivational-quote">
      <div
        className="quote-wrapper transition-all duration-500"
        style={{ opacity, transform: `translateY(${transformY}px)` }}
      >
        <span className="quote-text">"{quote.text}"</span>
        <span className="quote-author">— {quote.author}</span>
      </div>
    </div>
  );
};
