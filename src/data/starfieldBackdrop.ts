import { earthHorizonConfig } from './earthHorizon';

// The page sky is the hero's sky: same drift, same lens. Only the scroll sweep and the quality limits
// are specific to the page-wide backdrop.
const { camera, motion } = earthHorizonConfig;

export const starfieldBackdropConfig = {
  camera: {
    horizontalFovDeg: camera.horizontalFovDeg,
    /** On tall screens the lens narrows so the stars at the top and bottom edges are not stretched. */
    maxVerticalFovDeg: 90,
  },
  motion: {
    starDrift: motion.starDrift,
    // Start with the gaze tilted above the planet; the former positive pitch pointed down.
    initialCameraPitch: -Math.abs(motion.initialStarRotation),
    /** Camera pitch from the upper sky toward the planet below, across the full page. */
    scrollSweep: Math.PI,
  },
  dim: {
    /** Keep the page-wide sky at full brightness from the top to the bottom. */
    floor: 1,
  },
  quality: {
    maxPixelRatio: 1.5,
    minRenderScale: 0.5,
    slowFrameMs: 30,
    /** The sky only twinkles when nothing scrolls, so it is redrawn at this rate to save power. */
    idleFps: 10,
  },
};

export type StarfieldBackdropConfig = typeof starfieldBackdropConfig;
