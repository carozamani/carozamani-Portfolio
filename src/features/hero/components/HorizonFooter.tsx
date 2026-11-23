'use client';

import type { ReactNode } from 'react';

import { PlanetBackdrop } from './PlanetBackdrop';
import styles from './HorizonFooter.module.css';

interface HorizonFooterProps {
  children: ReactNode;
}

// The page closes on the planet it opened with: the very same PlanetBackdrop the hero draws, so it has the
// same size and shape, turned over so it rises from the bottom of the footer instead of hanging from the top
// of the page. It is transparent around the planet, so the page-wide sky shows through.
export function HorizonFooter({ children }: HorizonFooterProps) {
  return (
    <div className={styles.horizonFooter}>
      <div className={styles.planet}>
        <PlanetBackdrop placement="bottom" />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
