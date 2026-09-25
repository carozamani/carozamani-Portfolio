'use client';

import Image from 'next/image';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';

import { FiArrowDown } from 'react-icons/fi';

import Button from '@/components/ui/Button';
import SocialIcons from '@/components/ui/SocialIcons';
import { heroSocialLinks } from '@/data/hero';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import TypographyComponent from '@/components/ui/Typography';
import styles from './HeroModule.module.css';

const GLOW_RADIUS = 1000;
const GLOW_CENTER = 50;
const GLOW_X_SPEED = 2500;
const GLOW_Y_SPEED = 3000;

function scrollToSection(id: string, instant: boolean | null) {
  document.getElementById(id)?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
}

export function HeroModule() {
  const reduceMotion = useReducedMotion();
  const { hero } = useDictionary();

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

        <Wordmark className={styles.logoImage} />
      </motion.div>

      <motion.div
        className={styles.titleContainer}
        initial={fadeIn?.initial ?? { opacity: 0, y: 16 }}
        animate={fadeIn?.animate ?? { opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.2 }}
      >
        <TypographyComponent variant="h1" id="hero-title" color="text-primary">
          {hero.title}
        </TypographyComponent>
      </motion.div>

      <motion.div
        className={styles.ctaContainer}
        initial={fadeIn?.initial ?? { opacity: 0, y: 12 }}
        animate={fadeIn?.animate ?? { opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.5 }}
      >
        <Button
          text={hero.ctaWork}
          variant="glass"
          iconRight={<FiArrowDown aria-hidden="true" />}
          className={styles.seeWork}
          onClick={() => scrollToSection('projects', reduceMotion)}
        />
        <SocialIcons items={heroSocialLinks} bordered />
      </motion.div>
    </section>
  );
}
