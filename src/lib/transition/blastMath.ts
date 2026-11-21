export const TAU = Math.PI * 2;

export type Point = { x: number; y: number };

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Distance from a point to the farthest corner of the viewport: the radius that covers it all. */
export function farthestCornerDistance(origin: Point, width: number, height: number) {
  return Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y));
}

/** mulberry32: small, fast and good enough to give every explosion its own shape. */
export function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
