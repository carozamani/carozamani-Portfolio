import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHoldMap, measureHolds } from './scrollHolds';

// Two holds: 1000-1600 and 3000-3300
const holds = [
  { start: 3000, length: 300 },
  { start: 1000, length: 600 },
];

describe('createHoldMap', () => {
  const map = createHoldMap(holds);

  it('leaves positions before the first hold alone', () => {
    expect(map.toVirtual(0)).toBe(0);
    expect(map.toVirtual(1000)).toBe(1000);
  });

  it('counts a hold as no distance at all', () => {
    expect(map.toVirtual(1300)).toBe(1000);
    expect(map.toVirtual(1600)).toBe(1000);
  });

  it('subtracts every hold already passed', () => {
    expect(map.toVirtual(2000)).toBe(1400);
    expect(map.toVirtual(4000)).toBe(4000 - 600 - 300);
  });

  it('maps a squeezed position back to the real one, skipping the holds it crosses', () => {
    expect(map.toReal(500)).toBe(500);
    expect(map.toReal(1001)).toBe(1601);
    expect(map.toReal(1400)).toBe(2000);
    expect(map.toReal(3100)).toBe(4000);
  });

  it('lands before a hold, not inside it, when the position sits right at its start', () => {
    expect(map.toReal(1000)).toBe(1000);
  });

  it('round-trips every position that is outside a hold', () => {
    for (const position of [0, 250, 999, 1601, 2000, 2999, 3301, 5000]) {
      expect(map.toReal(map.toVirtual(position))).toBe(position);
    }
  });

  it('is monotonic, so a scroll never runs backwards while it is skipping holds', () => {
    let previous = -Infinity;
    for (let virtual = 0; virtual <= 4000; virtual += 7) {
      const real = map.toReal(virtual);
      expect(real).toBeGreaterThanOrEqual(previous);
      previous = real;
    }
  });

  it('knows whether a scroll passes through a hold', () => {
    expect(map.crosses(0, 900)).toBe(false);
    expect(map.crosses(0, 1200)).toBe(true);
    expect(map.crosses(1700, 2900)).toBe(false);
    expect(map.crosses(4000, 100)).toBe(true);
    expect(map.crosses(1200, 1400)).toBe(true);
  });

  it('trims overlapping holds and ignores empty ones', () => {
    const messy = createHoldMap([
      { start: 100, length: 200 },
      { start: 250, length: 200 },
      { start: 900, length: 0 },
    ]);
    // 100-300 and 300-450 after trimming: 350 of distance in total
    expect(messy.toVirtual(1000)).toBe(1000 - 350);
  });

  it('is the identity when there are no holds', () => {
    const empty = createHoldMap([]);
    expect(empty.toVirtual(1234)).toBe(1234);
    expect(empty.toReal(1234)).toBe(1234);
    expect(empty.crosses(0, 9999)).toBe(false);
  });
});

describe('measureHolds', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  function hold(top: number) {
    const track = document.createElement('div');
    track.setAttribute('data-scroll-hold', '');
    track.append(document.createElement('div'));
    track.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.append(track);
    return track;
  }

  function stubStyles(spacer: string, pinTop: string) {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (_element, pseudo) =>
        ({ height: pseudo ? spacer : 'auto', top: pinTop }) as CSSStyleDeclaration,
    );
  }

  it('starts a hold where the pinned section reaches its pin offset', () => {
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    hold(800);
    stubStyles('900px', '120px');

    expect(measureHolds()).toEqual([{ start: 800 + 200 - 120, length: 900 }]);
  });

  it('starts a hold later for a section taller than the screen, whose pin offset is negative', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    hold(1000);
    stubStyles('500px', '-300px');

    expect(measureHolds()).toEqual([{ start: 1300, length: 500 }]);
  });

  it('skips a track whose spacer is switched off, as it is for reduced motion', () => {
    hold(500);
    stubStyles('auto', '0px');

    expect(measureHolds()).toEqual([]);
  });
});
