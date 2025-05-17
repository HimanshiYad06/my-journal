'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  duration: number;
}

export const Starfield = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: Star[] = [];
    const numStars = 100;

    // Create stars
    for (let i = 0; i < numStars; i++) {
      const star: Star = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
      };
      stars.push(star);

      const starElement = document.createElement('div');
      starElement.className = 'star';
      starElement.style.left = `${star.x}%`;
      starElement.style.top = `${star.y}%`;
      starElement.style.width = `${star.size}px`;
      starElement.style.height = `${star.size}px`;
      starElement.style.setProperty('--duration', `${star.duration}s`);
      starElement.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(starElement);
    }

    // Cleanup
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return <div ref={containerRef} className="starfield" />;
}; 