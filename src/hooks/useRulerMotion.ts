'use client';

import { useEffect, useState, type RefObject } from 'react';

type RulerRefs = {
  navRef: RefObject<HTMLElement | null>;
  railRef: RefObject<HTMLElement | null>;
  listRef: RefObject<HTMLOListElement | null>;
};

type Options = RulerRefs & { ids: string[]; sideCount: number };

type Active = { index: number; direction: 'up' | 'down' };

/** Time constant of the easing towards the scroll position; frame-rate independent. */
const SMOOTHING_MS = 110;
const VELOCITY_SMOOTHING_MS = 180;
/** Images per second at which the speed glow saturates. */
const VELOCITY_FULL = 6;
const SETTLED = 0.0005;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Drives the case study ruler straight from the scroll position: an eased position that slides
 * the ticks, a focus point that follows the pointer while it is over the rail, a smoothed scroll
 * speed. Everything per frame is written to the DOM as CSS variables;
 * React only hears about the active and hovered image when they change.
 */
export function useRulerMotion({ ids, sideCount, navRef, railRef, listRef }: Options) {
  const [active, setActive] = useState<Active>({ index: 0, direction: 'down' });
  const [hovered, setHovered] = useState<number | null>(null);
  const idsKey = ids.join('\n');

  useEffect(() => {
    const nav = navRef.current;
    const rail = railRef.current;
    const list = listRef.current;
    if (!nav || !rail || !list) return;

    const slots = Array.from(list.children) as HTMLElement[];
    const images = idsKey
      .split('\n')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (images.length === 0 || slots.length === 0) return;

    const last = images.length - 1;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let current = Number.NaN;
    let focus = Number.NaN;
    let velocity = 0;
    let pointerY: number | null = null;
    let activeIndex = -1;
    let hoveredIndex: number | null = null;
    let frame = 0;
    let lastTime = 0;

    // Position 0 means the first image is centred in the viewport, 0.5 the seam between 0 and 1.
    const readScroll = () => {
      const center = window.innerHeight / 2;
      let progress = 0;
      images.forEach((image, index) => {
        const rect = image.getBoundingClientRect();
        if (rect.top <= center) progress = index + Math.min((center - rect.top) / rect.height, 1);
      });
      target = clamp(progress - 0.5, 0, last);
      return Math.min(Math.floor(progress), last);
    };

    const tick = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;

      const previousTarget = target;
      const index = readScroll();
      const step = slots[0].offsetHeight;

      if (index !== activeIndex) {
        const direction = index > activeIndex ? 'down' : 'up';
        activeIndex = index;
        setActive({ index, direction });
      }

      const ease = reduceMotion ? 1 : 1 - Math.exp(-dt / SMOOTHING_MS);
      current = Number.isNaN(current) ? target : current + (target - current) * ease;

      const pointerFocus = pointerY === null ? null : pointerY / step - 0.5 - sideCount + current;
      const focusTarget = pointerFocus ?? current;
      focus = Number.isNaN(focus) ? focusTarget : focus + (focusTarget - focus) * ease;

      const speed = (Math.abs(target - previousTarget) / dt) * 1000;
      const velocityEase = reduceMotion ? 1 : 1 - Math.exp(-dt / VELOCITY_SMOOTHING_MS);
      velocity += (Math.min(speed / VELOCITY_FULL, 1) - velocity) * velocityEase;

      list.style.transform = `translate3d(0, ${(sideCount - current) * step}px, 0)`;
      slots.forEach((slot, i) => slot.style.setProperty('--d', Math.abs(i - focus).toFixed(3)));
      nav.style.setProperty('--velocity', velocity.toFixed(3));

      const nextHovered = pointerFocus === null ? null : clamp(Math.round(pointerFocus), 0, last);
      if (nextHovered !== hoveredIndex) {
        hoveredIndex = nextHovered;
        setHovered(nextHovered);
      }

      const settled =
        Math.abs(target - current) < SETTLED &&
        Math.abs(focusTarget - focus) < SETTLED &&
        velocity < SETTLED;
      if (settled) lastTime = 0;
      else frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerY = event.clientY - rail.getBoundingClientRect().top;
      schedule();
    };
    const onPointerLeave = () => {
      pointerY = null;
      schedule();
    };

    const resizeObserver = new ResizeObserver(schedule);
    images.forEach((image) => resizeObserver.observe(image));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    rail.addEventListener('pointermove', onPointerMove);
    rail.addEventListener('pointerleave', onPointerLeave);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [idsKey, sideCount, navRef, railRef, listRef]);

  return { active, hovered };
}
