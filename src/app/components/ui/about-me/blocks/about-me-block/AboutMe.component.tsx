'use client';

import { ReactElement } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './AboutMe.module.css';
import TypographyComponent from '@/components/ui/Typography';

type Props = {
  title?: string;
  description?: ReactElement | string;
  highlightText?: string;
  className?: string;
};

export default function BlockIntro({
  title = 'About Me',
  description = `Hi! I’m Caro Zamani, a front-end developer who loves turning complex ideas into sleek, interactive digital experiences.
I specialize in building user-centered interfaces that are both intuitive and visually engaging.
With a keen eye for detail and a passion for clean, modern design, I aim to create products that delight users and drive engagement.
In my free time, I explore new web technologies, experiment with UI animations, and contribute to open-source projects.`,
  highlightText = 'Caro Zamani',
  className,
}: Props): ReactElement {
  return (
    <motion.div
      className={clsx(styles.wrapper, className)}
      // حذف scale روی هاور
      transition={{ type: 'spring', stiffness: 100, damping: 12 }}
    >
      {/* Grid Pattern */}
      <div className={styles.gridPattern} />

      {/* Neon Glow */}
      <motion.div
        className={styles.glow}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* محتوا */}
      <div className={styles.content}>
        <TypographyComponent variant="h2" color="text-primary">
          {title}
        </TypographyComponent>

        <TypographyComponent variant="body1" color="text-secondary" className={styles.description}>
          {typeof description === 'string' ? (
            <>
              {description.split(highlightText).map((part, idx, arr) => (
                <span key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <span className={styles.highlight}>{highlightText}</span>
                  )}
                </span>
              ))}
            </>
          ) : (
            description
          )}
        </TypographyComponent>
      </div>

      {/* Hover Border */}
      <motion.div
        className={styles.hoverBorder}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
