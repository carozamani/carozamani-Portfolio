import { earthHorizonConfig } from './earthHorizon';

// The page sky is the hero's sky: same star field, same drift, same lens. Only the scroll parallax
// and the quality limits are specific to the page-wide backdrop.
const { camera, motion } = earthHorizonConfig;

export const starfieldBackdropConfig = {
  camera: {
    horizontalFovDeg: camera.horizontalFovDeg,
    /** On tall screens the lens narrows so the stars at the top and bottom edges are not stretched. */
    maxVerticalFovDeg: 90,
  },
  motion: {
    starDrift: motion.starDrift,
    initialStarRotation: motion.initialStarRotation,
    /** How fast the stars trail the page while scrolling: 0.15 means they move at 15% of its speed. */
    scrollParallax: 0.15,
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
