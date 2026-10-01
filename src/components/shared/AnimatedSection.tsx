'use client';

import type { ReactNode } from 'react';
import { Reveal, type RevealVariant } from './Reveal';

type AnimatedSectionProps = {
  id: string;
  children: ReactNode;
  viewAmount?: number;
  variant?: RevealVariant;
  delay?: number;
  fullScreen?: boolean;
};

export function AnimatedSection({
  id,
  children,
  viewAmount = 0.2,
  variant = 'fade-up',
  delay = 0,
  fullScreen = false,
}: AnimatedSectionProps) {
  return (
    <Reveal
      as="section"
      id={id}
      className={fullScreen ? 'flex min-h-dvh flex-col justify-center' : undefined}
      amount={viewAmount}
      variant={variant}
      delay={delay}
    >
      {children}
    </Reveal>
  );
}
