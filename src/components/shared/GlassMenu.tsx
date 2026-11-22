'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { FiChevronLeft } from 'react-icons/fi';
import { navItems } from '@/data/navigation';
import { useHasSection } from '@/lib/ContentProvider';
import { locales, type Locale } from '@/lib/i18n/config';
import { useDictionary, useLocale } from '@/lib/i18n/LocaleProvider';
import { scrollToTarget, type ScrollPlan } from '@/lib/scroll/scrollEngine';
import styles from './GlassMenu.module.css';

const MIN_PILL_WIDTH = 60;
/** Keep in sync with `--chrome-ms` in GlassMenu.module.css */
const CHROME_MS = 420;
/** Bare emblem only — no circular badge art from LogoPrimary */
const LOGO_MASK = 'url(/image/LogoMark.svg)';

const SECTION_BY_PATH: Record<string, string> = {
  '/articles': '#testimonials',
  '/podcasts': '#testimonials',
  '/case-studies': '#projects',
};

const CODES: Record<Locale, string> = { en: 'EN', fa: 'FA' };

type ActiveRect = { left: number; width: number };

function measureActive(nav: HTMLElement | null, activeHash: string): ActiveRect {
  if (!nav) return { left: 0, width: 0 };
  const activeLink = Array.from(nav.querySelectorAll('a')).find(
    (a) => a.dataset.hash === activeHash,
  );
  if (!activeLink) return { left: 0, width: 0 };
  const rect = activeLink.getBoundingClientRect();
  const parentRect = nav.getBoundingClientRect();
  const width = Math.max(rect.width, MIN_PILL_WIDTH);
  const center = rect.left - parentRect.left + nav.scrollLeft + rect.width / 2;
  return { left: Math.max(0, center - width / 2), width };
}

export default function GlassMenu() {
  const pathname = usePathname();
  const dict = useDictionary();
  const { locale, setLocale } = useLocale();
  const isHome = pathname === '/';
  const hasProjects = useHasSection('projects');
  const hasMedia = useHasSection('media');
  const visibleNavItems = navItems.filter(
    (item) => (item.key !== 'projects' || hasProjects) && (item.key !== 'media' || hasMedia),
  );
  const [currentHash, setCurrentHash] = useState('#Home');
  const [compactActiveRect, setCompactActiveRect] = useState<ActiveRect>({ left: 0, width: 0 });
  const [desktopActiveRect, setDesktopActiveRect] = useState<ActiveRect>({ left: 0, width: 0 });
  const [langOpen, setLangOpen] = useState(false);
  const [glowTracking, setGlowTracking] = useState(false);
  const compactPillRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const scrollRunRef = useRef(0);
  const activeHashRef = useRef('');
  const [scrollPlan, setScrollPlan] = useState<ScrollPlan | null>(null);

  const pageSection = Object.entries(SECTION_BY_PATH).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];
  const activeHash = isHome ? currentHash : (pageSection ?? '');
  activeHashRef.current = activeHash;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;

    scrollRunRef.current += 1;
    const run = scrollRunRef.current;
    isScrollingRef.current = true;
    setLangOpen(false);

    setCurrentHash(href);
    window.history.replaceState(null, '', href);

    setScrollPlan(null);
    void scrollToTarget(el, { onPlan: setScrollPlan }).then(() => {
      if (run !== scrollRunRef.current) return;
      isScrollingRef.current = false;
      setScrollPlan(null);
    });
  };

  useEffect(() => {
    if (!isHome) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrentHash(`#${entry.target.id}`);
        });
      },
      { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    visibleNavItems.forEach((item) => {
      const el = document.querySelector(item.href);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the item count, the array is rebuilt each render
  }, [isHome, visibleNavItems.length]);

  useEffect(() => {
    const compact = compactPillRef.current;
    const desktop = desktopNavRef.current;
    const update = () => {
      setCompactActiveRect(measureActive(compact, activeHashRef.current));
      setDesktopActiveRect(measureActive(desktop, activeHashRef.current));
    };
    update();

    const observer = new ResizeObserver(update);
    if (compact) observer.observe(compact);
    if (desktop) observer.observe(desktop);
    return () => observer.disconnect();
  }, [activeHash, dict, visibleNavItems.length, langOpen]);

  // Logo collapse / lang rail expand shifts nav items; keep the active glow locked to
  // the active link for the whole chrome transition instead of lagging behind with its own ease.
  useEffect(() => {
    const compact = compactPillRef.current;
    let raf = 0;
    const startedAt = performance.now();
    setGlowTracking(true);

    const tick = (now: number) => {
      setCompactActiveRect(measureActive(compact, activeHashRef.current));
      if (now - startedAt < CHROME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setCompactActiveRect(measureActive(compact, activeHashRef.current));
      setGlowTracking(false);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setGlowTracking(false);
    };
  }, [langOpen]);

  useEffect(() => {
    if (!langOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!compactRef.current?.contains(event.target as Node)) setLangOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLangOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [langOpen]);

  const pillTransition = glowTracking
    ? 'none'
    : scrollPlan
      ? ['left', 'width']
          .map((prop) => `${prop} ${scrollPlan.durationMs}ms ${scrollPlan.easing}`)
          .join(', ')
      : 'left var(--duration-slow) var(--ease-out), width var(--duration-slow) var(--ease-out)';

  const linkStyle = scrollPlan
    ? {
        transitionDuration: `${scrollPlan.durationMs}ms`,
        transitionTimingFunction: scrollPlan.easing,
      }
    : undefined;

  const renderLinks = (compact: boolean) =>
    visibleNavItems.map((item) => {
      const isActive = activeHash === item.href;
      const LinkComponent = isHome ? 'a' : Link;
      return (
        <LinkComponent
          key={item.href}
          href={isHome ? item.href : `/${item.href}`}
          data-hash={item.href}
          onClick={
            isHome
              ? (e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, item.href)
              : () => setLangOpen(false)
          }
          className={clsx(
            'relative z-10 min-w-fit px-2 py-2 text-center text-xs leading-none font-medium whitespace-nowrap',
            compact
              ? 'flex-1 min-[520px]:px-3 min-[520px]:text-sm'
              : 'lg:min-w-0 lg:flex-none lg:shrink-0 lg:px-4 lg:text-sm',
            'transition-colors duration-300',
            'focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]',
            isActive ? 'text-white' : 'text-white/70 hover:text-white/90',
          )}
          style={linkStyle}
        >
          {dict.nav[item.key]}
        </LinkComponent>
      );
    });

  const activeGlow = (rect: ActiveRect, compact: boolean) => (
    <div
      className={clsx(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full',
        compact ? 'h-9' : 'h-12',
      )}
      style={{
        left: rect.left,
        width: rect.width,
        background: 'rgba(0, 60, 255, 0.2)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 18px rgba(0, 81, 255, 0.4)',
        border: '1px solid rgba(0, 81, 255, 0.5)',
        opacity: rect.width > 0 ? 1 : 0,
        transition: pillTransition,
      }}
    />
  );

  const logo = (
    <Link
      href="/"
      className={styles.logo}
      aria-label={dict.hero.logoAlt}
      onClick={() => setLangOpen(false)}
    >
      <span
        className={styles.logoMark}
        style={{ maskImage: LOGO_MASK, WebkitMaskImage: LOGO_MASK }}
        aria-hidden="true"
      />
    </Link>
  );

  return (
    <>
      <div ref={compactRef} className={styles.compact} data-lang-open={langOpen} dir="ltr">
        <section ref={compactPillRef} className={styles.pill} aria-label={dict.nav.aria}>
          {activeGlow(compactActiveRect, true)}
          {logo}
          {renderLinks(true)}
        </section>

        <div className={styles.langRail} role="group" aria-label={dict.language.label}>
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              className={styles.langOption}
              aria-pressed={code === locale}
              aria-label={CODES[code]}
              onClick={() => {
                setLocale(code);
                setLangOpen(false);
              }}
            >
              {CODES[code]}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.edgeArrow}
          aria-label={dict.language.label}
          aria-expanded={langOpen}
          onClick={() => setLangOpen((open) => !open)}
        >
          <FiChevronLeft className={styles.edgeArrowIcon} aria-hidden="true" />
        </button>
      </div>

      <nav
        className="pointer-events-auto hidden w-auto items-center justify-center gap-3 px-3 pt-2 pb-6 text-white lg:flex"
        aria-label={dict.nav.aria}
      >
        <section
          ref={desktopNavRef}
          className={clsx(
            'relative flex h-16 shrink-0 items-center gap-1 rounded-full px-2 py-1',
            'no-scrollbar max-w-[92vw] overflow-x-auto',
            'border border-white/5',
            'bg-black/30 backdrop-blur-xl',
            'shadow-lg shadow-black/40',
          )}
        >
          {activeGlow(desktopActiveRect, false)}
          {renderLinks(false)}
        </section>
      </nav>
    </>
  );
}
