'use client';

import { useRef, useState, type PointerEvent, type RefObject } from 'react';
import Image from 'next/image';

import { useMedallion } from '../hooks/useMedallion';
import type { HeroStage } from '../lib/createHeroStage';
import styles from './PortraitMedallion.module.css';

interface PortraitMedallionProps {
  stageRef: RefObject<HeroStage | null>;
  /** The hero reads this ring's position to put the grid glow on its lower edge. */
  ringRef: RefObject<HTMLDivElement | null>;
  profileAlt: string;
}

// What next/image builds its srcset from; the size on screen is --medallion-size in the CSS
const FACE_SIZE_PX = 190;

// The portrait and the logo are ordinary images: they are the fallback when WebGL is missing, the hover
// target and the accessible name, and useMedallion reads their pixels as the two faces of the coin.
export function PortraitMedallion({ stageRef, ringRef, profileAlt }: PortraitMedallionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Where the turn is heading: 0 shows the portrait, 1 the logo
  const flipRef = useRef(0);
  const [live, setLive] = useState(false);

  useMedallion({ canvasRef, stageRef, flipRef, onReadyChange: setLive });

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') flipRef.current = 1;
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') flipRef.current = 0;
  };

  // Touch has no hover: one tap turns the coin over and the next one turns it back
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') flipRef.current = flipRef.current === 0 ? 1 : 0;
  };

  return (
    <div ref={ringRef} className={styles.ring} data-webgl={live}>
      <div
        className={styles.card}
        data-medallion-card
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
      >
        <div className={styles.flipInner}>
          <div className={styles.face}>
            <Image
              data-medallion-face="front"
              src="/image/me.png"
              alt={profileAlt}
              width={FACE_SIZE_PX}
              height={FACE_SIZE_PX}
              loading="eager"
              fetchPriority="high"
              className={styles.faceImage}
            />
          </div>
          <div className={`${styles.face} ${styles.faceBack}`}>
            <Image
              data-medallion-face="back"
              src="/image/LogoPrimary.svg"
              alt=""
              aria-hidden="true"
              width={FACE_SIZE_PX}
              height={FACE_SIZE_PX}
              loading="eager"
              className={styles.faceImage}
            />
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
