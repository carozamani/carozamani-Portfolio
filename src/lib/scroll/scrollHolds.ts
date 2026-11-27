/**
 * A ScrollHold keeps its section pinned for extra scroll distance: from `start` (the scroll position at
 * which the section sticks) for `length` pixels, the content on screen does not change. Those stretches
 * are for the visitor scrolling by hand; a programmatic scroll has no reason to dwell in them.
 */
export type HoldRange = { start: number; length: number };

/** Scroll distance with every hold taken out: the measure a hold-skipping scroll animates over. */
export function toVirtual(y: number, holds: readonly HoldRange[]): number {
  let removed = 0;
  for (const { start, length } of holds) {
    if (y > start) removed += Math.min(y - start, length);
  }
  return y - removed;
}

/**
 * The scroll position for a virtual distance: it leaps over each hold the distance has moved past, and
 * rests at the start of the hold it has not. Holds are sorted by position and never overlap.
 */
export function toReal(virtual: number, holds: readonly HoldRange[]): number {
  let real = virtual;
  let removedBefore = 0;
  for (const { start, length } of holds) {
    if (virtual > start - removedBefore) real += length;
    removedBefore += length;
  }
  return real;
}

/** Sorted, non-overlapping, and with the zero-length holds (reduced motion switched their spacer off) gone. */
function sanitize(holds: readonly HoldRange[]): HoldRange[] {
  const sorted = holds.filter((hold) => hold.length > 0).sort((a, b) => a.start - b.start);
  const clean: HoldRange[] = [];
  let cursor = -Infinity;
  for (const hold of sorted) {
    const start = Math.max(hold.start, cursor);
    const end = hold.start + hold.length;
    if (end <= start) continue;
    clean.push({ start, length: end - start });
    cursor = end;
  }
  return clean;
}

/** `toVirtual`/`toReal` bound to one fixed, sanitized set of holds, plus whether a range touches any of them. */
export type HoldMap = {
  toVirtual: (y: number) => number;
  toReal: (virtual: number) => number;
  crosses: (from: number, to: number) => boolean;
};

export function createHoldMap(holds: readonly HoldRange[]): HoldMap {
  const clean = sanitize(holds);
  return {
    toVirtual: (y) => toVirtual(y, clean),
    toReal: (virtual) => toReal(virtual, clean),
    crosses: (from, to) => {
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      return clean.some(({ start, length }) => hi > start && lo < start + length);
    },
  };
}

/** Every pinned stretch on the page right now, in scroll order. Empty without ScrollHolds or when reduced motion removed them. */
export function measureHolds(): HoldRange[] {
  const holds: HoldRange[] = [];
  document.querySelectorAll<HTMLElement>('[data-scroll-hold]').forEach((track) => {
    const pin = track.firstElementChild;
    const length = Number.parseFloat(getComputedStyle(track, '::after').height);
    if (!(pin instanceof HTMLElement) || !(length > 0)) return;
    // The section sticks once its natural top rises above the offset it is pinned at
    const pinOffset = Number.parseFloat(getComputedStyle(pin).top) || 0;
    holds.push({ start: track.getBoundingClientRect().top + window.scrollY - pinOffset, length });
  });
  return holds.sort((a, b) => a.start - b.start);
}
