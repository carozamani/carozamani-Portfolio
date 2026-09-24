'use client';

import { motion } from 'framer-motion';
import MediaSection from './MediaSection';
import { podcastCards, articleCards } from '@/data/media';
import styles from './MediaModule.module.css';
import TypographyComponent from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

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
              href="/podcasts"
              iconLeft={<FiArrowLeft />}
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
              href="/articles"
              iconRight={<FiArrowRight />}
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

interface ContentBlockProps {
  title: string;
  description: string;
  href: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const ContentBlock = ({ title, description, href, iconLeft, iconRight }: ContentBlockProps) => (
  <div className={styles.contentBlock}>
    <TypographyComponent variant="h2" color="text-primary" className={styles.title}>
      {title}
    </TypographyComponent>

    <TypographyComponent variant="body1" color="text-secondary" className={styles.description}>
      {description}
    </TypographyComponent>

    <Button
      text="View more"
      variant="ghost"
      href={href}
      iconLeft={iconLeft}
      iconRight={iconRight}
      className={styles.viewMore}
    />
  </div>
);

const GridBackground = () => <div className={styles.gridBackground} />;
const GlowEffect = () => <div className={styles.glowEffect} />;
