import type { HeroStageConfig } from '@/data/heroStage';

import {
  MAX_FRAME_SEC,
  clamp01,
  createSpring,
  idleDrift,
  stepSpring,
  type StageState,
} from './stageMath';

export interface StageViewport {
  width: number;
  height: number;
  /** Distance from the top of the document to the top of the hero. */
  top: number;
}

/**
 * The camera of the hero: one lens that the pointer and the scroll position move, read by every layer
 * (the planet, the portrait and the HTML) so that they all move as parts of the same scene.
 */
export interface HeroStage {
  /**
   * Moves the stage up to the frame time `nowMs`. Calling it again for the same frame costs nothing, so
   * every renderer can call it at the top of its own tick and they all see the same state whichever runs
   * first. The returned object is reused between frames: read it, do not keep it.
   */
  advance: (nowMs: number) => Readonly<StageState>;
  /** The state as of the last `advance`. */
  read: () => Readonly<StageState>;
  /** Pointer position in -1..1 across the viewport, y down. */
  setPointer: (x: number, y: number) => void;
  /** The pointer left the hero: the lens glides back to the middle. */
  releasePointer: () => void;
  setScroll: (scrollY: number) => void;
  setViewport: (viewport: StageViewport) => void;
  /** Off, the stage holds the resting layout (reduced motion). */
  setEnabled: (enabled: boolean) => void;
}

const clampSigned = (x: number) => Math.min(1, Math.max(-1, x));

export function createHeroStage({ camera, tilt, scroll }: HeroStageConfig): HeroStage {
  const camX = createSpring();
  const camY = createSpring();
  const tiltX = createSpring();
  const tiltY = createSpring();
  const progress = createSpring();

  const state: StageState = {
    camX: 0,
    camY: 0,
    tiltX: 0,
    tiltY: 0,
    progress: 0,
    farX: 0,
    farY: 0,
    time: 0,
  };

  let viewport: StageViewport = { width: 1, height: 1, top: 0 };
  let pointerX = 0;
  let pointerY = 0;
  let scrollY = 0;
  let enabled = true;
  let lastNowMs = -1;

  const toRest = () => {
    for (const spring of [camX, camY, tiltX, tiltY, progress]) {
      spring.value = 0;
      spring.velocity = 0;
    }
    Object.assign(state, {
      camX: 0,
      camY: 0,
      tiltX: 0,
      tiltY: 0,
      progress: 0,
      farX: 0,
      farY: 0,
    });
  };

  return {
    advance(nowMs) {
      if (nowMs === lastNowMs) return state;
      const dt =
        lastNowMs < 0 ? 0 : Math.min(Math.max((nowMs - lastNowMs) / 1000, 0), MAX_FRAME_SEC);
      lastNowMs = nowMs;
      if (!enabled) return state;

      state.time += dt;
      const idle = idleDrift(state.time, camera.idlePeriodsSec);
      const halfWidth = viewport.width / 2;
      // The view turns towards the pointer, so the scene slides the other way: pointer up looks up and
      // the horizon sinks, pointer left looks left and the planet slides right
      const turn = camera.turnsTowardsPointer ? -1 : 1;

      stepSpring(
        camX,
        (turn * pointerX * camera.maxOffset + idle.x * camera.idleOffset) * halfWidth,
        dt,
        camera.follow,
      );
      stepSpring(
        camY,
        (turn * pointerY * camera.maxOffset + idle.y * camera.idleOffset) * halfWidth,
        dt,
        camera.follow,
      );
      stepSpring(tiltY, pointerX * tilt.maxRad + idle.x * tilt.idleRad, dt, tilt.follow);
      stepSpring(tiltX, pointerY * tilt.maxRad + idle.y * tilt.idleRad, dt, tilt.follow);
      stepSpring(progress, clamp01((scrollY - viewport.top) / viewport.height), dt, scroll.follow);

      state.camX = camX.value;
      state.camY = camY.value;
      state.tiltX = tiltX.value;
      state.tiltY = tiltY.value;
      state.progress = clamp01(progress.value);
      // The planet is at infinity: it follows the lens fully and lags the page as the hero scrolls away
      state.farX = camX.value;
      state.farY = camY.value + scroll.planetLag * state.progress * viewport.height;
      return state;
    },

    read: () => state,

    setPointer(x, y) {
      pointerX = clampSigned(x);
      pointerY = clampSigned(y);
    },

    releasePointer() {
      pointerX = 0;
      pointerY = 0;
    },

    setScroll(value) {
      scrollY = value;
    },

    setViewport(next) {
      viewport = {
        width: Math.max(next.width, 1),
        height: Math.max(next.height, 1),
        top: next.top,
      };
    },

    setEnabled(next) {
      if (enabled === next) return;
      enabled = next;
      if (!next) toRest();
    },
  };
}
