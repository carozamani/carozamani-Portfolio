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
import SocialIcons, {
  SocialItem,
} from '../button/social-media/SocialIcons';

import TypographyComponent from '../typography/Typography.component';
import styles from './HeroSection.module.css';

/* =========================
   Constants (No magic numbers)
========================= */
const GLOW_RADIUS = 1000;
const GLOW_CENTER = 50;
const GLOW_X_SPEED = 2500;
const GLOW_Y_SPEED = 3000;

/* =========================
   Rotating titles
========================= */
const titlesToRotate: string[] = [
  'User Experience Designer',
  'Product Designer',
  'UI Designer',
  'Interaction Designer',
  'Visual Designer',
  'Creative Problem Solver',
];

/* =========================
   Social Links (NEW API)
   👇 فقط type + href + color
========================= */
const socialLinks: SocialItem[] = [
  {
    type: 'linkedin',
    href: 'https://linkedin.com/in/username',
    color: '#0077B5',
  },
  {
    type: 'dribbble',
    href: 'https://dribbble.com/username',
    color: '#EA4C89',
  },
  {
    type: 'castbox',
    href: 'https://castbox.fm/username',
    color: '#FF5E00',
  },
];

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  /* =========================
     Motion values (no re-render)
  ========================= */
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

  return (
    <section
      className={styles.heroSection}
      aria-labelledby="hero-title"
    >
      {/* =========================
         Grid overlay glow
      ========================= */}
      <motion.div
        className={styles.gridOverlay}
        aria-hidden="true"
        style={{
          maskImage: glowMask,
          WebkitMaskImage: glowMask,
        }}
      />

      {/* =========================
         Profile + Logo
      ========================= */}
      <motion.div
        className={styles.profileWrapper}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.profileImageContainer}>
          <Image
            src="/image/Gro.png"
            alt="Carozamani profile picture"
            width={230}
            height={230}
            priority
            className={styles.profileImage}
          />
        </div>

        <Image
          src="/image/carozamani.png"
          alt="Carozamani logo"
          width={250}
          height={70}
          className={styles.logoImage}
        />
      </motion.div>

      {/* =========================
         Rotating title
      ========================= */}
      <motion.div
        className={styles.titleContainer}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TypographyComponent
          variant="h1"
          id="hero-title"
          color="text-primary"
        >
          <TextRotator texts={titlesToRotate} interval={3500} />
        </TypographyComponent>
      </motion.div>

      {/* =========================
         Subtitle
      ========================= */}
      <motion.div
        className={styles.subtitleContainer}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TypographyComponent variant="body1" color="text-secondary">
          Transforming Concepts into Seamless User Experiences
        </TypographyComponent>
      </motion.div>

      {/* =========================
         Social Icons (FIXED ✅)
      ========================= */}
      <motion.div
        className={styles.socialContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <SocialIcons
          items={socialLinks}
          bordered
        />
      </motion.div>
    </section>
  );
}
