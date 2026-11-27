'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Reveal, type RevealVariant } from './Reveal';
import styles from './AnimatedSection.module.css';

type SectionDepth = 'stage' | 'sink' | 'unfold';

type AnimatedSectionProps = {
  id: string;
  children: ReactNode;
  viewAmount?: number;
  variant?: RevealVariant;
  delay?: number;
  fullScreen?: boolean;
  /** Scroll-linked 3D for the whole section: `stage` leans in and sinks back, `sink` also softens and dims as it recedes, `unfold` only opens. */
  depth?: SectionDepth | false;
};

export function AnimatedSection({
  id,
  children,
  viewAmount = 0.2,
  variant = 'fade-up',
  delay = 0,
  fullScreen = false,
  depth = 'stage',
}: AnimatedSectionProps) {
  return (
    <Reveal
      as="section"
      id={id}
      className={clsx(
        fullScreen && styles.fullScreen,
        depth && '[perspective:var(--depth-perspective)]',
      )}
      amount={viewAmount}
      variant={variant}
      delay={delay}
    >
      <div data-depth={depth || undefined}>{children}</div>
    </Reveal>
  );
}
