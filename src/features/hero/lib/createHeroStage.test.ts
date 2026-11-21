import { describe, expect, it } from 'vitest';

import { heroStageConfig, type HeroStageConfig } from '@/data/heroStage';

import { createHeroStage } from './createHeroStage';
import { planetShift } from './stageMath';

// No idle drift, so every number below comes from the inputs under test
const still: HeroStageConfig = {
  ...heroStageConfig,
  camera: { ...heroStageConfig.camera, idleOffset: 0 },
  tilt: { ...heroStageConfig.tilt, idleRad: 0 },
};

const run = (stage: ReturnType<typeof createHeroStage>, seconds: number, startMs = 0) => {
  const frames = Math.round(seconds * 60);
  let now = startMs;
  for (let i = 0; i <= frames; i += 1) {
    stage.advance(now);
    now += 1000 / 60;
  }
  return stage.read();
};

describe('createHeroStage', () => {
  it('holds the resting layout with no input', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    const state = run(stage, 2);
    expect(state.camX).toBeCloseTo(0, 6);
    expect(state.tiltY).toBeCloseTo(0, 6);
    expect(state.progress).toBe(0);
  });

  it('turns the view towards the pointer, so the background slides away from it', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, 0.5);
    const state = run(stage, 3);
    expect(state.camX).toBeCloseTo(-still.camera.maxOffset * 720, 1);
    expect(state.camY).toBeCloseTo(-still.camera.maxOffset * 720 * 0.5, 1);
  });

  it('leans the portrait towards the pointer', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, 0.5);
    const state = run(stage, 3);
    expect(state.tiltY).toBeCloseTo(still.tilt.maxRad, 2);
    expect(state.tiltX).toBeCloseTo(still.tilt.maxRad * 0.5, 2);
  });

  // Where the planet lands on screen, y up as the shader has it
  const planetAfter = (pointerX: number, pointerY: number) => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(pointerX, pointerY);
    return planetShift(run(stage, 3), 1440);
  };

  it('looks up when the pointer goes up: the horizon sinks, and rises when it comes down', () => {
    expect(planetAfter(0, -1).y).toBeLessThan(0);
    expect(planetAfter(0, 1).y).toBeGreaterThan(0);
  });

  it('looks left when the pointer goes left: the planet slides right, and left when it comes back', () => {
    expect(planetAfter(-1, 0).x).toBeGreaterThan(0);
    expect(planetAfter(1, 0).x).toBeLessThan(0);
  });

  it('can make the background follow the pointer instead', () => {
    const following: HeroStageConfig = {
      ...still,
      camera: { ...still.camera, turnsTowardsPointer: false },
    };
    const stage = createHeroStage(following);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, -1);
    const shift = planetShift(run(stage, 3), 1440);
    expect(shift.x).toBeGreaterThan(0);
    expect(shift.y).toBeGreaterThan(0);
  });

  it('keeps the pointer inside the viewport', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1000, height: 800, top: 0 });
    stage.setPointer(40, -40);
    const state = run(stage, 3);
    expect(state.camX).toBeCloseTo(-still.camera.maxOffset * 500, 1);
    expect(state.camY).toBeCloseTo(still.camera.maxOffset * 500, 1);
  });

  it('glides back to the middle when the pointer leaves', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, 1);
    run(stage, 2);
    stage.releasePointer();
    const state = run(stage, 3, 2000);
    expect(Math.abs(state.camX)).toBeLessThan(0.01);
  });

  it('follows the scroll position through the hero', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setScroll(450);
    expect(run(stage, 2).progress).toBeCloseTo(0.5, 2);
    stage.setScroll(5000);
    // The spring closes in on 1 from below and never lands on it exactly
    expect(run(stage, 2, 2000).progress).toBeCloseTo(1, 6);
  });

  it('lets the planet fall behind the page as the hero scrolls out', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setScroll(900);
    const state = run(stage, 2);
    expect(state.farY).toBeCloseTo(still.scroll.planetLag * 900, 0);
  });

  it('does the work once per frame however many renderers ask', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, 0);
    stage.advance(0);
    const first = stage.advance(16).camX;
    expect(stage.advance(16).camX).toBe(first);
    expect(stage.advance(16).camX).toBe(first);
  });

  it('snaps to the resting layout and stays there while disabled', () => {
    const stage = createHeroStage(still);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    stage.setPointer(1, 1);
    stage.setScroll(600);
    run(stage, 1);
    stage.setEnabled(false);
    const state = run(stage, 1, 1000);
    expect(state.camX).toBe(0);
    expect(state.progress).toBe(0);
    expect(state.farY).toBe(0);
  });

  it('keeps drifting on its own when the idle motion is on', () => {
    const stage = createHeroStage(heroStageConfig);
    stage.setViewport({ width: 1440, height: 900, top: 0 });
    const seen = new Set<number>();
    let now = 0;
    for (let i = 0; i < 600; i += 1) {
      seen.add(Math.round(stage.advance(now).camX * 100));
      now += 1000 / 60;
    }
    expect(seen.size).toBeGreaterThan(20);
  });
});
