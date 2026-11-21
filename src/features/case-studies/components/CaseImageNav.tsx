'use client';

import clsx from 'clsx';
import { useRef } from 'react';
import { useRulerMotion } from '../hooks/useRulerMotion';
import styles from './CaseImageNav.module.css';

export type CaseImageNavItem = { id: string; label: string };

type CaseImageNavProps = { items: CaseImageNavItem[]; ariaLabel: string };

const VISIBLE_EACH_SIDE = 4;

const pad = (n: number) => String(n).padStart(2, '0');

export function CaseImageNav({ items, ariaLabel }: CaseImageNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const { active } = useRulerMotion({
    ids: items.map(({ id }) => id),
    sideCount: VISIBLE_EACH_SIDE,
    navRef,
    railRef,
    listRef,
  });

  if (items.length < 2) return null;

  return (
    <>
      <nav ref={navRef} className={styles.nav} aria-label={ariaLabel}>
        <div ref={railRef} className={styles.rail}>
          <span className={styles.spine} aria-hidden="true" />
          <span className={styles.marker} aria-hidden="true" />
          <ol ref={listRef} className={styles.list}>
            {items.map(({ id, label }, index) => {
              const isActive = index === active.index;
              return (
                <li key={id} className={styles.slot}>
                  <a
                    href={`#${id}`}
                    className={clsx(styles.row, isActive && styles.active)}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className={styles.num}>{pad(index + 1)}</span>
                    <span className={styles.name} dir="auto">
                      {label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Where the margin is too narrow for the list, the current section is pinned to the corner. */}
      <p className={styles.pill} aria-hidden="true">
        <span className={styles.pillNum}>
          {pad(active.index + 1)}
          <span className={styles.pillTotal}>/{pad(items.length)}</span>
        </span>
        <span key={active.index} className={styles.pillName} dir="auto">
          {items[active.index]?.label}
        </span>
      </p>
    </>
  );
}
