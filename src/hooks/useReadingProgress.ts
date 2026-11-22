'use client';

import { useEffect, type RefObject } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Time constant for easing toward the scroll-derived progress; frame-rate independent. */
const SMOOTHING_MS = 95;
const SETTLED = 0.00045;

/**
 * Drives a top reading-progress element straight from scroll via rAF + CSS variables
 * (no React re-renders on every frame).
 */
export function useReadingProgress(ids: string[], targetRef: RefObject<HTMLElement | null>) {
  const idsKey = ids.join('\n');

  useEffect(() => {
    const target = targetRef.current;
    if (!target || ids.length < 2) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let goal = 0;
    let current = 0;
    let frame = 0;
    let lastTime = 0;

    const measure = () => {
      const sections = idsKey
        .split('\n')
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (sections.length < 2) {
        goal = 0;
        return;
      }

      const first = sections[0];
      const last = sections[sections.length - 1];
      const start = first.getBoundingClientRect().top + window.scrollY;
      const end = last.getBoundingClientRect().top + window.scrollY + last.offsetHeight;
      const cursor = window.scrollY + window.innerHeight * 0.28;
      goal = clamp((cursor - start) / Math.max(end - start, 1), 0, 1);
    };

    const paint = (value: number) => {
      target.style.setProperty('--progress', value.toFixed(4));
      target.dataset.visible = value > 0.012 ? 'true' : 'false';
      target.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    };

    const tick = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;

      const ease = reduceMotion ? 1 : 1 - Math.exp(-dt / SMOOTHING_MS);
      current += (goal - current) * ease;
      paint(current);

      if (Math.abs(goal - current) > SETTLED) frame = requestAnimationFrame(tick);
      else {
        current = goal;
        paint(current);
        lastTime = 0;
      }
    };

    const schedule = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    paint(0);
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resizeObserver = new ResizeObserver(schedule);
    idsKey.split('\n').forEach((id) => {
      const el = document.getElementById(id);
      if (el) resizeObserver.observe(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver.disconnect();
    };
  }, [idsKey, ids.length, targetRef]);
}
