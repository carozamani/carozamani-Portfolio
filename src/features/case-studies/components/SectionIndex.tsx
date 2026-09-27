'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './SectionIndex.module.css';

export type SectionIndexItem = { id: string; label: string };

export function SectionIndex({ items }: { items: SectionIndexItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const targets = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    // Stays hidden while the hero fills the viewport — a fixed, vertically
    // centered nav would otherwise sit on top of the hero title. Reveal is
    // tied to a fixed scroll threshold (not an IntersectionObserver on a
    // single section), so it stays visible all the way to the footer instead
    // of hiding again once the first tracked section scrolls out of view.
    const firstTarget = document.getElementById(items[0]?.id ?? '');
    if (!firstTarget) return;

    let threshold = 0;
    const measure = () => {
      threshold = firstTarget.getBoundingClientRect().top + window.scrollY;
    };
    const onScroll = () => {
      setRevealed(window.scrollY + window.innerHeight * 0.5 > threshold);
    };

    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      className={clsx(styles.index, revealed && styles.revealed)}
      aria-hidden={!revealed}
      aria-label="On this page"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={clsx(styles.item, item.id === activeId && styles.active)}
        >
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
