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

/**
 * How far the sky has turned, in radians: a slow drift over time plus a turn with the scroll. Turning
 * the sky upwards makes the stars rise, so scrolling down sends them up the screen, more slowly than
 * the page does. The turn per pixel is derived from the lens so that a star at the middle of the screen
 * moves exactly `scrollParallax` pixels for every pixel scrolled, at any width.
 */
export function starRotation(
  motion: StarfieldBackdropConfig['motion'],
  elapsedSec: number,
  scrollPx: number,
  focal: number,
  widthPx: number,
): number {
  const radiansPerPixel = (motion.scrollParallax * 2) / (focal * widthPx);
  return motion.initialStarRotation + elapsedSec * motion.starDrift + scrollPx * radiansPerPixel;
}
