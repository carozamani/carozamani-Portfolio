'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { navItems } from '@/data/navigation';

export default function GlassMenu() {
  const [currentHash, setCurrentHash] = useState('#Home');
  const [activeRect, setActiveRect] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;

    isScrollingRef.current = true;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY,
      behavior: 'smooth',
    });

    setCurrentHash(href);
    window.history.replaceState(null, '', href);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrentHash(`#${entry.target.id}`);
        });
      },
      { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    navItems.forEach((item) => {
      const el = document.querySelector(item.href);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = Array.from(navRef.current.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === currentHash,
    );
    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();
      setActiveRect({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, [currentHash]);

  return (
    <nav
      className="flex w-full items-center justify-center gap-6 px-3 pt-2 pb-6 text-white"
      aria-label="Main navigation"
    >
      <section
        ref={navRef}
        className={clsx(
          'relative flex h-14 items-center gap-0.5 rounded-full p-1 sm:h-16 sm:gap-2',
          'no-scrollbar max-w-[92vw] overflow-x-auto',
          'backdrop-blur-xl',
          'shadow-lg shadow-black/40',
        )}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-11 -translate-y-1/2 rounded-full sm:h-12"
          style={{
            left: activeRect.left,
            width: activeRect.width,
            background: 'rgba(0, 60, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 35px rgba(0, 81, 255, 0.4)',
            border: '1px solid rgba(0, 81, 255, 0.5)',
            transition:
              'left var(--duration-slow) var(--ease-out), width var(--duration-slow) var(--ease-out)',
          }}
        />

        {navItems.map((item) => {
          const isActive = currentHash === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={clsx(
                'relative z-10 shrink-0 px-3 py-2 text-xs leading-none font-medium sm:px-4 sm:text-sm',
                'transition-colors duration-300',
                'focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]',
                isActive ? 'text-white' : 'text-white/70 hover:text-white/90',
              )}
            >
              {item.label}
            </a>
          );
        })}
      </section>
    </nav>
  );
}
