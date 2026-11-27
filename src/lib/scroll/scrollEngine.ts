import type Lenis from 'lenis';
import { createHoldMap, measureHolds, type HoldMap } from './scrollHolds';

/** The slice of Lenis the app relies on, so tests can pass a stub instead of a real instance. */
export type ScrollEngine = Pick<Lenis, 'scroll' | 'scrollTo'>;

type ScrollTarget = number | string | Element;

/** The timing of a programmatic scroll, so UI can animate in step with it instead of guessing. */
export type ScrollPlan = {
  durationMs: number;
  /** A CSS timing function that matches the curve the scroll runs on. */
  easing: string;
};

type ScrollToTargetOptions = {
  /** Pixels added to the target's position. */
  offset?: number;
  /** Jump without animating, e.g. while dragging the page scrollbar. */
  immediate?: boolean;
  /**
   * Called synchronously, before the scroll starts, with the timing it will use. Not called when the
   * browser animates the scroll itself, because that duration is not known.
   */
  onPlan?: (plan: ScrollPlan) => void;
};

const MIN_DURATION_S = 0.9;
const MAX_DURATION_S = 1.8;
// Lenis never calls onComplete when a wheel or touch gesture interrupts the animation
const SETTLE_MARGIN_MS = 300;
const NATIVE_SMOOTH_MS = 1000;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
// How far into a section's hold a menu jump lands. The depth animations of a pinned section run on the
// scroll position, and they have only finished settling a little way into the hold, so landing on the
// very first pixel of it shows the boxes still mid-tilt until the visitor scrolls on by hand.
const SETTLE_SHARE = 0.2;
// Tells which side of a hold's edge a position on it belongs to
const EDGE = 1e-6;
// What takes the wheel back from a scroll we are driving ourselves
const TAKEOVER_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

let engine: ScrollEngine | null = null;
let endFlight: (() => void) | null = null;

export function registerScrollEngine(next: ScrollEngine | null) {
  engine = next;
}

export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/** easeInOutQuart as a CSS timing function, for UI that has to move in step with the scroll. */
export const SCROLL_EASING_CSS = 'cubic-bezier(0.76, 0, 0.24, 1)';

// Longer jumps take longer, so crossing the whole page never feels like a teleport
const durationFor = (distance: number) =>
  Math.min(MAX_DURATION_S, Math.max(MIN_DURATION_S, 0.7 + distance / 3000));

function targetTop(target: ScrollTarget) {
  if (typeof target === 'number') return target;
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  return element ? element.getBoundingClientRect().top + window.scrollY : null;
}

/**
 * Where to land for a section that sits in a ScrollHold. The section's own rectangle is no guide: while
 * the pin is stuck or has been released it is somewhere other than where the hold begins. The track is
 * never stuck, so the hold is measured from that, and the landing is a little way into it (SETTLE_SHARE).
 */
function settledTop(target: ScrollTarget, top: number) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!(element instanceof Element)) return top;
  const track = element.closest<HTMLElement>('[data-scroll-hold]');
  const pin = track?.firstElementChild;
  if (!track || !pin) return top;

  const length = parseFloat(getComputedStyle(track, '::after').height);
  if (!(length >= 1)) return top;
  const trackTop = track.getBoundingClientRect().top + window.scrollY;
  const pinTop = parseFloat(getComputedStyle(pin).top) || 0;
  return Math.max(trackTop, trackTop - pinTop + length * SETTLE_SHARE);
}

/** Resolves when the scroll lands, or at the deadline if something interrupted it first. */
function untilSettled(deadlineMs: number, start: (done: () => void) => void) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, deadlineMs);
    start(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

function jumpTo(position: number) {
  if (engine) engine.scrollTo(position, { immediate: true });
  else window.scrollTo({ top: position, behavior: 'instant' });
}

/**
 * Scrolls to `destination` without stopping at the pinned sections on the way. A ScrollHold makes
 * the page scroll a long way while its section stays put, which is what a visitor wants when they
 * scroll by hand and the last thing they want when they ask to go somewhere. So the animation runs
 * over the distance with every hold squeezed out and steps over each hold as it reaches it. Landing
 * is exact: the final frame is the real destination.
 */
function flyOverHolds(
  from: number,
  destination: number,
  holds: HoldMap,
  onPlan?: ScrollToTargetOptions['onPlan'],
) {
  const start = holds.toVirtual(from);
  const end = holds.toVirtual(destination);
  const distance = Math.abs(end - start);

  if (distance < 1) {
    onPlan?.({ durationMs: 0, easing: 'linear' });
    jumpTo(destination);
    return Promise.resolve();
  }

  const duration = durationFor(distance);
  onPlan?.({ durationMs: duration * 1000, easing: SCROLL_EASING_CSS });

  // Squeezing the holds out loses where inside a hold the page starts and ends. Without that the flight
  // would jump from the start position to the edge of the hold on its first frame, and again on its
  // last. The difference is carried along instead and fades out (in) over the flight.
  const down = end >= start;
  const startOffset = from - holds.toReal(down ? start + EDGE : start);
  const endOffset = destination - holds.toReal(down ? end : end + EDGE);

  return new Promise<void>((resolve) => {
    const began = performance.now();
    let frame = 0;

    const finish = () => {
      cancelAnimationFrame(frame);
      TAKEOVER_EVENTS.forEach((type) => window.removeEventListener(type, finish));
      if (endFlight === finish) endFlight = null;
      resolve();
    };

    const tick = (now: number) => {
      const progress = Math.min((now - began) / (duration * 1000), 1);
      if (progress >= 1) {
        jumpTo(destination);
        finish();
        return;
      }
      const eased = easeInOutQuart(progress);
      jumpTo(
        holds.toReal(start + (end - start) * eased) + startOffset * (1 - eased) + endOffset * eased,
      );
      frame = requestAnimationFrame(tick);
    };

    endFlight = finish;
    TAKEOVER_EVENTS.forEach((type) => window.addEventListener(type, finish, { passive: true }));
    frame = requestAnimationFrame(tick);
  });
}

/**
 * The one way the app scrolls the page programmatically: Lenis when it is running, the browser's
 * own smooth scroll otherwise, and no animation at all for visitors who prefer reduced motion.
 * Scrolling that has to cross pinned sections skips their holds; scrolling by hand never does.
 */
export function scrollToTarget(
  target: ScrollTarget,
  { offset = 0, immediate = false, onPlan }: ScrollToTargetOptions = {},
) {
  const top = targetTop(target);
  if (top === null) return Promise.resolve();

  // A newer request always wins over a flight that is still in the air
  endFlight?.();

  const destination = Math.max(0, settledTop(target, top) + offset);
  const active = engine;

  if (immediate || window.matchMedia(REDUCED_MOTION).matches) {
    onPlan?.({ durationMs: 0, easing: 'linear' });
    if (active) active.scrollTo(destination, { immediate: true });
    else window.scrollTo({ top: destination, behavior: 'instant' });
    return Promise.resolve();
  }

  const from = active ? active.scroll : window.scrollY;
  const holds = createHoldMap(measureHolds());
  if (holds.crosses(from, destination)) return flyOverHolds(from, destination, holds, onPlan);

  if (active) {
    const duration = durationFor(Math.abs(destination - active.scroll));
    onPlan?.({ durationMs: duration * 1000, easing: SCROLL_EASING_CSS });
    return untilSettled(duration * 1000 + SETTLE_MARGIN_MS, (done) => {
      active.scrollTo(destination, { duration, easing: easeInOutQuart, onComplete: done });
    });
  }

  return untilSettled(NATIVE_SMOOTH_MS, (done) => {
    window.addEventListener('scrollend', done, { once: true });
    window.scrollTo({ top: destination, behavior: 'smooth' });
  });
}
