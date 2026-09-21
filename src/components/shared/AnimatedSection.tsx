'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const sectionAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type AnimatedSectionProps = {
  id: string;
  children: ReactNode;
  viewAmount?: number;
};

export function AnimatedSection({ id, children, viewAmount = 0.2 }: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: viewAmount }}
      variants={sectionAnimation}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
