'use client';

import Image from 'next/image';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';

import TextRotator from './TextRotator';
import SocialIcons from '@/components/ui/SocialIcons';
import { titlesToRotate, heroSocialLinks, heroTagline } from '@/data/hero';
import TypographyComponent from '@/components/ui/Typography';
import styles from './HeroModule.module.css';

const GLOW_RADIUS = 1000;
const GLOW_CENTER = 50;
const GLOW_X_SPEED = 2500;
const GLOW_Y_SPEED = 3000;

export function HeroModule() {
  const reduceMotion = useReducedMotion();

  const glowX = useMotionValue(GLOW_CENTER);
  const glowY = useMotionValue(GLOW_CENTER);

  useAnimationFrame((time) => {
    if (reduceMotion) return;
    glowX.set(GLOW_CENTER + GLOW_CENTER * Math.sin(time / GLOW_X_SPEED));
    glowY.set(GLOW_CENTER + GLOW_CENTER * Math.cos(time / GLOW_Y_SPEED));
  });

  const glowMask = useMotionTemplate`
    radial-gradient(
      circle ${GLOW_RADIUS}px at ${glowX}% ${glowY}%,
      rgba(255,255,255,1) 0%,
      rgba(255,255,255,0) 100%
    )
  `;

  const fadeIn = reduceMotion ? { initial: { opacity: 1 }, animate: { opacity: 1 } } : undefined;

  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
      <motion.div
        className={styles.gridOverlay}
        aria-hidden="true"
        style={{
          maskImage: reduceMotion ? undefined : glowMask,
          WebkitMaskImage: reduceMotion ? undefined : glowMask,
        }}
      />

      <motion.div
        className={styles.profileWrapper}
        initial={fadeIn?.initial ?? { opacity: 0, y: -24 }}
        animate={fadeIn?.animate ?? { opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.profileImageContainer}>
          <div className={styles.flipCard}>
            <div className={styles.flipInner}>
              <div className={styles.flipFace}>
                <Image
                  src="/image/me.png"
                  alt="Carozamani profile picture"
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

        <Image
          src="/image/carozamani.png"
          alt="Carozamani logo"
          width={250}
          height={70}
          className={styles.logoImage}
        />
      </motion.div>

      <motion.div
        className={styles.titleContainer}
        initial={fadeIn?.initial ?? { opacity: 0, y: 16 }}
        animate={fadeIn?.animate ?? { opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.2 }}
      >
        <TypographyComponent variant="h1" id="hero-title" color="text-primary">
          <TextRotator texts={titlesToRotate} interval={3500} />
        </TypographyComponent>
      </motion.div>

      <motion.div
        className={styles.subtitleContainer}
        initial={fadeIn?.initial ?? { opacity: 0, y: 12 }}
        animate={fadeIn?.animate ?? { opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.4 }}
      >
        <TypographyComponent variant="body1" color="text-secondary">
          {heroTagline}
        </TypographyComponent>
      </motion.div>

      <motion.div
        className={styles.socialContainer}
        initial={fadeIn?.initial ?? { opacity: 0, scale: 0.95 }}
        animate={fadeIn?.animate ?? { opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.6 }}
      >
        <SocialIcons items={heroSocialLinks} bordered />
      </motion.div>
    </section>
  );
}
