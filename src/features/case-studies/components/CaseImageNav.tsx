'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './CaseImageNav.module.css';

export type CaseImageNavItem = { id: string; label: string };

type CaseImageNavProps = { items: CaseImageNavItem[]; ariaLabel: string };

export function CaseImageNav({ items, ariaLabel }: CaseImageNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <ol className={styles.list}>
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(styles.item, id === activeId && styles.active)}
              aria-current={id === activeId ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className={styles.label}>{label}</span>
              <span className={styles.dot} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
