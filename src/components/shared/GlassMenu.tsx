'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { navItems } from '@/data/navigation';
import { useHasSection } from '@/lib/ContentProvider';
import { locales, type Locale } from '@/lib/i18n/config';
import { useDictionary, useLocale } from '@/lib/i18n/LocaleProvider';
import { scrollToTarget, type ScrollPlan } from '@/lib/scroll/scrollEngine';
import styles from './GlassMenu.module.css';

const MIN_PILL_WIDTH = 60;
/** The bare emblem, painted in the wordmark's colour */
const LOGO_MASK = 'url(/image/LogoMark.svg)';

const SECTION_BY_PATH: Record<string, string> = {
  '/articles': '#testimonials',
  '/podcasts': '#testimonials',
  '/case-studies': '#projects',
};

const CODES: Record<Locale, string> = { en: 'EN', fa: 'FA' };

type ActiveRect = { left: number; width: number };

function measureActive(
  nav: HTMLElement | null,
  activeHash: string,
  minWidth = MIN_PILL_WIDTH,
): ActiveRect {
  if (!nav) return { left: 0, width: 0 };
  const activeLink = Array.from(nav.querySelectorAll('a')).find(
    (a) => a.dataset.hash === activeHash,
  );
  if (!activeLink) return { left: 0, width: 0 };
  const rect = activeLink.getBoundingClientRect();
  const parentRect = nav.getBoundingClientRect();
  const width = Math.max(rect.width, minWidth);
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
  const [desktopActiveRect, setDesktopActiveRect] = useState<ActiveRect>({ left: 0, width: 0 });
  const [dockActiveRect, setDockActiveRect] = useState<ActiveRect>({ left: 0, width: 0 });
  // The phone bar's capsule glides from item to item, but is placed, not animated, on its first paint
  const [dockAnimated, setDockAnimated] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const dockItemsRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
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
    // Animated, not a jump: scrollToTarget already flies over every ScrollHold on the way (see
    // scrollEngine.ts's flyOverHolds) instead of pausing on them, so the menu gets a real scroll.
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
    const desktop = desktopNavRef.current;
    const dock = dockItemsRef.current;
    let frame = 0;
    let cancelled = false;
    const update = () => {
      setDesktopActiveRect(measureActive(desktop, activeHashRef.current));
      const nextDock = measureActive(dock, activeHashRef.current, 0);
      setDockActiveRect(nextDock);
      // The divider after the logo sits halfway between the mark and the first label. The row spaces its
      // items evenly, so that gap depends on the labels and cannot be written in CSS.
      const logoEl = logoRef.current;
      const firstLabel = dock?.querySelector('a span');
      if (logoEl && firstLabel && !langOpen) {
        const gap = firstLabel.getBoundingClientRect().left - logoEl.getBoundingClientRect().right;
        if (gap > 0) logoEl.style.setProperty('--divider-offset', `${gap / 2}px`);
      }
      // Only once the capsule has been placed, so it appears in position instead of sliding in from the edge
      if (nextDock.width > 0 && !frame) frame = requestAnimationFrame(() => setDockAnimated(true));
    };
    update();

    // Web fonts change the labels' widths without resizing either bar
    void document.fonts?.ready.then(() => {
      if (!cancelled) update();
    });

    const observer = new ResizeObserver(update);
    if (desktop) observer.observe(desktop);
    if (dock) observer.observe(dock);
    if (logoRef.current) observer.observe(logoRef.current);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeHash, dict, visibleNavItems.length, langOpen]);

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

  const pillTransition = scrollPlan
    ? ['left', 'width']
        .map((prop) => `${prop} ${scrollPlan.durationMs}ms ${scrollPlan.easing}`)
        .join(', ')
    : 'left var(--duration-slow) var(--ease-out), width var(--duration-slow) var(--ease-out)';

  // The phone bar's capsule moves like the desktop one (same duration and easing, in step with a menu
  // scroll), but never animates its first placement
  const dockTransition = dockAnimated ? pillTransition : 'none';

  const linkStyle = scrollPlan
    ? {
        transitionDuration: `${scrollPlan.durationMs}ms`,
        transitionTimingFunction: scrollPlan.easing,
      }
    : undefined;

  const onLinkClick = (href: string) =>
    isHome
      ? (e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, href)
      : () => setLangOpen(false);

  // Phone bar: the same text labels as the desktop bar; the current one sits in the lit capsule
  const renderDockItems = () =>
    visibleNavItems.map((item) => {
      const isActive = activeHash === item.href;
      const LinkComponent = isHome ? 'a' : Link;
      return (
        <LinkComponent
          key={item.href}
          href={isHome ? item.href : `/${item.href}`}
          data-hash={item.href}
          data-active={isActive}
          aria-current={isActive ? 'true' : undefined}
          onClick={onLinkClick(item.href)}
          className={styles.item}
          style={linkStyle}
        >
          <span className={styles.itemText}>{dict.nav[item.key]}</span>
        </LinkComponent>
      );
    });

  const renderLinks = () =>
    visibleNavItems.map((item) => {
      const isActive = activeHash === item.href;
      const LinkComponent = isHome ? 'a' : Link;
      return (
        <LinkComponent
          key={item.href}
          href={isHome ? item.href : `/${item.href}`}
          data-hash={item.href}
          onClick={onLinkClick(item.href)}
          className={clsx(
            'relative z-10 min-w-fit px-2 py-2 text-center text-xs leading-none font-medium whitespace-nowrap',
            'md:min-w-0 md:flex-none md:shrink-0 md:px-3 md:text-sm lg:px-4',
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
      ref={logoRef}
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
        <section className={styles.pill} aria-label={dict.nav.aria}>
          {logo}
          <div ref={dockItemsRef} className={styles.items}>
            <span
              className={styles.indicator}
              aria-hidden="true"
              style={{
                left: dockActiveRect.left,
                width: dockActiveRect.width,
                opacity: dockActiveRect.width > 0 ? 1 : 0,
                transition: dockTransition,
              }}
            />
            {renderDockItems()}
          </div>
        </section>

        <div
          className={styles.langEdge}
          role="group"
          aria-label={dict.language.label}
          data-current={locale}
        >
          {locales.map((code) => {
            const current = code === locale;
            return (
              <button
                key={code}
                type="button"
                className={styles.langOption}
                aria-pressed={current}
                aria-expanded={current ? langOpen : undefined}
                aria-label={current ? `${dict.language.label}: ${CODES[code]}` : CODES[code]}
                onClick={() => {
                  if (current) {
                    setLangOpen((open) => !open);
                    return;
                  }
                  setLocale(code);
                  setLangOpen(false);
                }}
              >
                {CODES[code]}
              </button>
            );
          })}
        </div>
      </div>

      <nav
        className="pointer-events-auto hidden w-auto items-center justify-center gap-3 px-3 pt-2 pb-6 text-white md:flex"
        aria-label={dict.nav.aria}
      >
        <section
          ref={desktopNavRef}
          className={clsx(
            'relative flex h-16 shrink-0 items-center gap-1 rounded-full px-2 py-1',
            'no-scrollbar max-w-[92vw] overflow-x-auto',
            styles.desktopBar,
          )}
        >
          {activeGlow(desktopActiveRect, false)}
          {renderLinks()}
        </section>
      </nav>
    </>
  );
}
