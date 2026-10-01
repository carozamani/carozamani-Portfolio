'use client';

import { useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import Typography from '@/components/ui/Typography';
import styles from './CaseStudyDetail.module.css';

const WORD_MASK: Variants = {
  hidden: { y: '100%' },
  visible: { y: '0%' },
};

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

type CaseStudyHeroProps = {
  cover: string;
  title: string;
  description?: string;
  tags: string[];
  scopeLabel: string;
};

export function CaseStudyHero({ cover, title, description, tags, scopeLabel }: CaseStudyHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.15]);

  const words = title.split(' ');

  return (
    <>
      <section ref={heroRef} className={styles.hero}>
        {cover ? (
          <m.img
            src={cover}
            alt=""
            className={styles.heroImage}
            style={{ y: imageY, scale: imageScale }}
          />
        ) : (
          <div className={styles.heroPlaceholder} aria-hidden="true" />
        )}
        <div className={styles.heroTopScrim} aria-hidden="true" />
        <div className={styles.heroScrim} aria-hidden="true" />
      </section>

      <div className={styles.heroInner}>
        <m.div
          className={styles.heroContent}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
          }}
        >
          <m.div
            className={styles.heroTopRow}
            variants={FADE_UP}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.heroTags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.heroTag}>
                  {tag}
                </span>
              ))}
            </div>
            <span className={styles.scopeBadge}>{scopeLabel}</span>
          </m.div>

          <Typography variant="h1" className={styles.title}>
            <span className={styles.titleWords}>
              {words.map((word, index) => (
                <span key={index} className={styles.titleWordMask}>
                  <m.span
                    className={styles.titleWord}
                    variants={WORD_MASK}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {word}
                  </m.span>
                </span>
              ))}
            </span>
          </Typography>

          {description && (
            <m.div variants={FADE_UP} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Typography variant="subtitle1" color="text-secondary" className={styles.description}>
                {description}
              </Typography>
            </m.div>
          )}
        </m.div>
      </div>
    </>
  );
}
