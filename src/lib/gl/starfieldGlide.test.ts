import { describe, expect, it } from 'vitest';
import { glideToward } from './starfieldMotion';

const TAU = 0.3;

describe('glideToward', () => {
  it('does not move when it is already on target', () => {
    expect(glideToward(500, 500, 1 / 60, TAU)).toBe(500);
  });

  it('turns a sudden jump into a glide that never overshoots', () => {
    // A page stepping over a pinned hold: the target moves by 1350px in one frame
    let value = 0;
    const target = 1350;
    const first = glideToward(value, target, 1 / 60, TAU);
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(target * 0.25);

    for (let frame = 0; frame < 240; frame += 1) {
      const next = glideToward(value, target, 1 / 60, TAU);
      expect(next).toBeGreaterThanOrEqual(value);
      expect(next).toBeLessThanOrEqual(target);
      value = next;
    }
    expect(value).toBe(target);
  });

  it('glides backwards the same way', () => {
    const value = glideToward(1000, 0, 1 / 60, TAU);
    expect(value).toBeLessThan(1000);
    expect(value).toBeGreaterThan(0);
  });

  it('lands exactly on the target once within half a pixel', () => {
    expect(glideToward(99.6, 100, 1 / 60, TAU)).toBe(100);
  });

  it('ignores a negative time step', () => {
    expect(glideToward(0, 100, -1, TAU)).toBe(0);
  });
});
