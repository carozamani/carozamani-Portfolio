import { TAU, type Point } from './blastMath';

/** Enough vertices that the outline reads as a smooth cloud rather than a visible polygon. */
const EDGE_VERTICES = 240;
const TOOTH_DEPTH = 0.012;

export type EdgeShape = {
  phases: readonly [number, number, number, number];
  /** Fixed per-vertex offsets: the fine roughness along the blast front. */
  jitter: Float32Array;
};

/** Every explosion rolls its own shape, so two clicks never look identical. */
export function createEdgeShape(rng: () => number): EdgeShape {
  const jitter = new Float32Array(EDGE_VERTICES);
  for (let i = 0; i < EDGE_VERTICES; i++) jitter[i] = (rng() * 2 - 1) * TOOTH_DEPTH;
  return { phases: [rng() * TAU, rng() * TAU, rng() * TAU, rng() * TAU], jitter };
}

/**
 * Billowing ragged-ness in [-1, 1]: a few big lobes with smaller ones riding on them, churning
 * slowly the way a smoke cloud boils.
 */
function edgeNoise({ phases }: EdgeShape, angle: number, time: number) {
  return (
    0.38 * Math.sin(angle * 2 + phases[0] + time * 0.9) +
    0.3 * Math.sin(angle * 5 + phases[1] - time * 1.3) +
    0.2 * Math.sin(angle * 9 + phases[2] + time * 1.9) +
    0.12 * Math.sin(angle * 17 + phases[3] - time * 2.6)
  );
}

/** Radius of the front at an angle, without the roughness: where puffs and debris attach. */
export function edgeRadius(
  shape: EdgeShape,
  angle: number,
  radius: number,
  amp: number,
  time: number,
) {
  return radius * (1 + amp * edgeNoise(shape, angle, time));
}

/**
 * Traces the blast front as a closed path. Its inner bound is radius * (1 - amp - TOOTH_DEPTH),
 * which is why the engine overshoots the farthest corner: at the end of the cover the whole
 * viewport sits inside the path.
 */
export function traceEdge(
  ctx: CanvasRenderingContext2D,
  shape: EdgeShape,
  origin: Point,
  radius: number,
  amp: number,
  time: number,
) {
  ctx.beginPath();
  for (let i = 0; i < EDGE_VERTICES; i++) {
    const angle = (i / EDGE_VERTICES) * TAU;
    const r = radius * (1 + amp * edgeNoise(shape, angle, time) + shape.jitter[i]);
    const x = origin.x + Math.cos(angle) * r;
    const y = origin.y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
