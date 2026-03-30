import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (active && !mountedRef.current) {
      mountedRef.current = true;
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;

        // First burst
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#fbbf24', '#34d399'],
        });

        // Side bursts
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#6366f1', '#fbbf24'],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#8b5cf6', '#34d399'],
          });
        }, 200);

        // Stars
        setTimeout(() => {
          confetti({
            particleCount: 40,
            spread: 360,
            startVelocity: 20,
            decay: 0.9,
            scalar: 1.5,
            shapes: ['star'],
            colors: ['#ffd700', '#ffad00'],
            origin: { y: 0.5 },
          });
        }, 500);
      });
    }
  }, [active]);

  return null;
};
