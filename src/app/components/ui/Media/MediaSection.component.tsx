'use client';

import { motion } from 'framer-motion';
import Section from './Section';
import { CardProps } from './card/Card';
import styles from './MediaSection.module.css';
import TypographyComponent from '../typography/Typography.component';

export default function MediaSection() {
  return (
    <section className={styles.section}>
      <GridBackground />
      <GlowEffect />

      <AnimatedBlock delay={0.1}>
        <Section
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
        <Section
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

/* ----------------- Data ----------------- */

const podcastCards: CardProps[] = [
  {
    id: 'pod1',
    type: 'podcast',
    title: 'RTL Design Challenges',
    summary: 'Episode about RTL design challenges...',
    image: '/images/podcast1.jpg',
    audioSrc: '/audio/ep1.mp3',
    date: 'Dec 2023',
    listeners: 3.2,
    duration: '28 min',
  },
  {
    id: 'pod2',
    type: 'podcast',
    title: 'Why UX Matters',
    summary: 'Episode about UX importance...',
    image: '/images/podcast2.jpg',
    audioSrc: '/audio/ep2.mp3',
    date: 'Feb 2024',
    listeners: 5.8,
    duration: '41 min',
  },
];

const articleCards: CardProps[] = [
  {
    id: 'art1',
    type: 'article',
    title: 'UI Trends 2024',
    summary: 'An article about upcoming UI trends...',
    image: '/images/article1.jpg',
    date: 'Nov 2023',
    readTime: '8 min',
  },
  {
    id: 'art2',
    type: 'article',
    title: 'Design Systems Explained',
    summary: 'Learn how to build a scalable design system...',
    image: '/images/article2.jpg',
    date: 'Jan 2024',
    readTime: '12 min',
  },
];
