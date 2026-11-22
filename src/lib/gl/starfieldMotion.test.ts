import { describe, expect, it } from 'vitest';

import { starfieldBackdropConfig } from '@/data/starfieldBackdrop';
import { earthHorizonConfig } from '@/data/earthHorizon';

import { lensFocal, starRotation } from './starfieldMotion';

const { camera, motion } = starfieldBackdropConfig;

describe('lensFocal', () => {
  it('matches the hero lens on a landscape screen', () => {
    const heroFocal = 1 / Math.tan((earthHorizonConfig.camera.horizontalFovDeg * Math.PI) / 360);
    expect(lensFocal(1920, 1080, camera)).toBeCloseTo(heroFocal, 10);
  });

  it('narrows the lens on a tall screen so the vertical field of view stays capped', () => {
    const focal = lensFocal(390, 844, camera);
    const verticalHalfAngle = Math.atan(844 / 390 / focal);
    expect(verticalHalfAngle).toBeLessThanOrEqual(
      ((camera.maxVerticalFovDeg / 2) * Math.PI) / 180 + 1e-9,
    );
    expect(focal).toBeGreaterThan(lensFocal(1920, 1080, camera));
  });
});

describe('starRotation', () => {
  it('only drifts with time when nothing is scrolled', () => {
    const focal = lensFocal(1440, 900, camera);
    const turn = starRotation(motion, 100, 0, focal, 1440);
    expect(turn).toBeCloseTo(motion.initialStarRotation + 100 * motion.starDrift, 10);
  });

  it('turns the sky upwards when scrolling down', () => {
    const focal = lensFocal(1440, 900, camera);
    expect(starRotation(motion, 0, 500, focal, 1440)).toBeGreaterThan(
      starRotation(motion, 0, 0, focal, 1440),
    );
  });

  it.each([390, 1440, 2560])(
    'moves a star at the middle of the screen at the configured share of the scroll at %ipx wide',
    (width) => {
      const focal = lensFocal(width, 900, camera);
      const scroll = 800;
      const turned = starRotation(motion, 0, scroll, focal, width) - motion.initialStarRotation;
      // A star on the view axis sits at focal * tan(angle) half-widths, and one half-width is width / 2 px
      const movedPx = focal * Math.tan(turned) * (width / 2);
      expect(movedPx / scroll).toBeCloseTo(motion.scrollParallax, 2);
    },
  );
});
