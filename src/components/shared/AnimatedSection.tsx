'use client';

import { motion, useReducedMotion, type Variant } from 'framer-motion';
import type { ReactNode } from 'react';

type AnimationVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in';

const VARIANT_MAP: Record<AnimationVariant, { hidden: Variant; visible: Variant }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

const REDUCED_MOTION_VARIANT: { hidden: Variant; visible: Variant } = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

type AnimatedSectionProps = {
  id: string;
  children: ReactNode;
  viewAmount?: number;
  variant?: AnimationVariant;
  delay?: number;
  stagger?: number;
};

export function AnimatedSection({
  id,
  children,
  viewAmount = 0.2,
  variant = 'fade-up',
  delay = 0,
  stagger = 0,
}: AnimatedSectionProps) {
  const reduceMotion = useReducedMotion();
  const animation = reduceMotion ? REDUCED_MOTION_VARIANT : VARIANT_MAP[variant];

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewAmount }}
      variants={{
        hidden: animation.hidden,
        visible: {
          ...animation.visible,
          transition: {
            duration: reduceMotion ? 0 : 0.7,
            ease: [0.16, 1, 0.3, 1],
            delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.section>
  );
}
