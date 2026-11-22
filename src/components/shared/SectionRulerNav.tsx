'use client';

import clsx from 'clsx';
import { useRef } from 'react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useRulerMotion } from '@/hooks/useRulerMotion';
import styles from './SectionRulerNav.module.css';

export type SectionRulerNavItem = { id: string; label: string };

type SectionRulerNavProps = { items: SectionRulerNavItem[]; ariaLabel: string };

const VISIBLE_EACH_SIDE = 4;

const pad = (n: number) => String(n).padStart(2, '0');

/** Floating section ruler: tracks headings (or any anchored sections) while the reader scrolls. */
export function SectionRulerNav({ items, ariaLabel }: SectionRulerNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ids = items.map(({ id }) => id);
  const { active } = useRulerMotion({
    ids,
    sideCount: VISIBLE_EACH_SIDE,
    navRef,
    railRef,
    listRef,
  });
  useReadingProgress(ids, progressRef);
  const activeItem = items[active.index];

  if (items.length < 2) return null;

  return (
    <>
      <div
        ref={progressRef}
        className={styles.topProgress}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={
          activeItem
            ? `${pad(active.index + 1)} / ${pad(items.length)} — ${activeItem.label}`
            : undefined
        }
      >
        <div className={styles.topProgressTrack} aria-hidden="true">
          <span className={styles.topProgressFill} />
        </div>
      </div>

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
