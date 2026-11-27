// A tab that was in the background comes back with a huge frame gap: it says nothing about the GPU
const MAX_FRAME_GAP_SEC = 0.25;
// Shader compile and canvas reallocation make the first frames slow on any device
const DEFAULT_WARMUP_FRAMES = 6;
const DEFAULT_SAMPLE_FRAMES = 24;
// One decision never cuts the resolution by more than 40% or less than 8%, so a single bad sample
// neither collapses the picture nor changes nothing
const MIN_STEP = 0.6;
const MAX_STEP = 0.92;

export interface QualityGovernorOptions {
  /** Average frame time above which the render counts as too slow. */
  slowFrameMs: number;
  /** The resolution never drops below this share of full. */
  minRenderScale: number;
  sampleFrames?: number;
  warmupFrames?: number;
}

export interface QualitySettings {
  renderScale: number;
  /** Last resort: draw on every other frame once the resolution is already at its floor. */
  halveRate: boolean;
}

export interface QualityGovernor {
  /** Feeds in one frame's duration. Returns the new settings when they change, otherwise null. */
  record: (frameSec: number) => QualitySettings | null;
}

/**
 * Keeps a full-screen shader inside its frame budget without touching a device that keeps up: it only
 * ever steps down (stepping back up would oscillate on a GPU sitting right at the limit), jumps
 * straight to the resolution the measured cost calls for (cost grows with the square of the scale),
 * and only then, as a last resort, halves the frame rate.
 */
export function createQualityGovernor({
  slowFrameMs,
  minRenderScale,
  sampleFrames = DEFAULT_SAMPLE_FRAMES,
  warmupFrames = DEFAULT_WARMUP_FRAMES,
}: QualityGovernorOptions): QualityGovernor {
  let renderScale = 1;
  let halveRate = false;
  let warmup = warmupFrames;
  let frames = 0;
  let totalSec = 0;

  return {
    record(frameSec) {
      if (halveRate || frameSec > MAX_FRAME_GAP_SEC) return null;
      if (warmup > 0) {
        warmup -= 1;
        return null;
      }

      totalSec += frameSec;
      frames += 1;
      if (frames < sampleFrames) return null;

      const averageMs = (totalSec / frames) * 1000;
      frames = 0;
      totalSec = 0;
      if (averageMs <= slowFrameMs) return null;

      if (renderScale > minRenderScale) {
        const step = Math.min(MAX_STEP, Math.max(MIN_STEP, Math.sqrt(slowFrameMs / averageMs)));
        renderScale = Math.max(minRenderScale, renderScale * step);
      } else {
        halveRate = true;
      }
      // Reallocating the canvas costs a few frames of its own, which must not count against the new size
      warmup = warmupFrames;
      return { renderScale, halveRate };
    },
  };
}
