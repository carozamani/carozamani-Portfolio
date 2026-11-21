import type Lenis from 'lenis';

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

let engine: ScrollEngine | null = null;

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

/**
 * The one way the app scrolls the page programmatically: Lenis when it is running, the browser's
 * own smooth scroll otherwise, and no animation at all for visitors who prefer reduced motion.
 */
export function scrollToTarget(
  target: ScrollTarget,
  { offset = 0, immediate = false, onPlan }: ScrollToTargetOptions = {},
) {
  const top = targetTop(target);
  if (top === null) return Promise.resolve();

  const destination = Math.max(0, top + offset);
  const active = engine;

  if (immediate || window.matchMedia(REDUCED_MOTION).matches) {
    onPlan?.({ durationMs: 0, easing: 'linear' });
    if (active) active.scrollTo(destination, { immediate: true });
    else window.scrollTo({ top: destination, behavior: 'instant' });
    return Promise.resolve();
  }

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
