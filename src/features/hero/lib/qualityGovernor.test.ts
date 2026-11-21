import { describe, expect, it } from 'vitest';

import {
  createQualityGovernor,
  type QualityGovernor,
  type QualitySettings,
} from './qualityGovernor';

const options = { slowFrameMs: 34, minRenderScale: 0.55, sampleFrames: 24, warmupFrames: 6 };

// Feeds `count` identical frames and returns every decision the governor made
function feed(governor: QualityGovernor, count: number, frameSec: number) {
  const decisions: QualitySettings[] = [];
  for (let i = 0; i < count; i += 1) {
    const decision = governor.record(frameSec);
    if (decision) decisions.push(decision);
  }
  return decisions;
}

const WARMUP_AND_SAMPLE = options.warmupFrames + options.sampleFrames;

describe('createQualityGovernor', () => {
  it('leaves a device that keeps up completely alone', () => {
    const governor = createQualityGovernor(options);
    expect(feed(governor, 600, 1 / 60)).toEqual([]);
  });

  it('does not react to a display that simply runs at 30Hz', () => {
    const governor = createQualityGovernor(options);
    expect(feed(governor, 600, 1 / 30)).toEqual([]);
  });

  it('ignores the warm-up frames, however slow', () => {
    const governor = createQualityGovernor(options);
    expect(feed(governor, options.warmupFrames, 0.2)).toEqual([]);
    expect(feed(governor, options.sampleFrames - 1, 1 / 60)).toEqual([]);
  });

  it('ignores the gap left by a tab that was in the background', () => {
    const governor = createQualityGovernor(options);
    expect(feed(governor, 200, 3)).toEqual([]);
  });

  it('jumps straight to the resolution the measured cost calls for', () => {
    const governor = createQualityGovernor(options);
    // 68ms frames: cost scales with area, so the scale that fits is sqrt(34 / 68)
    const [first] = feed(governor, WARMUP_AND_SAMPLE, 0.068);
    expect(first.renderScale).toBeCloseTo(Math.SQRT1_2, 2);
    expect(first.halveRate).toBe(false);
  });

  it('caps a single step so one terrible sample does not collapse the picture', () => {
    const governor = createQualityGovernor(options);
    const [first] = feed(governor, WARMUP_AND_SAMPLE, 0.2);
    expect(first.renderScale).toBeCloseTo(0.6, 5);
  });

  it('takes a small step when the frames are only a little over budget', () => {
    const governor = createQualityGovernor(options);
    const [first] = feed(governor, WARMUP_AND_SAMPLE, 0.036);
    expect(first.renderScale).toBeCloseTo(0.92, 5);
  });

  it('does not count the frames right after a change against the new size', () => {
    const governor = createQualityGovernor(options);
    feed(governor, WARMUP_AND_SAMPLE, 0.068);
    expect(feed(governor, options.warmupFrames + options.sampleFrames - 1, 0.068)).toEqual([]);
  });

  it('never goes below the floor, and then halves the frame rate instead', () => {
    const governor = createQualityGovernor(options);
    const decisions = feed(governor, WARMUP_AND_SAMPLE * 10, 0.2);

    const scales = decisions.map((decision) => decision.renderScale);
    expect(Math.min(...scales)).toBeCloseTo(options.minRenderScale, 5);
    expect(scales.every((scale) => scale >= options.minRenderScale - 1e-9)).toBe(true);

    const last = decisions[decisions.length - 1];
    expect(last.halveRate).toBe(true);
    expect(last.renderScale).toBeCloseTo(options.minRenderScale, 5);
  });

  it('stops deciding once the frame rate is halved', () => {
    const governor = createQualityGovernor(options);
    feed(governor, WARMUP_AND_SAMPLE * 10, 0.2);
    expect(feed(governor, 500, 0.2)).toEqual([]);
  });

  it('never steps back up, even when the frames get fast again', () => {
    const governor = createQualityGovernor(options);
    feed(governor, WARMUP_AND_SAMPLE, 0.068);
    expect(feed(governor, 600, 1 / 60)).toEqual([]);
  });
});
