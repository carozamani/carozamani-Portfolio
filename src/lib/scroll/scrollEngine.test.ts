import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SCROLL_EASING_CSS,
  easeInOutQuart,
  registerScrollEngine,
  scrollToTarget,
  type ScrollEngine,
} from './scrollEngine';

type ScrollToOptions = Parameters<ScrollEngine['scrollTo']>[1];

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
  }));
}

function createEngine(scroll = 0, finishes = true) {
  const scrollTo = vi.fn((_target: number | string | Element, options?: ScrollToOptions) => {
    if (finishes) options?.onComplete?.({} as never);
  });
  return { scroll, scrollTo } satisfies ScrollEngine;
}

function elementAt(top: number) {
  const element = document.createElement('section');
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
  return element;
}

beforeEach(() => {
  stubReducedMotion(false);
  window.scrollTo = vi.fn();
  Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
});

afterEach(() => {
  registerScrollEngine(null);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('scrollToTarget without Lenis', () => {
  it('falls back to the browser smooth scroll, measured from the document top', async () => {
    const settled = scrollToTarget(elementAt(500));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'smooth' });

    window.dispatchEvent(new Event('scrollend'));
    await expect(settled).resolves.toBeUndefined();
  });

  it('jumps instantly for visitors who prefer reduced motion', async () => {
    stubReducedMotion(true);
    await scrollToTarget(elementAt(500));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'instant' });
  });

  it('resolves without scrolling when a selector matches nothing', async () => {
    await scrollToTarget('#does-not-exist');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('never scrolls above the top of the page', async () => {
    await scrollToTarget(0, { offset: -80, immediate: true });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });
});

describe('scrollToTarget with Lenis', () => {
  it('hands the animation to Lenis and resolves when it completes', async () => {
    const engine = createEngine();
    registerScrollEngine(engine);

    await scrollToTarget(elementAt(900));

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(engine.scrollTo).toHaveBeenCalledWith(
      1000,
      expect.objectContaining({ duration: expect.any(Number), onComplete: expect.any(Function) }),
    );
  });

  it('jumps without animating when asked, as the scrollbar thumb does', async () => {
    const engine = createEngine();
    registerScrollEngine(engine);

    await scrollToTarget(750, { immediate: true });

    expect(engine.scrollTo).toHaveBeenCalledWith(750, { immediate: true });
  });

  it('jumps without animating for visitors who prefer reduced motion', async () => {
    stubReducedMotion(true);
    const engine = createEngine();
    registerScrollEngine(engine);

    await scrollToTarget(750);

    expect(engine.scrollTo).toHaveBeenCalledWith(750, { immediate: true });
  });

  it('scales the duration with the distance, within bounds', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    await scrollToTarget(200);
    await scrollToTarget(1_000_000);

    const [near, far] = engine.scrollTo.mock.calls.map(([, options]) => options?.duration);
    expect(near).toBeCloseTo(0.9);
    expect(far).toBeCloseTo(1.8);
  });

  it('still resolves if a wheel gesture interrupts the animation before it completes', async () => {
    vi.useFakeTimers();
    registerScrollEngine(createEngine(0, false));

    let resolved = false;
    void scrollToTarget(3000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    expect(resolved).toBe(true);
  });
});

describe('scrollToTarget plan', () => {
  it('reports the timing Lenis will use, so the UI can animate in step with it', async () => {
    const engine = createEngine();
    registerScrollEngine(engine);
    const onPlan = vi.fn();

    await scrollToTarget(elementAt(900), { onPlan });

    const [, options] = engine.scrollTo.mock.calls[0];
    expect(onPlan).toHaveBeenCalledTimes(1);
    expect(onPlan).toHaveBeenCalledWith({
      durationMs: (options?.duration ?? 0) * 1000,
      easing: SCROLL_EASING_CSS,
    });
  });

  it('reports no animation for visitors who prefer reduced motion', async () => {
    stubReducedMotion(true);
    registerScrollEngine(createEngine());
    const onPlan = vi.fn();

    await scrollToTarget(750, { onPlan });

    expect(onPlan).toHaveBeenCalledWith({ durationMs: 0, easing: 'linear' });
  });

  it('stays silent when the browser animates the scroll itself', () => {
    const onPlan = vi.fn();

    void scrollToTarget(elementAt(500), { onPlan });
    window.dispatchEvent(new Event('scrollend'));

    expect(onPlan).not.toHaveBeenCalled();
  });

  it('describes a CSS curve that matches the easing Lenis runs', () => {
    const [x1 = NaN, y1 = NaN, x2 = NaN, y2 = NaN] =
      SCROLL_EASING_CSS.match(/[\d.]+/g)?.map(Number) ?? [];
    const bezier = (a: number, b: number, s: number) =>
      3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
    const cssEase = (t: number) => {
      let low = 0;
      let high = 1;
      for (let i = 0; i < 40; i += 1) {
        const mid = (low + high) / 2;
        if (bezier(x1, x2, mid) < t) low = mid;
        else high = mid;
      }
      return bezier(y1, y2, (low + high) / 2);
    };

    for (let i = 1; i < 20; i += 1) {
      const t = i / 20;
      expect(Math.abs(cssEase(t) - easeInOutQuart(t))).toBeLessThan(0.03);
    }
  });
});

describe('scrollToTarget across pinned sections', () => {
  const HOLD_START = 1000;
  const HOLD_END = 1600;

  beforeEach(() => {
    vi.useFakeTimers();
    // window.scrollY is 100 in these tests, so a track at 900 puts the hold at 1000-1600
    const track = document.createElement('div');
    track.setAttribute('data-scroll-hold', '');
    track.append(document.createElement('div'));
    track.getBoundingClientRect = () => ({ top: 900 }) as DOMRect;
    document.body.append(track);

    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (_element, pseudo) =>
        ({ height: pseudo ? '600px' : 'auto', top: '0px' }) as unknown as CSSStyleDeclaration,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const positions = (engine: ReturnType<typeof createEngine>) =>
    engine.scrollTo.mock.calls.map(([position]) => position as number);

  it('steps over the hold instead of scrolling through it, and lands exactly', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    const landed = scrollToTarget(2000);
    await vi.advanceTimersByTimeAsync(3000);
    await landed;

    const path = positions(engine);
    expect(path.length).toBeGreaterThan(10);
    expect(path.some((position) => position > HOLD_START && position < HOLD_END)).toBe(false);
    expect(path.at(-1)).toBe(2000);
    expect([...path].sort((a, b) => a - b)).toEqual(path);
  });

  it('drives the scroll itself rather than handing a long animation to Lenis', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    const landed = scrollToTarget(2000);
    await vi.advanceTimersByTimeAsync(3000);
    await landed;

    for (const [, options] of engine.scrollTo.mock.calls) {
      expect(options).toEqual({ immediate: true });
    }
  });

  it('times the flight on the distance without the hold', async () => {
    registerScrollEngine(createEngine(0));
    const onPlan = vi.fn();

    const landed = scrollToTarget(2000, { onPlan });

    // 2000px of page, but only 1400px of it has to be travelled
    expect(onPlan).toHaveBeenCalledWith({
      durationMs: (0.7 + 1400 / 3000) * 1000,
      easing: SCROLL_EASING_CSS,
    });

    await vi.advanceTimersByTimeAsync(3000);
    await landed;
  });

  it('flies upwards over the hold too, as the back-to-top button does', async () => {
    const engine = createEngine(3000);
    registerScrollEngine(engine);

    const landed = scrollToTarget(0);
    await vi.advanceTimersByTimeAsync(3000);
    await landed;

    const path = positions(engine);
    expect(path.some((position) => position > HOLD_START && position < HOLD_END)).toBe(false);
    expect(path.at(-1)).toBe(0);
    expect([...path].sort((a, b) => b - a)).toEqual(path);
  });

  it('stops when the visitor takes the wheel, and resolves', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    let resolved = false;
    void scrollToTarget(2000).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(300);
    const written = engine.scrollTo.mock.calls.length;

    window.dispatchEvent(new Event('wheel'));
    await vi.advanceTimersByTimeAsync(3000);

    expect(resolved).toBe(true);
    expect(engine.scrollTo.mock.calls.length).toBe(written);
  });

  it('lets a newer request take over a flight that is still running', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    const first = scrollToTarget(2000);
    await vi.advanceTimersByTimeAsync(300);
    const second = scrollToTarget(0, { immediate: true });
    await Promise.all([first, second]);
    const written = engine.scrollTo.mock.calls.length;

    await vi.advanceTimersByTimeAsync(3000);

    expect(engine.scrollTo.mock.calls.length).toBe(written);
    expect(positions(engine).at(-1)).toBe(0);
  });

  it('scrolls as before when no hold lies between here and the target', async () => {
    const engine = createEngine(0);
    registerScrollEngine(engine);

    await scrollToTarget(800);

    expect(engine.scrollTo).toHaveBeenCalledWith(
      800,
      expect.objectContaining({ duration: expect.any(Number), onComplete: expect.any(Function) }),
    );
  });
});
