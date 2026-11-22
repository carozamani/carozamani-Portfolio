'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './NotFoundStage.module.css';

// How long the pointer has to rest before the light starts drifting on its own
const IDLE_MS = 2200;

/**
 * Owns the page's one piece of motion state. The cursor (or, on touch and when the pointer rests,
 * a slow drift) is eased and written to CSS custom properties on the stage; every layer reads
 * what it needs and moves itself, so React never re-renders.
 *   --px / --py   -1..1 parallax across the viewport
 *   --cx / --cy   pointer position in viewport pixels (the soft light on the whole page)
 *   --mx / --my   the same point as a percentage of the numeral (the spotlight inside the glyphs)
 */
export function NotFoundStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const numeral = stage.querySelector<HTMLElement>('[data-numeral]');
    const write = (name: string, value: number) => stage.style.setProperty(name, value.toFixed(3));

    const pointer = { x: 0.5, y: 0.45, movedAt: -Infinity };
    const eased = { x: 0.5, y: 0.45 };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
      pointer.movedAt = performance.now();
    };

    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      const idle = now - pointer.movedAt > IDLE_MS;
      const seconds = now / 1000;
      const targetX = idle ? 0.5 + 0.34 * Math.sin(seconds * 0.45) : pointer.x;
      const targetY = idle ? 0.42 + 0.1 * Math.sin(seconds * 0.7 + 1.2) : pointer.y;
      const follow = 1 - Math.exp(-dt * (idle ? 1.4 : 7));
      eased.x += (targetX - eased.x) * follow;
      eased.y += (targetY - eased.y) * follow;

      const { innerWidth, innerHeight } = window;
      write('--px', (eased.x - 0.5) * 2);
      write('--py', (eased.y - 0.5) * 2);
      write('--cx', eased.x * innerWidth);
      write('--cy', eased.y * innerHeight);
      if (numeral) {
        const box = numeral.getBoundingClientRect();
        write('--mx', ((eased.x * innerWidth - box.left) / box.width) * 100);
        write('--my', ((eased.y * innerHeight - box.top) / box.height) * 100);
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.horizon} aria-hidden="true" />
      {children}
    </div>
  );
}
