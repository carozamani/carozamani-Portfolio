import { describe, expect, it, vi } from 'vitest';
import { registerStarfieldSnapshot, snapshotStarfield } from './starfieldSnapshot';

const ctx = {} as CanvasRenderingContext2D;

describe('starfield snapshot registry', () => {
  it('reports nothing to copy while no sky is registered', () => {
    expect(snapshotStarfield(ctx, 100, 50)).toBe(false);
  });

  it('hands the target and size to the registered sky', () => {
    const copy = vi.fn(() => true);
    const unregister = registerStarfieldSnapshot(copy);

    expect(snapshotStarfield(ctx, 100, 50)).toBe(true);
    expect(copy).toHaveBeenCalledWith(ctx, 100, 50);

    unregister();
    expect(snapshotStarfield(ctx, 100, 50)).toBe(false);
  });

  it('passes on a sky that cannot copy yet, such as one still starting up', () => {
    const unregister = registerStarfieldSnapshot(() => false);
    expect(snapshotStarfield(ctx, 100, 50)).toBe(false);
    unregister();
  });

  it('keeps a newer sky when an older one unregisters late', () => {
    const older = registerStarfieldSnapshot(() => true);
    const newer = registerStarfieldSnapshot(() => true);

    older();
    expect(snapshotStarfield(ctx, 1, 1)).toBe(true);

    newer();
    expect(snapshotStarfield(ctx, 1, 1)).toBe(false);
  });
});
