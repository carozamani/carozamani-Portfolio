'use client';

import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import styles from './AboutMeModule.module.css';

const BlockIntro = dynamic(() => import('./blocks/about-me-block/AboutMeIntro'), { ssr: false });
const BlockTechTags = dynamic(() => import('./blocks/tech-tags-block/TechTags'), { ssr: false });
const BlockCTA = dynamic(() => import('./blocks/cta-block/CTA'), { ssr: false });
const DesignPhilosophyCard = dynamic(
  () => import('./blocks/design-philosophy-card/DesignPhilosophy'),
  { ssr: false },
);

export function AboutMeModule() {
  const reduceMotion = useReducedMotion();

  const blocks = [
    { id: 1, component: <BlockIntro />, className: styles.block1 },
    { id: 2, component: <BlockTechTags />, className: styles.block2 },
    { id: 3, component: <BlockCTA />, className: styles.block3 },
    { id: 4, component: <DesignPhilosophyCard />, className: styles.block4 },
  ];

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.wrapper}>
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            className={block.className}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {block.component}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
