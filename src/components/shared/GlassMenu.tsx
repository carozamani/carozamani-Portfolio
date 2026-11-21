'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { navItems } from '@/data/navigation';
import { useHasSection } from '@/lib/ContentProvider';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { scrollToTarget, type ScrollPlan } from '@/lib/scroll/scrollEngine';

const MIN_PILL_WIDTH = 60;

const SECTION_BY_PATH: Record<string, string> = {
  '/articles': '#testimonials',
  '/case-studies': '#projects',
};

export default function GlassMenu() {
  const pathname = usePathname();
  const dict = useDictionary();
  const isHome = pathname === '/';
  const hasProjects = useHasSection('projects');
  const hasMedia = useHasSection('media');
  const visibleNavItems = navItems.filter(
    (item) => (item.key !== 'projects' || hasProjects) && (item.key !== 'media' || hasMedia),
  );
  const [currentHash, setCurrentHash] = useState('#Home');
  const [activeRect, setActiveRect] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const scrollRunRef = useRef(0);
  // While a nav click scrolls the page, the pill and the labels borrow its timing so they land together
  const [scrollPlan, setScrollPlan] = useState<ScrollPlan | null>(null);

  const pageSection = Object.entries(SECTION_BY_PATH).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];
  const activeHash = isHome ? currentHash : (pageSection ?? '');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;

    // Clicking another item mid-scroll starts a new run, and only the latest run may release the lock
    scrollRunRef.current += 1;
    const run = scrollRunRef.current;
    isScrollingRef.current = true;

    setCurrentHash(href);
    window.history.replaceState(null, '', href);

    // The lock keeps the observer from fighting the animation. scrollToTarget always resolves, at
    // the latest by its deadline, so a wheel gesture that interrupts the scroll can't leave it on.
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
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const activeLink = Array.from(nav.querySelectorAll('a')).find(
        (a) => a.dataset.hash === activeHash,
      );
      if (!activeLink) return setActiveRect({ left: 0, width: 0 });
      const rect = activeLink.getBoundingClientRect();
      const parentRect = nav.getBoundingClientRect();
      const width = Math.max(rect.width, MIN_PILL_WIDTH);
      const center = rect.left - parentRect.left + nav.scrollLeft + rect.width / 2;
      setActiveRect({ left: Math.max(0, center - width / 2), width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeHash, dict, visibleNavItems.length]);

  const pillTransition = scrollPlan
    ? ['left', 'width']
        .map((prop) => `${prop} ${scrollPlan.durationMs}ms ${scrollPlan.easing}`)
        .join(', ')
    : 'left var(--duration-slow) var(--ease-out), width var(--duration-slow) var(--ease-out)';

  return (
    <nav
      className="pointer-events-auto flex w-full items-center justify-center gap-1.5 ps-0 pe-1.5 pt-2 pb-6 text-white min-[520px]:gap-3 min-[520px]:pe-3 sm:w-auto sm:gap-3 sm:px-3"
      aria-label={dict.nav.aria}
    >
      <section
        ref={navRef}
        className={clsx(
          // phones: the bar slides in from the start edge, so that side is flush and square
          'relative flex h-14 min-w-0 flex-1 items-center gap-0.5 rounded-e-full py-1 ps-3 pe-1.5 min-[520px]:h-16 min-[520px]:gap-1.5 min-[520px]:ps-4 min-[520px]:pe-2 sm:h-16 sm:flex-none sm:shrink-0 sm:gap-1 sm:rounded-full sm:px-2',
          'no-scrollbar max-w-full overflow-x-auto sm:max-w-[92vw]',
          'border border-s-0 border-white/5 sm:border-s',
          'bg-black/30 backdrop-blur-xl',
          'shadow-lg shadow-black/40',
        )}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-11 -translate-y-1/2 rounded-full min-[520px]:h-12 sm:h-12"
          style={{
            left: activeRect.left,
            width: activeRect.width,
            background: 'rgba(0, 60, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 18px rgba(0, 81, 255, 0.4)',
            border: '1px solid rgba(0, 81, 255, 0.5)',
            transition: pillTransition,
          }}
        />

        {visibleNavItems.map((item) => {
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
                  : undefined
              }
              className={clsx(
                'relative z-10 min-w-fit flex-1 px-2 py-2 text-center text-xs leading-none font-medium whitespace-nowrap min-[520px]:px-3 min-[520px]:text-sm sm:min-w-0 sm:flex-none sm:shrink-0 sm:px-4 sm:text-sm',
                'transition-colors duration-300',
                'focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]',
                isActive ? 'text-white' : 'text-white/70 hover:text-white/90',
              )}
              style={
                scrollPlan
                  ? {
                      transitionDuration: `${scrollPlan.durationMs}ms`,
                      transitionTimingFunction: scrollPlan.easing,
                    }
                  : undefined
              }
            >
              {dict.nav[item.key]}
            </LinkComponent>
          );
        })}
      </section>
      {/* Room for the language switcher, which SiteChrome keeps fixed on the page itself */}
      <div className="w-12 shrink-0 sm:hidden" aria-hidden="true" />
    </nav>
  );
}
