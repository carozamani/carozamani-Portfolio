import { useEffect, type RefObject } from 'react';

import { starfieldBackdropConfig } from '@/data/starfieldBackdrop';
import { createStarfieldRenderer, type StarfieldRenderer } from '@/lib/gl/createStarfieldRenderer';
import { createQualityGovernor } from '@/lib/gl/qualityGovernor';
import { cameraPitch, sweepProgress } from '@/lib/gl/starfieldMotion';
import { registerStarfieldSnapshot } from '@/lib/gl/starfieldSnapshot';

/**
 * Drives a fixed celestial sphere behind every section. The camera starts looking above the planet
 * and pitches smoothly through 180 degrees toward it as the page scrolls, keeping the horizon upright.
 */
export function usePageStarfield(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { motion, quality, dim } = starfieldBackdropConfig;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
    const governor = createQualityGovernor({
      slowFrameMs: quality.slowFrameMs,
      minRenderScale: quality.minRenderScale,
    });
    const idleFrameMs = 1000 / quality.idleFps;

    let renderer: StarfieldRenderer | null = null;
    let renderScale = 1;
    let halveRate = false;
    let elapsed = 0;
    let lastFrame = 0;
    let lastDrawnAt = 0;
    let lastScroll = Number.NaN;
    let frameId = 0;
    let frameIndex = 0;
    // How far there is to scroll, measured when the page changes size rather than on every frame
    let scrollable = 0;
    let viewport = window.innerHeight;
    // A new page starts its scroll from the top. The orientation the sky had when the last page ended
    // is carried over, so the stars carry on from where they were instead of jumping back, and so the
    // page transition's snapshot of the sky still matches the page it reveals.
    let carried = 0;
    let lastTurn = 0;
    let lastPath = window.location.pathname;

    // Under reduced motion the sky holds still: no drift, and no sweep with the scroll
    const draw = () => {
      if (!renderer) return;
      const scroll = window.scrollY;
      const still = motionQuery.matches;
      const sweep = still ? 0 : sweepProgress(scroll, scrollable);
      let pitch = cameraPitch(motion, still ? 0 : elapsed, sweep) + carried;

      const path = window.location.pathname;
      if (path !== lastPath) {
        carried += lastTurn - pitch;
        pitch = lastTurn;
        lastPath = path;
      }

      renderer.render({ elapsedSec: elapsed, cameraPitch: pitch, dim: dim.floor });
      lastTurn = pitch;
      lastScroll = scroll;
    };

    const measure = () => {
      viewport = window.innerHeight;
      scrollable = Math.max(document.documentElement.scrollHeight - viewport, 0);
      draw();
    };

    const resize = () => {
      const scale = pixelRatio * renderScale;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      renderer?.resize(canvas.width, canvas.height);
      measure();
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

      // Nothing but the twinkle moves while the page is still, so it is redrawn at a gentle rate
      const scrolling = window.scrollY !== lastScroll;
      if (!scrolling && now - lastDrawnAt < idleFrameMs) return;
      frameIndex += 1;
      // Never skip a frame while scrolling: a skipped frame would leave the sky a step behind the page
      if (!scrolling && halveRate && frameIndex % 2 === 0) return;

      draw();
      lastDrawnAt = now;
      adaptQuality(frameSec);
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const sync = () => {
      if (!renderer) return;
      if (motionQuery.matches) {
        stop();
        draw();
      } else if (!frameId) {
        lastFrame = performance.now();
        frameId = requestAnimationFrame(tick);
      }
    };

    // Only needed while no frame loop runs: the loop already redraws on every scroll
    const onScroll = () => {
      if (!frameId) draw();
    };

    const init = () => {
      renderer = createStarfieldRenderer(canvas, starfieldBackdropConfig);
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

    // Lets the page transition paint these same stars. A WebGL canvas only keeps its pixels until the
    // browser composites it, so the sky is drawn again and copied within the same task. The copy carries
    // the opacity the page shows the sky at, so it matches what is on screen.
    const unregisterSnapshot = registerStarfieldSnapshot((target, width, height) => {
      if (!renderer || canvas.dataset.ready !== 'true') return false;
      draw();
      target.save();
      target.globalAlpha = Number.parseFloat(getComputedStyle(canvas).opacity) || 1;
      target.drawImage(canvas, 0, 0, width, height);
      target.restore();
      return true;
    });

    // The document grows as the lazy sections load, which changes how far there is to scroll
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const heightObserver = new ResizeObserver(measure);
    heightObserver.observe(document.body);

    window.addEventListener('scroll', onScroll, { passive: true });
    motionQuery.addEventListener('change', sync);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', init);

    return () => {
      stop();
      unregisterSnapshot();
      resizeObserver.disconnect();
      heightObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      motionQuery.removeEventListener('change', sync);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', init);
      renderer?.dispose();
      delete canvas.dataset.ready;
    };
  }, [canvasRef]);
}
