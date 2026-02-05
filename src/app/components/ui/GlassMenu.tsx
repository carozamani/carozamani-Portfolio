'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

const navItems = [
  { href: '#Home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#testimonials', label: 'Media' },
  { href: '#contact', label: 'Contact' },
];

export default function GlassMenu() {
  const [currentHash, setCurrentHash] = useState('#Home');
  const [activeRect, setActiveRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  // اسکرول نرم روی کلیک
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;

    isScrollingRef.current = true;
    const topOffset = 0;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - topOffset,
      behavior: 'smooth',
    });

    setCurrentHash(href);
    window.history.replaceState(null, '', href);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  // Intersection Observer برای تشخیص سکشن فعال
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrentHash(`#${entry.target.id}`);
        });
      },
      { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    navItems.forEach((item) => {
      const el = document.querySelector(item.href);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // موقعیت Liquid Slider فعال
  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = Array.from(navRef.current.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === currentHash
    );
    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();
      setActiveRect({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, [currentHash]);

  return (
    <nav className="w-full flex justify-center items-center gap-6 pt-2 pb-6 text-white">
      <section
        ref={navRef}
        className={clsx(
          'relative flex items-center gap-2 p-1 h-16 rounded-full',
          '',
          'backdrop-blur-xl',
          'shadow-lg shadow-black/40'
        )}
      >
        {/* Liquid Glass Slider */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-12 rounded-full transition-all duration-500 ease-out pointer-events-none"
          style={{
            left: activeRect.left,
            width: activeRect.width,
            background: 'rgba(0, 60, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 35px rgba(0, 81, 255, 0.4)',
            border: '1px solid rgba(0, 81, 255, 0.5)',
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
                'relative z-10 text-sm font-medium leading-none px-4 py-2 transition-colors duration-300',
                isActive ? 'text-white' : 'text-white/70 hover:text-white/90'
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
