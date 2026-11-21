import { edgeRadius, type EdgeShape } from './blastEdge';
import { TAU, type Point } from './blastMath';

const CAPACITY = 340;
const CULL_MARGIN = 48;
const SPREAD = 0.22;

export type ShardFrame = {
  shape: EdgeShape;
  origin: Point;
  radius: number;
  amp: number;
  /** Seconds since the blast began. */
  time: number;
  /** 0 at the first flash, 1 once the screen is covered: the debris tightens onto the front. */
  progress: number;
  width: number;
  height: number;
  stride: number;
};

export type ShardField = {
  seed: (count: number, rng: () => number, sizeScale: number) => void;
  draw: (ctx: CanvasRenderingContext2D, frame: ShardFrame) => void;
};

/**
 * Black triangular fragments riding the blast front. Most are tiny specks, a few are chunks.
 * They are placed from the front's own radius each frame, so they stay locked to its jagged
 * outline instead of needing their own physics.
 */
export function createShardField(): ShardField {
  const angle = new Float32Array(CAPACITY);
  const lead = new Float32Array(CAPACITY);
  const size = new Float32Array(CAPACITY);
  const rotation = new Float32Array(CAPACITY);
  const spin = new Float32Array(CAPACITY);
  const corners = new Float32Array(CAPACITY * 6);
  let count = 0;

  const seed: ShardField['seed'] = (requested, rng, sizeScale) => {
    count = Math.min(requested, CAPACITY);
    for (let i = 0; i < count; i++) {
      angle[i] = rng() * TAU;
      // Mostly just ahead of the front; a few trail behind it and read as cracks in the black
      lead[i] = -0.25 + 1.25 * rng() ** 1.4;
      size[i] = (2 + rng() ** 3 * 26) * sizeScale;
      rotation[i] = rng() * TAU;
      spin[i] = (rng() * 2 - 1) * 6;

      const start = rng() * TAU;
      for (let corner = 0; corner < 3; corner++) {
        const cornerAngle = start + corner * 2.1 + rng() * 0.8;
        const reach = 0.55 + rng() * 0.45;
        corners[i * 6 + corner * 2] = Math.cos(cornerAngle) * reach;
        corners[i * 6 + corner * 2 + 1] = Math.sin(cornerAngle) * reach;
      }
    }
  };

  const draw: ShardField['draw'] = (ctx, frame) => {
    const { shape, origin, radius, amp, time, progress, width, height, stride } = frame;
    const spread = radius * SPREAD * (1 - progress) ** 0.6;

    ctx.beginPath();
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

      const turn = rotation[i] + spin[i] * time;
      const cos = Math.cos(turn) * size[i];
      const sin = Math.sin(turn) * size[i];
      for (let corner = 0; corner < 3; corner++) {
        const cx = corners[i * 6 + corner * 2];
        const cy = corners[i * 6 + corner * 2 + 1];
        const px = x + cx * cos - cy * sin;
        const py = y + cx * sin + cy * cos;
        if (corner === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    // Solid black fragments only: no outline stroke around them
    ctx.fillStyle = '#000';
    ctx.fill();
  };

  return { seed, draw };
}
