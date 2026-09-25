'use client';

import { ReactElement } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './AboutMeIntro.module.css';
import TypographyComponent from '@/components/ui/Typography';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = {
  title?: string;
  description?: ReactElement | string;
  highlightText?: string;
  className?: string;
};

export default function BlockIntro({
  title: titleProp,
  description: descriptionProp,
  highlightText: highlightProp,
  className,
}: Props): ReactElement {
  const { about } = useDictionary();
  const title = titleProp ?? about.title;
  const description = descriptionProp ?? about.description;
  const highlightText = highlightProp ?? about.highlight;

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
