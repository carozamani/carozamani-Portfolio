import { useEffect, type RefObject } from 'react';

import { earthHorizonConfig, type EarthHorizonConfig } from '@/data/earthHorizon';
import { createQualityGovernor } from '@/lib/gl/qualityGovernor';

import {
  createEarthHorizonRenderer,
  type EarthHorizonRenderer,
} from '../lib/createEarthHorizonRenderer';
import type { HeroStage } from '../lib/createHeroStage';
import { resolveEarthHorizonConfig } from '../lib/resolveEarthHorizonConfig';
import { planetShift } from '../lib/stageMath';

export function useEarthHorizon(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  stageRef: RefObject<HeroStage | null>,
  config: EarthHorizonConfig = earthHorizonConfig,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const { quality } = config;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
    const governor = createQualityGovernor({
      slowFrameMs: quality.slowFrameMs,
      minRenderScale: quality.minRenderScale,
    });

    let renderer: EarthHorizonRenderer | null = null;
    let renderScale = 1;
    let elapsed = 0;
    let lastFrame = 0;
    let frameId = 0;
    let visible = true;
    let halveRate = false;
    let frameIndex = 0;
    let widthPx = 1;

    // The planet is the farthest thing in the hero's camera: the turn of the lens moves it the most and
    // it falls behind the page on scroll. Passing the frame time lets whichever renderer ticks first move the
    // stage for all of them; a redraw without one just reads where the stage already is.
    const stageAt = (frameMs?: number) => {
      const stage = stageRef.current;
      if (!stage) return undefined;
      return frameMs === undefined ? stage.read() : stage.advance(frameMs);
    };

    // Its light follows the same scroll: the ground sinks into night as the hero leaves (planetJourney)
    const draw = (frameMs?: number) => {
      const state = stageAt(frameMs);
      renderer?.render(elapsed, state && planetShift(state, widthPx), state?.progress);
    };

    const resize = () => {
      widthPx = host.clientWidth;
      const scale = pixelRatio * renderScale;
      canvas.width = Math.max(1, Math.round(host.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(host.clientHeight * scale));
      renderer?.resize(canvas.width, canvas.height);
      draw();
    };

    // A device that keeps up is never touched: the governor only reacts to frames that are really slow
    const adaptQuality = (frameSec: number) => {
      const next = governor.record(frameSec);
      if (!next) return;
      halveRate = next.halveRate;
      if (next.renderScale !== renderScale) {
        renderScale = next.renderScale;
        resize();
      }
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const frameSec = (now - lastFrame) / 1000;
      lastFrame = now;
      elapsed += Math.min(frameSec, 0.1);
      // Only after the resolution has hit its floor: the planet drifts slowly enough for 30fps to read the same
      frameIndex += 1;
      if (halveRate && frameIndex % 2 === 0) return;
      draw(now);
      adaptQuality(frameSec);
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const sync = () => {
      if (!renderer) return;
      if (visible && !motionQuery.matches) {
        if (frameId) return;
        lastFrame = performance.now();
        frameId = requestAnimationFrame(tick);
      } else {
        stop();
        draw();
      }
    };

    const init = () => {
      renderer = createEarthHorizonRenderer(canvas, resolveEarthHorizonConfig(config));
      if (!renderer) return;
      resize();
      canvas.dataset.ready = 'true';
      sync();
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      renderer = null;
      delete canvas.dataset.ready;
    };

    init();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(canvas);

    motionQuery.addEventListener('change', sync);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', init);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener('change', sync);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', init);
      renderer?.dispose();
      delete canvas.dataset.ready;
    };
  }, [canvasRef, stageRef, config]);
}
