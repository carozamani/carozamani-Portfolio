export type Rgb = readonly [number, number, number];

export interface EarthHorizonConfig {
  camera: {
    /** Angular radius of the planet as seen from the camera. Bigger = camera closer to the surface = flatter horizon. */
    limbAngleDeg: number;
    horizontalFovDeg: number;
    /**
     * Width / height of the frame the composition is designed for. Frames at least this wide show
     * the full field of view; narrower ones (tablets, phones) keep the same composition and simply
     * crop the sides, the way background-size: cover would, instead of squeezing it all in.
     */
    referenceAspect: number;
    /** Where the lowest point of the curve sits, as a fraction of the hero height measured from the top (the planet hangs from the top edge). Bigger = planet lower. */
    horizonHeight: number;
    swayDeg: number;
    swayPeriodSec: number;
  };
  motion: {
    /** Radians per second the ground slides towards the viewer. */
    surfaceSpeed: number;
    /** Stars drift far slower than the ground so the sky feels distant. */
    starDrift: number;
    initialSurfaceRotation: number;
    initialStarRotation: number;
  };
  look: {
    cloudAmount: number;
    /** Brightness of the ground and clouds only; the atmosphere is untouched, so a lower value makes the limb glow stand out. */
    surfaceBrightness: number;
    /** Night-side city lights; they only show where the daylight has faded out near the bottom. */
    cityStrength: number;
    /** Turns the sun sideways around the camera. 0 lights the limb evenly; larger values light one side and leave the other in shadow, like a crescent. */
    sunAzimuthDeg: number;
  };
  /**
   * The planet follows the hero's scroll-out: as the page leaves, the ground sinks into night while
   * the atmosphere stays lit, so the limb glow is what is left. Light only; the hues stay put.
   */
  journey: {
    /** Ground and cloud brightness once the hero is fully scrolled out, as a share of the resting value. */
    surfaceDim: number;
    /** City lights at the end of the scroll, as a multiple of `look.cityStrength`. */
    cityBoost: number;
  };
  colors: {
    /** The three atmosphere colours are replaced at runtime by the menu's active blue (see resolveEarthHorizonConfig); the values here are the fallback. */
    /** Wide, faint atmosphere halo above the limb. */
    deep: Rgb;
    /** Tight blue shoulder of the atmosphere. */
    core: Rgb;
    /** The thin bright line right on the limb. */
    hot: Rgb;
    ocean: Rgb;
    land: Rgb;
    cloud: Rgb;
    city: Rgb;
  };
  quality: {
    maxPixelRatio: number;
    minRenderScale: number;
    slowFrameMs: number;
  };
}

// Tuned against an orbital photograph of Earth's limb: blue daylit ocean, white broken clouds,
// a thin pale atmosphere line, and a surface that falls into darkness away from the limb.
// The curve: across half the frame width the limb drops about 10% of that half-width below its
// crest (77° limb angle at a 96° field of view; the photo's own 75° gave about 12%, a rounder
// ball). The frame is mirrored top to bottom (see earthHorizonShader), so the planet hangs from
// the top edge and the limb's lowest point sits `horizonHeight` of the frame height down from the top.
export const earthHorizonConfig: EarthHorizonConfig = {
  camera: {
    limbAngleDeg: 77,
    horizontalFovDeg: 96,
    referenceAspect: 1.6,
    horizonHeight: 0.15,
    swayDeg: 0.5,
    swayPeriodSec: 16,
  },
  motion: {
    surfaceSpeed: 0.028,
    starDrift: 0.0045,
    initialSurfaceRotation: 2.3,
    initialStarRotation: 0.7,
  },
  look: {
    cloudAmount: 0.95,
    surfaceBrightness: 0.3,
    cityStrength: 0.5,
    sunAzimuthDeg: 0,
  },
  journey: {
    surfaceDim: 0.25,
    cityBoost: 3,
  },
  colors: {
    deep: [0, 0.41, 0.55],
    core: [0, 0.52, 0.7],
    hot: [0, 0.41, 0.55],
    ocean: [0.03, 0.11, 0.3],
    land: [0.09, 0.12, 0.11],
    cloud: [0.86, 0.93, 1.0],
    city: [1.0, 0.8, 0.5],
  },
  quality: {
    maxPixelRatio: 1.5,
    minRenderScale: 0.55,
    slowFrameMs: 34,
  },
};

/**
 * The footer's planet: the same world seen from higher up, so the whole limb curves like the top of a
 * globe instead of running across the page, and lit from one side so its glow reads as a crescent.
 * The hero's 77 degree limb angle is a wide, shallow arc; 56 degrees keeps the planet as wide as the frame
 * but bends the limb noticeably rounder, the way a sphere does.
 */
export const earthFooterConfig: EarthHorizonConfig = {
  ...earthHorizonConfig,
  camera: {
    ...earthHorizonConfig.camera,
    limbAngleDeg: 56,
  },
  look: {
    ...earthHorizonConfig.look,
    sunAzimuthDeg: 35,
  },
};
