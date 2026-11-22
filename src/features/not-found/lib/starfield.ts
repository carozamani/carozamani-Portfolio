type StarLayer = { count: number; palette: readonly string[] };

const WHITE = 'rgba(255, 255, 255, 0.95)';
const SOFT = 'rgba(214, 238, 255, 0.8)';
const CYAN = 'rgba(94, 214, 255, 0.95)';
const BLUE = 'rgba(88, 132, 255, 0.9)';

const LAYERS = {
  far: { count: 120, palette: [WHITE, SOFT, SOFT, BLUE] },
  mid: { count: 48, palette: [WHITE, SOFT, CYAN] },
  near: { count: 16, palette: [WHITE, CYAN, CYAN] },
} as const satisfies Record<string, StarLayer>;

export type StarShadows = Record<keyof typeof LAYERS, string>;

// A seeded generator, so the sky is identical on every render and every machine
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Each layer is a single 1-3px element whose box-shadow list draws every star in it, positioned in
 * viewport units. Three layers of different depth is all the parallax and twinkle need.
 */
export function createStarShadows(seed = 404): StarShadows {
  const rng = mulberry32(seed);
  const build = ({ count, palette }: StarLayer) =>
    Array.from({ length: count }, () => {
      const x = (rng() * 100).toFixed(2);
      const y = (rng() * 100).toFixed(2);
      return `${x}vw ${y}vh ${palette[Math.floor(rng() * palette.length)]}`;
    }).join(', ');

  return { far: build(LAYERS.far), mid: build(LAYERS.mid), near: build(LAYERS.near) };
}
