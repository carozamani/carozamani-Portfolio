'use client';

import Image from 'next/image';
import { FiArrowDown } from 'react-icons/fi';

import Button from '@/components/ui/Button';
import SocialIcons from '@/components/ui/SocialIcons';
import { heroSocialLinks } from '@/data/hero';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import TypographyComponent from '@/components/ui/Typography';
import styles from './HeroModule.module.css';

// The glow drift and entrance animations live in CSS so the hero ships no animation library
function scrollToSection(id: string) {
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
}

export function HeroModule() {
  const { hero } = useDictionary();

  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
      <div className={styles.gridOverlay} aria-hidden="true" />

      <div className={`${styles.profileWrapper} ${styles.enter}`}>
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
      </div>

      <div className={`${styles.titleContainer} ${styles.enter}`}>
        <TypographyComponent variant="h1" id="hero-title" color="text-primary">
          {hero.title}
        </TypographyComponent>
      </div>

      <div className={`${styles.ctaContainer} ${styles.enter}`}>
        <Button
          text={hero.ctaWork}
          variant="glass"
          iconRight={<FiArrowDown aria-hidden="true" />}
          className={styles.seeWork}
          onClick={() => scrollToSection('projects')}
        />
        <SocialIcons items={heroSocialLinks} bordered />
      </div>
    </section>
  );
}
