'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import styles from './AboutMeModule.module.css';

// بارگذاری داینامیک بلاک‌ها
const BlockIntro = dynamic(() => import('./blocks/about-me-block/AboutMeIntro'), { ssr: false });
const BlockTechTags = dynamic(() => import('./blocks/tech-tags-block/TechTags'), { ssr: false });
const BlockCTA = dynamic(() => import('./blocks/cta-block/CTA'), { ssr: false });
const DesignPhilosophyCard = dynamic(() => import('./blocks/design-philosophy-card/DesignPhilosophy'), { ssr: false });

export function AboutMeModule() {
  const blocks = [
    { id: 1, component: <BlockIntro />, className: styles.block1 },
    { id: 2, component: <BlockTechTags />, className: styles.block2 },
    { id: 3, component: <BlockCTA fullWidth  />, className: styles.block3 },
    { id: 4, component: <DesignPhilosophyCard />, className: styles.block4 },
  ];

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.wrapper}>
        {blocks.map((block) => (
          <motion.div
            key={block.id}
            className={block.className}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {block.component}
          </motion.div>
        ))}
      </div>
    </section>
  );
}