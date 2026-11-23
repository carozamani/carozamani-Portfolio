'use client';

import { useRef, type RefObject } from 'react';

import { earthFooterConfig, type EarthHorizonConfig } from '@/data/earthHorizon';

import type { HeroStage } from '../lib/createHeroStage';
import { EarthHorizonCanvas } from './EarthHorizonCanvas';
import styles from './PlanetBackdrop.module.css';

interface PlanetBackdropProps {
  /**
   * Which edge of its parent the planet sits on: the hero's hangs from the top, the footer's is the
   * same planet turned over so it rises from the bottom.
   */
  placement: 'top' | 'bottom';
  /** The hero's camera, for the hero. Left out, the planet rests (it still sways). */
  stageRef?: RefObject<HeroStage | null>;
  /** The world to draw; the site's one planet by default */
  config?: EarthHorizonConfig;
}

/**
 * The site's planet, drawn in one place. The hero and the footer both render this, so it is always the
 * same size and shape: the frame is a fixed section tall (see PlanetBackdrop.module.css), and the planet
 * is placed at a fraction of the frame's height, never of the hero's or the footer's. The parent only
 * decides which edge it sits on and how much of the frame it shows.
 */
export function PlanetBackdrop({
  placement,
  stageRef,
  config = earthFooterConfig,
}: PlanetBackdropProps) {
  // The camera that scrolls the hero has nothing to do in the footer: the planet rests there
  const restingStageRef = useRef<HeroStage | null>(null);

  return (
    <div className={styles.frame} data-placement={placement} aria-hidden="true">
      <div className={styles.turn}>
        <EarthHorizonCanvas stageRef={stageRef ?? restingStageRef} config={config} />
      </div>
    </div>
  );
}
