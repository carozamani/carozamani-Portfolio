'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './TechTags.module.css';
import TypographyComponent from '@/components/ui/Typography';

interface AutoScrollColumnProps {
  tags: string[];
  reverse?: boolean;
  offsetClass?: string;
}

function AutoScrollColumn({ tags, reverse = false, offsetClass = '' }: AutoScrollColumnProps) {
  const infiniteTags = useMemo(() => [...tags, ...tags, ...tags], [tags]);
  const animationClass = reverse ? styles.animateScrollUp : styles.animateScrollDown;

  return (
    <motion.div className={`${styles.scrollColumn} ${offsetClass}`}>
      <div className={`${styles.scrollTarget} ${animationClass}`}>
        {infiniteTags.map((tag, index) => (
          <div key={`${tag}-${index}`} className={styles.tagItem}>
            {tag}
            <div className={styles.glowBackground}></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function BlockTechTags() {
 const tagsLeftBase = [
  'User Research',
  'Wireframing',
  'Prototyping',
  'Interaction Design'
];

const tagsRightBase = [
  'Visual Design',
  'Figma',
  'Usability Testing',
  'Design Systems'
];

  return (
    <div className={styles.blockContainer}>
      <div className={styles.gridContainer}>
        {/* بخش چپ */}
        <div className={styles.leftSection}>
          <TypographyComponent variant="body2" color="text-secondary" className="mb-2">
            Continuously learning and improving
          </TypographyComponent>
          <TypographyComponent variant="h2" color="text-primary" className="mb-4">
            My Tech Stack
          </TypographyComponent>
        </div>

        {/* ستون راست */}
        <div className={styles.rightSection}>
          <AutoScrollColumn tags={tagsLeftBase} />
          <AutoScrollColumn tags={tagsRightBase} reverse offsetClass={styles.offsetTop} />
        </div>
      </div>
    </div>
  );
}
