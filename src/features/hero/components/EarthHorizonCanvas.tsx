'use client';

import { useRef, type RefObject } from 'react';

import { earthHorizonConfig, type EarthHorizonConfig } from '@/data/earthHorizon';

import { useEarthHorizon } from '../hooks/useEarthHorizon';
import type { HeroStage } from '../lib/createHeroStage';
import styles from './EarthHorizonCanvas.module.css';

interface EarthHorizonCanvasProps {
  stageRef: RefObject<HeroStage | null>;
  /** The world to draw; the hero's by default */
  config?: EarthHorizonConfig;
}

export function EarthHorizonCanvas({
  stageRef,
  config = earthHorizonConfig,
}: EarthHorizonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEarthHorizon(canvasRef, stageRef, config);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
