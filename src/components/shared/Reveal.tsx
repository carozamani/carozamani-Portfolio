'use client';

import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import styles from './Reveal.module.css';

export type RevealVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in';
export type RevealDepth = 'rise' | 'swing-start' | 'swing-end';

type RevealProps = {
  children: ReactNode;
  as?: 'div' | 'section';
  id?: string;
  className?: string;
  variant?: RevealVariant;
  /** Fraction of the element that must be visible before it animates in. */
  amount?: number;
  /** Travel distance in px for the fade variants. */
  distance?: number;
  duration?: number;
  delay?: number;
  /** Scroll-linked 3D lean on top of the reveal; the parent needs `perspective: var(--depth-perspective)`. */
  depth?: RevealDepth;
  /** 0-4: how late this element's lean starts relative to siblings that enter together. */
  depthIndex?: number;
};

const FROM: Record<RevealVariant, (distance: number) => string> = {
  'fade-up': (d) => `translateY(${d}px)`,
  'fade-left': (d) => `translateX(${-d}px)`,
  'fade-right': (d) => `translateX(${d}px)`,
  'scale-in': () => 'scale(0.95)',
};

/** CSS-driven scroll reveal: keeps the animation library out of the landing bundle. */
export function Reveal({
  children,
  as: Tag = 'div',
  id,
  className,
  variant = 'fade-up',
  amount = 0,
  distance = 24,
  duration = 0.7,
  delay = 0,
  depth,
  depthIndex = 0,
}: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>(amount);

  const style = {
    '--reveal-from': FROM[variant](distance),
    '--reveal-duration': `${duration}s`,
    '--reveal-delay': `${delay}s`,
    ...(depth && { '--depth-i': depthIndex }),
  } as CSSProperties;

  return (
    <Tag
      ref={ref}
      id={id}
      data-depth={depth}
      className={clsx(styles.reveal, inView && styles.visible, className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
