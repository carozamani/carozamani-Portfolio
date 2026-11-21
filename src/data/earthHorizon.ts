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
    /** Where the top of the curve sits, as a fraction of the hero height measured from the bottom. */
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
// a thin pale atmosphere line, and a surface that falls into darkness towards the bottom.
// The curve matches the photo: across half the frame width the limb drops about 12% of that
// half-width below its crest (75° limb angle at a 96° field of view), and the crest sits at 43%
// of the frame height.
export const earthHorizonConfig: EarthHorizonConfig = {
  camera: {
    limbAngleDeg: 75,
    horizontalFovDeg: 96,
    referenceAspect: 1.6,
    horizonHeight: 0.43,
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
