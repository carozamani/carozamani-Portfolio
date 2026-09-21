'use client';

import { motion } from 'framer-motion';
import MediaSection from './MediaSection';
import { podcastCards, articleCards } from '@/data/media';
import styles from './MediaModule.module.css';
import TypographyComponent from '@/components/ui/Typography';

export function MediaModule() {
  return (
    <section className={styles.section}>
      <GridBackground />
      <GlowEffect />

      <AnimatedBlock delay={0.1}>
        <MediaSection
          type="podcast"
          layoutDirection="cardsLeft"
          content={
            <ContentBlock
              title="Podcasts"
              description="Episodes about design, UX, product thinking, and challenges."
            />
          }
          cards={podcastCards}
        />
      </AnimatedBlock>

      <AnimatedBlock delay={0.3}>
        <MediaSection
          type="article"
          layoutDirection="cardsRight"
          content={
            <ContentBlock
              title="Articles"
              description="Read insightful articles about UX, UI, and design systems."
            />
          }
          cards={articleCards}
        />
      </AnimatedBlock>
    </section>
  );
}

/* ----------------- Helper Components ----------------- */

const AnimatedBlock = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className={styles.animatedBlock}
  >
    {children}
  </motion.div>
);

const ContentBlock = ({ title, description }: { title: string; description: string }) => (
  <div className={styles.contentBlock}>
    <TypographyComponent variant="h2" color="text-primary" className={styles.title}>
      {title}
    </TypographyComponent>

    <TypographyComponent variant="body1" color="text-secondary" className={styles.description}>
      {description}
    </TypographyComponent>
  </div>
);

const GridBackground = () => <div className={styles.gridBackground} />;
const GlowEffect = () => <div className={styles.glowEffect} />;
