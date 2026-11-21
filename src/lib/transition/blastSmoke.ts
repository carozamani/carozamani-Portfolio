import { edgeRadius, type EdgeShape } from './blastEdge';
import { TAU, type Point } from './blastMath';

const CAPACITY = 120;
const CULL_MARGIN = 180;
const SPREAD = 0.16;

export type SmokeFrame = {
  shape: EdgeShape;
  origin: Point;
  radius: number;
  amp: number;
  /** Seconds since the blast began. */
  time: number;
  /** 0 at the first flash, 1 once the screen is covered: the billows tighten onto the front. */
  progress: number;
  width: number;
  height: number;
  stride: number;
  /** Overall opacity of the puffs. */
  alpha: number;
};

export type SmokeField = {
  seed: (count: number, rng: () => number, sizeScale: number) => void;
  /** Stamps the puffs with whatever composite operation the caller has set. */
  draw: (ctx: CanvasRenderingContext2D, sprite: CanvasImageSource, frame: SmokeFrame) => void;
};

/**
 * Soft billows of smoke riding the blast front. They are placed from the front's own radius each
 * frame, so they stay locked to its outline instead of needing physics of their own, and their
 * overlap is what turns a hard geometric edge into a cloud.
 */
export function createSmokeField(): SmokeField {
  const angle = new Float32Array(CAPACITY);
  const lead = new Float32Array(CAPACITY);
  const size = new Float32Array(CAPACITY);
  const weight = new Float32Array(CAPACITY);
  let count = 0;

  const seed: SmokeField['seed'] = (requested, rng, sizeScale) => {
    count = Math.min(requested, CAPACITY);
    for (let i = 0; i < count; i++) {
      angle[i] = rng() * TAU;
      // Mostly just ahead of the front; some sit behind it and thicken the body of the cloud
      lead[i] = -0.35 + 1.35 * rng() ** 1.3;
      size[i] = (70 + rng() ** 2 * 190) * sizeScale;
      weight[i] = 0.55 + 0.45 * rng();
    }
  };

  const draw: SmokeField['draw'] = (ctx, sprite, frame) => {
    const { shape, origin, radius, amp, time, progress, width, height, stride } = frame;
    const spread = radius * SPREAD * (1 - progress) ** 0.6;
    const growth = 0.75 + 0.45 * progress;

    for (let i = 0; i < count; i += stride) {
      const a = angle[i];
      const r = edgeRadius(shape, a, radius, amp, time) + lead[i] * spread;
      const x = origin.x + Math.cos(a) * r;
      const y = origin.y + Math.sin(a) * r;
      if (
        x < -CULL_MARGIN ||
        x > width + CULL_MARGIN ||
        y < -CULL_MARGIN ||
        y > height + CULL_MARGIN
      ) {
        continue;
      }

      const diameter = size[i] * growth;
      ctx.globalAlpha = frame.alpha * weight[i];
      ctx.drawImage(sprite, x - diameter / 2, y - diameter / 2, diameter, diameter);
    }
    ctx.globalAlpha = 1;
  };

  return { seed, draw };
}
