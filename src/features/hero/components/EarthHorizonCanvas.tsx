'use client';

import { useRef, type RefObject } from 'react';

import { useEarthHorizon } from '../hooks/useEarthHorizon';
import type { HeroStage } from '../lib/createHeroStage';
import styles from './EarthHorizonCanvas.module.css';

interface EarthHorizonCanvasProps {
  stageRef: RefObject<HeroStage | null>;
}

export function EarthHorizonCanvas({ stageRef }: EarthHorizonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEarthHorizon(canvasRef, stageRef);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
