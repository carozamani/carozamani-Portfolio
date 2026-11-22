import { createStarShadows } from './starfield';
import { describe, expect, it } from 'vitest';

describe('createStarShadows', () => {
  it('draws every star of a layer into one box-shadow list', () => {
    const { far, mid, near } = createStarShadows();
    expect(far.split('vw ')).toHaveLength(120 + 1);
    expect(mid.split('vw ')).toHaveLength(48 + 1);
    expect(near.split('vw ')).toHaveLength(16 + 1);
  });

  it('keeps every star inside the viewport', () => {
    const offsets = createStarShadows().far.match(/\d+\.\d+(?=v[wh])/g) ?? [];
    expect(offsets.length).toBe(240);
    expect(offsets.every((value) => Number(value) >= 0 && Number(value) <= 100)).toBe(true);
  });

  it('is deterministic for a seed and differs between seeds', () => {
    expect(createStarShadows(7)).toEqual(createStarShadows(7));
    expect(createStarShadows(7).far).not.toEqual(createStarShadows(8).far);
  });
});
