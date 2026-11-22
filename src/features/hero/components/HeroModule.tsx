'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { FiArrowDown } from 'react-icons/fi';

import Button from '@/components/ui/Button';
import SocialIcons from '@/components/ui/SocialIcons';
import { heroSocialLinks } from '@/data/hero';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { scrollToTarget } from '@/lib/scroll/scrollEngine';
import TypographyComponent from '@/components/ui/Typography';
import { useHeroStage } from '../hooks/useHeroStage';
import type { HeroStage } from '../lib/createHeroStage';
import { EarthHorizonCanvas } from './EarthHorizonCanvas';
import styles from './HeroModule.module.css';

export function HeroModule() {
  const { hero } = useDictionary();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HeroStage>(null);

  useHeroStage(sectionRef, stageRef);

  // Centre the grid glow on the bottom border of the profile ring. offsetLeft/offsetTop ignore
  // transforms, so the scroll-out animation on the layers cannot skew the measurement.
  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    const ring = ringRef.current;
    if (!section || !grid || !ring) return;

    const placeGlow = () => {
      let x = ring.offsetWidth / 2;
      let y = ring.offsetHeight;
      let node: HTMLElement | null = ring;
      while (node && node !== section) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      grid.style.setProperty('--glow-x', `${x}px`);
      grid.style.setProperty('--glow-y', `${y}px`);
    };

    placeGlow();
    const observer = new ResizeObserver(placeGlow);
    observer.observe(section);
    observer.observe(ring);
    // Web fonts can shift the stack after first paint without resizing the section
    void document.fonts?.ready.then(placeGlow);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.heroSection} aria-labelledby="hero-title">
      <EarthHorizonCanvas stageRef={stageRef} />
      <div ref={gridRef} className={styles.gridOverlay} data-stage-grid aria-hidden="true" />

      <div className={styles.layer} data-stage-layer="near">
        <div className={`${styles.profileWrapper} ${styles.enter}`}>
          <div ref={ringRef} className={styles.profileImageContainer}>
            <div className={styles.flipCard}>
              <div className={styles.flipInner}>
                <div className={styles.flipFace}>
                  <Image
                    src="/image/me.png"
                    alt={hero.profileAlt}
                    width={190}
                    height={190}
                    priority
                    className={styles.profileImage}
                  />
                </div>
                <div className={`${styles.flipFace} ${styles.flipBack}`}>
                  <Image
                    src="/image/LogoPrimary.svg"
                    alt=""
                    aria-hidden="true"
                    width={190}
                    height={190}
                    className={styles.flipBackImage}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={clsx(styles.nameLine, !hero.showWordmark && styles.nameLinePersian)}>
            <span className={styles.greeting}>{hero.greeting}</span>
            {hero.showWordmark ? (
              <Wordmark />
            ) : (
              <span className={styles.name}>
                <span className={styles.nameFirst}>{hero.nameFirst}</span>
                {hero.nameLast}
              </span>
            )}
            {hero.greetingEnd && <span className={styles.greeting}>{hero.greetingEnd}</span>}
          </div>
        </div>
      </div>

      <div className={styles.layer} data-stage-layer="mid">
        <div className={`${styles.titleContainer} ${styles.enter}`}>
          <TypographyComponent variant="h1" id="hero-title" color="text-primary">
            {hero.title}
          </TypographyComponent>
          <TypographyComponent variant="body1" color="text-secondary" className={styles.subtitle}>
            {hero.subtitle}
          </TypographyComponent>
        </div>
      </div>

      <div className={styles.layer} data-stage-layer="far">
        <div className={`${styles.ctaContainer} ${styles.enter}`}>
          <Button
            text={hero.ctaWork}
            variant="glass"
            iconRight={<FiArrowDown aria-hidden="true" />}
            className={styles.seeWork}
            onClick={() => void scrollToTarget('#projects')}
          />
          <SocialIcons items={heroSocialLinks} bordered />
        </div>
      </div>
    </section>
  );
}
