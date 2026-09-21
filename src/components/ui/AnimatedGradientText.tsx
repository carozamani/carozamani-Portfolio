'use client';

import type { ReactNode } from 'react';

type AnimatedGradientTextProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
};

export default function AnimatedGradientText({
  children,
  className = '',
  colors = ['#A78BFA', '#8B5CF6'],
  duration = 6,
}: AnimatedGradientTextProps) {
  const gradientColors = colors.join(', ');

  return (
    <>
      <span
        className={className}
        style={{
          background: `linear-gradient(270deg, ${gradientColors})`,
          backgroundSize: '400% 400%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: `gradientMove ${duration}s ease infinite`,
        }}
      >
        {children}
      </span>

      <style jsx>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
