import type { SpringConfig, StageLayerConfig } from '@/data/heroStage';

const TAU = Math.PI * 2;
const MAX_SUBSTEP_SEC = 1 / 240;
// A tab that was in the background comes back with a huge frame gap; nothing should jump because of it
export const MAX_FRAME_SEC = 0.1;
// Keeps the magnification finite for a layer the lens is about to pass through
const MIN_DISTANCE = 0.08;
const MAX_MAGNIFICATION = 8;

export interface StageState {
  /** Where the background sits relative to its resting place, in px, y down. */
  camX: number;
  camY: number;
  /** Lean of the portrait in radians: tiltX about the horizontal axis, tiltY about the vertical one. */
  tiltX: number;
  tiltY: number;
  /** Smoothed progress of the hero leaving the screen, 0 to 1. */
  progress: number;
  /** Where the planet sits relative to the frame, in px, y down. */
  farX: number;
  farY: number;
  /** Seconds the stage has been running. */
  time: number;
}

export interface SpringState {
  value: number;
  velocity: number;
}

/** What the scroll does to a layer. It carries no offset: HTML layers never follow the pointer. */
export interface LayerPose {
  scale: number;
  opacity: number;
}

export const createSpring = (value = 0): SpringState => ({ value, velocity: 0 });

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Fixed sub-steps keep the motion the same at 60 and at 144 Hz, and stable at any stiffness used here
export function stepSpring(
  spring: SpringState,
  target: number,
  dtSec: number,
  { rate, damping }: SpringConfig,
) {
  let remaining = Math.min(Math.max(dtSec, 0), MAX_FRAME_SEC);
  while (remaining > 1e-9) {
    const h = Math.min(remaining, MAX_SUBSTEP_SEC);
    const acceleration =
      rate * rate * (target - spring.value) - 2 * damping * rate * spring.velocity;
    spring.velocity += acceleration * h;
    spring.value += spring.velocity * h;
    remaining -= h;
  }
}

/**
 * How far a plane at `depth` shifts for a lens offset of 1, measured against the plane the lens looks at.
 * Planes in front move against the lens, planes behind move with it, and anything infinitely far
 * (depth → -∞) follows it one-to-one.
 */
export const parallaxFactor = (depth: number) => -depth / (1 - depth);

/**
 * How much bigger a plane at `depth` looks after the lens has flown `dolly` lens distances forward.
 * Planes close to the lens grow fastest, which is what makes the fly-past read as depth.
 */
export function dollyMagnification(depth: number, dolly: number) {
  const distance = Math.max(1 - depth - dolly, MIN_DISTANCE);
  return Math.min((1 - depth) / distance, MAX_MAGNIFICATION);
}

export function layerPose(
  layer: StageLayerConfig,
  state: Pick<StageState, 'progress'>,
  dolly: number,
): LayerPose {
  return {
    scale: dollyMagnification(layer.depth, dolly * state.progress),
    opacity: 1 - smoothstep(layer.fade[0], layer.fade[1], state.progress),
  };
}

/** Slow Lissajous drift in -1..1, so the scene breathes even when the pointer is still. */
export function idleDrift(timeSec: number, [periodX, periodY]: readonly [number, number]) {
  return {
    x: Math.sin((timeSec * TAU) / periodX),
    y: Math.sin((timeSec * TAU) / periodY + 1.3) * 0.7,
  };
}

/** The planet's displacement in the unit its shader works in: half the hero width, y up. */
export function planetShift(state: Pick<StageState, 'farX' | 'farY'>, widthPx: number) {
  const unit = 2 / Math.max(widthPx, 1);
  return { x: state.farX * unit, y: -state.farY * unit };
}
