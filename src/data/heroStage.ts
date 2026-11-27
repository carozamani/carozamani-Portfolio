import type { Rgb } from './earthHorizon';

export type StageLayerName = 'near' | 'mid' | 'far';

export interface StageLayerConfig {
  /**
   * Distance towards the viewer as a fraction of the lens distance: positive sits in front of the plane
   * the lens is aimed at, negative behind it. It only sets how fast the layer grows as the lens flies
   * past on scroll. HTML layers never move with the pointer.
   */
  depth: number;
  /** Scroll progress at which the layer starts and finishes fading out as the lens flies past it. */
  fade: readonly [from: number, to: number];
}

export interface SpringConfig {
  /** Radians per second: higher follows its target faster. */
  rate: number;
  /** 1 settles without overshoot, below 1 lets it swing past the target once. */
  damping: number;
}

export interface HeroStageConfig {
  /** Switches the whole 3D stage off (the planet stays); the hero falls back to its flat layout. */
  enabled: boolean;
  camera: {
    /** How far the background (planet and grid) slides with the pointer at the screen edge, as a fraction of half the hero width. */
    maxOffset: number;
    /**
     * true: the view turns towards the pointer, so the background slides the other way (pointer up
     * looks up and the horizon sinks, pointer left looks left and the planet slides right).
     * false: the background follows the pointer instead.
     */
    turnsTowardsPointer: boolean;
    /** How far the background drifts on its own when nothing moves, same unit. */
    idleOffset: number;
    /** Seconds per drift cycle on x and y; unequal so the path never repeats exactly. */
    idlePeriodsSec: readonly [x: number, y: number];
    follow: SpringConfig;
  };
  tilt: {
    /** Lean of the portrait towards the pointer at the screen edge, in radians. */
    maxRad: number;
    idleRad: number;
    follow: SpringConfig;
  };
  scroll: {
    /** How far the lens flies forward while the hero scrolls away, as a fraction of the lens distance. */
    dolly: number;
    /** Share of the scrolled distance by which the distant planet falls behind the page. */
    planetLag: number;
    follow: SpringConfig;
  };
  layers: Record<StageLayerName, StageLayerConfig>;
  /** The grid is the floor of the scene: it sits behind the content and lays back as the hero scrolls out. */
  grid: { depth: number; floorDeg: number; floorScale: number };
  medallion: {
    flip: SpringConfig;
    /** The outer ring and the glow trail the portrait's lean with this lag. */
    ringLag: SpringConfig;
    /** Vertical float of the portrait, in portrait radii, and the seconds one float takes. */
    bobAmplitude: number;
    bobPeriodSec: number;
    /** How long the ring takes to draw itself in on load. */
    introSec: number;
    look: {
      /** Strength of the ring light: core, shoulder and halo. */
      glow: number;
    };
    colors: { ring: Rgb; hot: Rgb; deep: Rgb };
    quality: { maxPixelRatio: number; minRenderScale: number; slowFrameMs: number };
  };
}

// The planet and the grid are the background: the pointer turns the view and they slide with it, the
// planet most. The HTML layers (portrait, wordmark, title, actions) never react to the pointer; their
// depth only decides how fast they fly past as the hero scrolls away.
export const heroStageConfig: HeroStageConfig = {
  enabled: true,
  camera: {
    maxOffset: 0.033,
    turnsTowardsPointer: true,
    idleOffset: 0.006,
    idlePeriodsSec: [17, 23],
    follow: { rate: 5.5, damping: 1 },
  },
  tilt: {
    maxRad: 0.19,
    idleRad: 0.035,
    follow: { rate: 7.5, damping: 0.82 },
  },
  scroll: {
    dolly: 0.36,
    planetLag: 0.22,
    follow: { rate: 45, damping: 1 },
  },
  layers: {
    near: { depth: 0.22, fade: [0.2, 0.66] },
    mid: { depth: 0, fade: [0.3, 0.78] },
    far: { depth: -0.12, fade: [0.4, 0.9] },
  },
  grid: { depth: -0.3, floorDeg: 58, floorScale: 1.3 },
  medallion: {
    flip: { rate: 9, damping: 0.62 },
    ringLag: { rate: 3.4, damping: 0.75 },
    bobAmplitude: 0.022,
    bobPeriodSec: 7.5,
    introSec: 2.4,
    look: { glow: 1 },
    // The ring keeps the site's hero-ring cyan (--color-hero-ring); the hot core and the deep halo
    // match the atmosphere line of the planet behind it.
    colors: {
      ring: [0, 0.85, 1],
      hot: [0.72, 0.93, 1],
      deep: [0, 0.4, 1],
    },
    quality: { maxPixelRatio: 2, minRenderScale: 0.5, slowFrameMs: 30 },
  },
};
