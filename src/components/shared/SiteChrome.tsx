'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import GlassMenu from '@/components/shared/GlassMenu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import styles from './SiteChrome.module.css';

/** Bare emblem only, painted in the wordmark's own colour (--color-text-primary) */
const LOGO_MASK = 'url(/image/LogoMark.svg)';

export function SiteChrome() {
  const pathname = usePathname();
  const dict = useDictionary();
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (pathname === '/') {
      const hero = document.querySelector('#Home');
      if (!hero) return;
      const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
        threshold: 0.08,
      });
      observer.observe(hero);
      return () => observer.disconnect();
    }

    if (pathname.startsWith('/admin')) {
      return;
    }

    const update = () => setPastHero(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [pathname]);
  if (pathname.startsWith('/admin')) return null;

  // Compact menu (logo inside pill) covers phones.
  // From md up: centered nav + logo + language switcher; the logo is the bare mark on tablets and
  // the full wordmark from lg.
  return (
    <>
      <div
        aria-hidden="true"
        data-scrolled={pastHero}
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 ${styles.headerBackdrop}`}
      />
      <div
        data-site-chrome
        data-scrolled={pastHero}
        className="pointer-events-none fixed inset-x-0 top-2 z-50 flex justify-center"
      >
        <div className={styles.menuBackdrop}>
          <GlassMenu />
        </div>
      </div>
      <div
        data-site-chrome
        className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto hidden max-w-[96rem] md:block"
      >
        <div className="pointer-events-auto absolute top-4 left-8 lg:top-[1.75rem] lg:left-14">
          <Link
            href="/"
            dir="ltr"
            aria-label={dict.hero.logoAlt}
            className="block rounded-full transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-primary)"
          >
            <span className={styles.logoBadge}>
              <span
                className={styles.logoMark}
                style={{ maskImage: LOGO_MASK, WebkitMaskImage: LOGO_MASK }}
                aria-hidden="true"
              />
            </span>
            <span className={styles.wordmark}>
              <Wordmark className="text-[1.625rem]" />
            </span>
          </Link>
        </div>
        <div className="pointer-events-auto absolute top-[1.875rem] right-8 lg:right-14">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
