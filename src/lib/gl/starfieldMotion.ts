import type { StarfieldBackdropConfig } from '@/data/starfieldBackdrop';

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Focal length of the pinhole lens: the configured horizontal field of view, narrowed on tall screens. */
export function lensFocal(
  width: number,
  height: number,
  camera: StarfieldBackdropConfig['camera'],
): number {
  const wide = 1 / Math.tan(toRadians(camera.horizontalFovDeg) / 2);
  const tall = height / width / Math.tan(toRadians(camera.maxVerticalFovDeg) / 2);
  return Math.max(wide, tall);
}

/** How bright the sky is for a scroll position: 1 at the top of the page, falling evenly to `dim.floor` at the bottom. */
export function skyBrightness(progress: number, dim: StarfieldBackdropConfig['dim']): number {
  const depth = Math.min(Math.max(progress, 0), 1);
  return 1 - (1 - dim.floor) * depth;
}

/**
 * How far through the camera's orbital pitch a scroll position is, from 0 at the top to 1 at the bottom.
 */
export function sweepProgress(scrollPx: number, scrollablePx: number): number {
  const length = Math.max(scrollablePx, 1);
  return Math.min(Math.max(scrollPx / length, 0), 1);
}

/**
 * Camera pitch in radians: slow orbital drift plus a half-circle movement tied to the page. The
 * starting pitch looks above the planet; at the bottom it looks down toward it. The view stays upright.
 */
export function cameraPitch(
  motion: StarfieldBackdropConfig['motion'],
  elapsedSec: number,
  sweep: number,
): number {
  return motion.initialCameraPitch + elapsedSec * motion.starDrift + sweep * motion.scrollSweep;
}

/**
 * Follows the scroll position one-to-one, except that it never travels faster than `maxSpeed` pixels
 * per second. Ordinary scrolling is far below that speed, so the sky stays locked to the page; only a
 * menu jump, which steps the page over thousands of pixels in one frame, is turned into a quick drift.
 */
export function followScroll(
  current: number,
  target: number,
  dtSec: number,
  maxSpeed: number,
): number {
  const gap = target - current;
  const maxStep = maxSpeed * Math.max(dtSec, 0);
  if (Math.abs(gap) <= maxStep) return target;
  return current + Math.sign(gap) * maxStep;
}

/**
 * Moves `current` toward `target` by a fixed share of the remaining distance per unit of time, so a
 * sudden jump in `target` becomes a quick glide instead of a pop. Lands on `target` exactly once it
 * is within half a pixel, so a settled page matches the real scroll position.
 */
export function glideToward(
  current: number,
  target: number,
  dtSec: number,
  timeConstantSec: number,
): number {
  const gap = target - current;
  if (Math.abs(gap) <= 0.5) return target;
  return current + gap * (1 - Math.exp(-Math.max(dtSec, 0) / timeConstantSec));
}
