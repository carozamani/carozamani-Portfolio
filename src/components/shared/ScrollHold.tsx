'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './ScrollHold.module.css';

type ScrollHoldProps = {
  children: ReactNode;
  /** Extra scroll distance, in viewport heights x 100, that the section stays pinned for. */
  hold?: number;
};

/**
 * Pauses a section while the page keeps scrolling: once the section has been read through (its bottom
 * meets the bottom of the screen, or it is centred if it is shorter than the screen) it stays put for
 * `hold` of extra scroll, then moves on. The pin offset depends on the section's height, so it is measured.
 */
export function ScrollHold({ children, hold = 150 }: ScrollHoldProps) {
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pin.current;
    if (!el) return;
    const measure = () => {
      const free = window.innerHeight - el.offsetHeight;
      el.style.setProperty('--pin-top', `${free > 0 ? free / 2 : free}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className={styles.track} data-scroll-hold style={{ '--hold': hold } as CSSProperties}>
      <div className={styles.pin} ref={pin}>
        {children}
      </div>
    </div>
  );
}
