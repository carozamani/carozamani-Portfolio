import { describe, expect, it } from 'vitest';

import { starfieldBackdropConfig } from '@/data/starfieldBackdrop';
import { earthHorizonConfig } from '@/data/earthHorizon';

import { cameraPitch, lensFocal, skyBrightness, sweepProgress } from './starfieldMotion';

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

describe('sweepProgress', () => {
  it('is 0 at the top and 1 at the bottom of a long page', () => {
    expect(sweepProgress(0, 10000)).toBe(0);
    expect(sweepProgress(10000, 10000)).toBe(1);
  });

  it('is proportional to the scroll in between', () => {
    expect(sweepProgress(2500, 10000)).toBeCloseTo(0.25, 10);
  });

  it('holds at its ends when the scroll overshoots', () => {
    expect(sweepProgress(-300, 10000)).toBe(0);
    expect(sweepProgress(15000, 10000)).toBe(1);
  });

  it('uses the full camera sweep on short pages too', () => {
    const shortPage = 600;
    const reached = sweepProgress(shortPage, shortPage);
    expect(reached).toBe(1);
  });

  it('never divides by zero on an empty page', () => {
    expect(sweepProgress(0, 0)).toBe(0);
  });
});

describe('cameraPitch', () => {
  it('only drifts with time when nothing is scrolled', () => {
    expect(cameraPitch(motion, 100, 0)).toBeCloseTo(
      motion.initialCameraPitch + 100 * motion.starDrift,
      10,
    );
  });

  it('turns the sky upwards when scrolling down', () => {
    expect(cameraPitch(motion, 0, 0.5)).toBeGreaterThan(cameraPitch(motion, 0, 0));
  });

  it('sweeps half a circle from the top of the page to the bottom', () => {
    const start = cameraPitch(motion, 0, 0);
    const end = cameraPitch(motion, 0, 1);
    expect(start).toBeLessThan(0);
    expect(end - start).toBeCloseTo(Math.PI, 10);
  });
});

describe('skyBrightness', () => {
  // Explicit, so these checks do not depend on how dim the page sky is configured to get
  const dim = { floor: 0.4 };

  it('is full at the top of the page and at the floor at the bottom', () => {
    expect(skyBrightness(0, dim)).toBe(1);
    expect(skyBrightness(1, dim)).toBeCloseTo(dim.floor, 10);
  });

  it('only ever gets darker going down', () => {
    const samples = Array.from({ length: 11 }, (_, i) => skyBrightness(i / 10, dim));
    samples.slice(1).forEach((value, i) => expect(value).toBeLessThan(samples[i]));
  });

  it('holds at its ends when the scroll overshoots', () => {
    expect(skyBrightness(-0.5, dim)).toBe(1);
    expect(skyBrightness(1.5, dim)).toBeCloseTo(dim.floor, 10);
  });
});
