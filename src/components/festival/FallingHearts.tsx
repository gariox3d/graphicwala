import { useEffect, useState } from 'react';

const FallingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; animationDuration: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    // Generate 30 hearts with random positions and durations
    const newHearts = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 10 + Math.random() * 20
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute text-pink-500 opacity-60 animate-falling-heart"
          style={{
            left: `${heart.left}%`,
            top: '-50px',
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear'
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FallingHearts;