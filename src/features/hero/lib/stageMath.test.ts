import { describe, expect, it } from 'vitest';

import {
  createSpring,
  dollyMagnification,
  idleDrift,
  layerPose,
  parallaxFactor,
  planetShift,
  smoothstep,
  stepSpring,
} from './stageMath';

const settle = (rate: number, damping: number, fps: number, seconds: number) => {
  const spring = createSpring(0);
  const frames = Math.round(seconds * fps);
  for (let i = 0; i < frames; i += 1) stepSpring(spring, 1, 1 / fps, { rate, damping });
  return spring;
};

describe('stepSpring', () => {
  it('settles on its target', () => {
    const spring = settle(6, 1, 60, 3);
    expect(spring.value).toBeCloseTo(1, 3);
    expect(Math.abs(spring.velocity)).toBeLessThan(1e-3);
  });

  it('never overshoots when critically damped', () => {
    const spring = createSpring(0);
    let peak = 0;
    for (let i = 0; i < 240; i += 1) {
      stepSpring(spring, 1, 1 / 60, { rate: 9, damping: 1 });
      peak = Math.max(peak, spring.value);
    }
    expect(peak).toBeLessThanOrEqual(1.0001);
  });

  it('swings past the target once when under-damped', () => {
    const spring = createSpring(0);
    let peak = 0;
    for (let i = 0; i < 240; i += 1) {
      stepSpring(spring, 1, 1 / 60, { rate: 9, damping: 0.62 });
      peak = Math.max(peak, spring.value);
    }
    expect(peak).toBeGreaterThan(1.02);
    expect(peak).toBeLessThan(1.2);
  });

  it('moves the same at 60 and at 144 frames per second', () => {
    const slow = settle(7, 0.8, 60, 0.5);
    const fast = settle(7, 0.8, 144, 0.5);
    expect(slow.value).toBeCloseTo(fast.value, 2);
  });

  it('ignores a frame gap from a background tab', () => {
    const spring = createSpring(0);
    stepSpring(spring, 1, 30, { rate: 6, damping: 1 });
    const reference = createSpring(0);
    stepSpring(reference, 1, 0.1, { rate: 6, damping: 1 });
    expect(spring.value).toBeCloseTo(reference.value, 6);
  });
});

describe('parallaxFactor', () => {
  it('leaves the focal plane where it is', () => {
    expect(parallaxFactor(0)).toBeCloseTo(0, 9);
  });

  it('moves near planes against the lens and far planes with it', () => {
    expect(parallaxFactor(0.2)).toBeLessThan(0);
    expect(parallaxFactor(-0.2)).toBeGreaterThan(0);
  });

  it('gets close to one-to-one for a very distant plane', () => {
    expect(parallaxFactor(-1000)).toBeCloseTo(1, 2);
  });

  it('grows towards the lens', () => {
    expect(Math.abs(parallaxFactor(0.4))).toBeGreaterThan(Math.abs(parallaxFactor(0.2)));
  });
});

describe('dollyMagnification', () => {
  it('is 1 before the lens moves', () => {
    expect(dollyMagnification(0.22, 0)).toBeCloseTo(1, 9);
  });

  it('grows faster for planes that are closer to the lens', () => {
    expect(dollyMagnification(0.22, 0.3)).toBeGreaterThan(dollyMagnification(0, 0.3));
    expect(dollyMagnification(0, 0.3)).toBeGreaterThan(dollyMagnification(-0.12, 0.3));
  });

  it('stays finite when the lens reaches the plane', () => {
    expect(Number.isFinite(dollyMagnification(0.2, 0.8))).toBe(true);
    expect(Number.isFinite(dollyMagnification(0.2, 5))).toBe(true);
  });
});

describe('layerPose', () => {
  const near = { depth: 0.22, fade: [0.2, 0.66] } as const;

  it('is the flat layout at rest', () => {
    const pose = layerPose(near, { progress: 0 }, 0.36);
    expect(pose.scale).toBe(1);
    expect(pose.opacity).toBe(1);
  });

  it('fades out completely by the end of its range', () => {
    expect(layerPose(near, { progress: 0.66 }, 0.36).opacity).toBe(0);
    expect(layerPose(near, { progress: 0.2 }, 0.36).opacity).toBe(1);
  });

  it('only scales and fades: a layer has no offset to follow the pointer with', () => {
    const pose = layerPose(near, { progress: 0.4 }, 0.36);
    expect(Object.keys(pose).sort()).toEqual(['opacity', 'scale']);
    expect(pose.scale).toBeGreaterThan(1);
  });
});

describe('idleDrift', () => {
  it('stays inside -1..1', () => {
    for (let t = 0; t < 120; t += 0.7) {
      const drift = idleDrift(t, [17, 23]);
      expect(Math.abs(drift.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(drift.y)).toBeLessThanOrEqual(1);
    }
  });
});

describe('planetShift', () => {
  it('converts px to half-widths and flips y to point up', () => {
    const shift = planetShift({ farX: 10, farY: 20 }, 100);
    expect(shift.x).toBeCloseTo(0.2, 9);
    expect(shift.y).toBeCloseTo(-0.4, 9);
  });
});

describe('smoothstep', () => {
  it('eases between its edges', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 9);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
});
