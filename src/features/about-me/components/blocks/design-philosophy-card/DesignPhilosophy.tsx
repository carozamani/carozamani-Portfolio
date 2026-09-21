'use client';

import { motion, useAnimationFrame } from 'framer-motion';
import { useState } from 'react';

import styles from './DesignPhilosophy.module.css';
import TypographyComponent from '@/components/ui/Typography';

export default function DesignPhilosophyCard() {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useAnimationFrame((t) => {
    setPos({
      x: 50 + 25 * Math.sin(t / 2500),
      y: 50 + 25 * Math.cos(t / 3000),
    });
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={styles.cardContainer}
    >
      {/* Neon Blue Glow */}
      <div
        className={styles.neonGlow}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
      />

      {/* Heading */}
      <TypographyComponent
        variant="h3"
        color="text-primary"
        className={styles.heading}
      >
        Design Philosophy
      </TypographyComponent>

      {/* Paragraph */}
      <TypographyComponent
        variant="body1"
        color="text-secondary"
        className={styles.paragraph}
      >
        I create clean, user-focused interfaces that solve complex problems with simplicity and thoughtful interactions.
      </TypographyComponent>
    </motion.div>
  );
}
