'use client';

import { Reveal } from '@/components/shared/Reveal';
import styles from './DesignPhilosophy.module.css';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import TypographyComponent from '@/components/ui/Typography';

export default function DesignPhilosophyCard() {
  const { about } = useDictionary();

  return (
    <Reveal distance={25} duration={0.6} className={styles.cardContainer}>
      {/* Neon Blue Glow */}
      <div className={styles.neonGlow} />

      {/* Heading */}
      <TypographyComponent variant="h3" color="text-primary" className={styles.heading}>
        {about.philosophyTitle}
      </TypographyComponent>

      {/* Paragraph */}
      <TypographyComponent variant="body1" color="text-secondary" className={styles.paragraph}>
        {about.philosophyText}
      </TypographyComponent>
    </Reveal>
  );
}
