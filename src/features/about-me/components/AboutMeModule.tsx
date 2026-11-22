'use client';

import dynamic from 'next/dynamic';
import { Reveal } from '@/components/shared/Reveal';
import styles from './AboutMeModule.module.css';

const BlockIntro = dynamic(() => import('./blocks/about-me-block/AboutMeIntro'), { ssr: false });
const BlockTechTags = dynamic(() => import('./blocks/tech-tags-block/TechTags'), { ssr: false });
const BlockCTA = dynamic(() => import('./blocks/cta-block/CTA'), { ssr: false });
const DesignPhilosophyCard = dynamic(
  () => import('./blocks/design-philosophy-card/DesignPhilosophy'),
  { ssr: false },
);

export function AboutMeModule() {
  const blocks = [
    { id: 1, component: <BlockIntro />, className: styles.block1, depth: 'swing-start' as const },
    { id: 2, component: <BlockTechTags />, className: styles.block2, depth: 'swing-end' as const },
    { id: 3, component: <BlockCTA />, className: styles.block3, depth: 'swing-end' as const },
    {
      id: 4,
      component: <DesignPhilosophyCard />,
      className: styles.block4,
      depth: 'rise' as const,
    },
  ];

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.wrapper}>
        {blocks.map((block, index) => (
          <Reveal
            key={block.id}
            className={block.className}
            amount={0.2}
            distance={20}
            duration={0.4}
            delay={index * 0.1}
            depth={block.depth}
            depthIndex={index}
          >
            {block.component}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
