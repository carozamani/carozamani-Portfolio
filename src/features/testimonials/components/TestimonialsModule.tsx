'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { testimonials } from '@/data/testimonials';
import { useLocale } from '@/lib/i18n/LocaleProvider';

import { TestimonialCard } from './TestimonialCard';
import styles from './TestimonialsModule.module.css';

interface DragState {
  startX: number;
  startScroll: number;
  pointerId: number;
}

// The row never ends: the recommendations are laid out in several identical runs, and whenever the
// scrolling comes to rest, the row quietly steps back to the same card in the middle run. Nothing
// moves on screen on its own; the row only scrolls when the visitor swipes, drags or uses the arrow
// keys. A single recommendation has nothing to loop.
const COUNT = testimonials.length;
const COPIES = COUNT < 2 ? 1 : COUNT >= 5 ? 3 : 5;
const MIDDLE_COPY = (COPIES - 1) / 2;
/** How long the scrolling must be still before the row steps back to the middle run */
const REST_MS = 150;

const cards = Array.from({ length: COPIES }, (_, copy) =>
  testimonials.map((testimonial) => ({ testimonial, copy })),
).flat();

const middleOf = (track: HTMLElement) => {
  const box = track.getBoundingClientRect();
  return box.left + box.width / 2;
};

const centreOf = (item: HTMLElement) => {
  const rect = item.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

// Reads positions on screen rather than scrollLeft, so it behaves the same in left-to-right and
// right-to-left pages.
const nearestCard = (track: HTMLElement) => {
  const middle = middleOf(track);
  const items = Array.from(track.children) as HTMLElement[];
  let index = -1;
  let best = Number.POSITIVE_INFINITY;
  items.forEach((item, position) => {
    const distance = Math.abs(centreOf(item) - middle);
    if (distance < best) {
      best = distance;
      index = position;
    }
  });
  return { items, index };
};

// Moves the row by a distance on screen, with no animation and no snapping in the way.
const jumpBy = (track: HTMLElement, shift: number) => {
  if (track.style.scrollSnapType === 'none') {
    track.scrollLeft += shift;
    return;
  }
  track.style.scrollSnapType = 'none';
  track.scrollLeft += shift;
  requestAnimationFrame(() => {
    if (track.hasAttribute('data-dragging')) return;
    track.style.scrollSnapType = '';
  });
};

/**
 * Recommendations as a row of Telegram-style message cards. The row stays still until the visitor swipes
 * it, drags it (mouse), or uses the arrow keys; then it snaps so one card rests in the middle. The card
 * in the middle is shown at full size; the ones beside it are smaller and dimmer, and the scale follows
 * the scroll smoothly so cards grow as they arrive in the middle and shrink as they leave.
 */
export function TestimonialsModule() {
  const { dict, locale } = useLocale();
  const trackRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef(0);
  const restRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);

  // Sets --focus (1 = exactly in the middle, 0 = a full card away or more) on every card
  const updateFocus = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const middle = middleOf(track);
    let closest: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const child of Array.from(track.children)) {
      const item = child as HTMLElement;
      const distance = Math.abs(centreOf(item) - middle);
      const reach = item.offsetWidth * 1.05;
      const focus = Math.max(0, 1 - distance / reach);
      item.style.setProperty('--focus', focus.toFixed(3));
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    }

    for (const child of Array.from(track.children)) {
      const item = child as HTMLElement;
      if (item === closest) item.setAttribute('data-active', 'true');
      else item.removeAttribute('data-active');
    }
  }, []);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(updateFocus);
  }, [updateFocus]);

  // Steps to the same card in the middle run when the row is showing a card from outside it
  const recenter = useCallback(() => {
    const track = trackRef.current;
    if (!track || dragRef.current || COPIES < 2) return;
    const { items, index } = nearestCard(track);
    if (index < 0) return;
    const target = items[MIDDLE_COPY * COUNT + (index % COUNT)];
    if (!target || target === items[index]) return;
    jumpBy(track, centreOf(target) - centreOf(items[index]));
    scheduleUpdate();
  }, [scheduleUpdate]);

  const scheduleRecenter = useCallback(
    (delay: number) => {
      window.clearTimeout(restRef.current);
      restRef.current = window.setTimeout(recenter, delay);
    },
    [recenter],
  );

  // Starts on the first recommendation of the middle run, before the first paint. Persian mirrors the row,
  // so the start is found again when the language changes.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const first = track?.children[MIDDLE_COPY * COUNT] as HTMLElement | undefined;
    if (!track || !first) return;
    jumpBy(track, centreOf(first) - middleOf(track));
    updateFocus();
  }, [locale, updateFocus]);

  useEffect(() => {
    const onResize = () => {
      scheduleUpdate();
      scheduleRecenter(REST_MS);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(restRef.current);
    };
  }, [scheduleUpdate, scheduleRecenter]);

  const onScroll = () => {
    scheduleUpdate();
    scheduleRecenter(REST_MS);
  };

  // Glides the card nearest the middle to exactly the middle
  const settle = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { items, index } = nearestCard(track);
    if (index < 0) return;
    const offset = centreOf(items[index]) - middleOf(track);
    track.scrollTo({ left: track.scrollLeft + offset, behavior: 'smooth' });
    // If it was already in the middle nothing scrolls, so nothing else would call for the step back
    scheduleRecenter(450);
  }, [scheduleRecenter]);

  // Touch and trackpads scroll natively; a mouse needs a drag to do the same
  const onPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const track = event.currentTarget;
    dragRef.current = {
      startX: event.clientX,
      startScroll: track.scrollLeft,
      pointerId: event.pointerId,
    };
    track.style.scrollSnapType = 'none';
    track.setPointerCapture(event.pointerId);
    track.setAttribute('data-dragging', 'true');
  };

  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    event.currentTarget.scrollLeft = drag.startScroll - (event.clientX - drag.startX);
  };

  const endDrag = (event: PointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const track = event.currentTarget;
    if (track.hasPointerCapture(drag.pointerId)) track.releasePointerCapture(drag.pointerId);
    track.removeAttribute('data-dragging');
    track.style.scrollSnapType = '';
    settle();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const track = event.currentTarget;
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return;
    event.preventDefault();
    const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
  };

  if (testimonials.length === 0) return null;

  return (
    <section className={styles.section} aria-label={dict.testimonials.label}>
      <ul
        ref={trackRef}
        className={styles.track}
        aria-label={dict.testimonials.listLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        {cards.map(({ testimonial, copy }) => (
          <TestimonialCard
            key={`${testimonial.id}-${copy}`}
            testimonial={testimonial}
            locale={locale}
            repeated={copy !== MIDDLE_COPY}
          />
        ))}
      </ul>
    </section>
  );
}
