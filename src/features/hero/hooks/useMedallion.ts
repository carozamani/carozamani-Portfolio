import { useEffect, type RefObject } from 'react';

import { heroStageConfig } from '@/data/heroStage';

import type { HeroStage } from '../lib/createHeroStage';
import {
  createMedallionRenderer,
  type MedallionFrame,
  type MedallionRenderer,
} from '../lib/createMedallionRenderer';
import { rasterizeFace } from '../lib/medallionFaces';
import {
  MAX_FRAME_SEC,
  clamp01,
  createSpring,
  stepSpring,
  type StageState,
} from '../lib/stageMath';

const TAU = Math.PI * 2;
const QUALITY_SAMPLE_FRAMES = 45;
const QUALITY_STEP = 0.15;
const MAX_FRAME_GAP_SEC = 0.25;

const REST_STATE: Readonly<StageState> = {
  camX: 0,
  camY: 0,
  tiltX: 0,
  tiltY: 0,
  progress: 0,
  farX: 0,
  farY: 0,
  time: 0,
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

interface FaceCanvases {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
}

interface MedallionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  stageRef: RefObject<HeroStage | null>;
  /** Where the flip is heading: 0 shows the portrait, 1 the logo. */
  flipRef: RefObject<number>;
  /** True once the first WebGL frame is up, false again if it is lost; the HTML ring fills in meanwhile. */
  onReadyChange: (ready: boolean) => void;
}

/**
 * Draws the portrait medallion into the canvas that sits over the HTML portrait. The HTML ring and
 * images stay in the page as the fallback, the hover target and the accessible name: their pixels are
 * the textures, and their measured ring is where the WebGL ring lands. The lean comes from the hero
 * stage, so the coin turns towards the pointer together with the planet and the HTML layers.
 */
export function useMedallion({ canvasRef, stageRef, flipRef, onReadyChange }: MedallionOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || !heroStageConfig.enabled) return;

    const frontImage = host.querySelector<HTMLImageElement>('img[data-medallion-face="front"]');
    const backImage = host.querySelector<HTMLImageElement>('img[data-medallion-face="back"]');
    const card = host.querySelector<HTMLElement>('[data-medallion-card]');
    if (!frontImage || !backImage || !card) return;

    const config = heroStageConfig.medallion;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, config.quality.maxPixelRatio);

    const flip = createSpring();
    const ringTiltX = createSpring();
    const ringTiltY = createSpring();
    const frame: MedallionFrame = {
      time: 0,
      intro: 1,
      flip: 0,
      tiltX: 0,
      tiltY: 0,
      ringTiltX: 0,
      ringTiltY: 0,
      bob: 0,
    };

    let renderer: MedallionRenderer | null = null;
    let faces: FaceCanvases | null = null;
    let state: Readonly<StageState> = REST_STATE;
    let renderScale = 1;
    let elapsed = 0;
    let lastFrame = 0;
    let frameId = 0;
    let visible = true;
    let cancelled = false;
    let sampledFrames = 0;
    let sampledTime = 0;

    // The ring is measured from the HTML one (padding and border around the portrait), so the two
    // coincide at every breakpoint and the hand-over from HTML to WebGL is invisible
    const measureLayout = () => {
      const half = card.clientWidth / 2;
      if (!renderer || !half) return;
      const style = getComputedStyle(host);
      const padding = parseFloat(style.paddingLeft) || 0;
      const border = parseFloat(style.borderLeftWidth) || 0;
      renderer.setLayout({
        extent: canvas.clientWidth / 2 / half,
        ringRadius: (half + padding + border / 2) / half,
        tubeRadius: border / 2 / half,
      });
    };

    // A resting frame is the finished composition: ring drawn, portrait facing front, nothing floating
    const draw = (animated: boolean) => {
      if (!renderer) return;
      frame.time = elapsed;
      frame.intro = animated ? easeOutCubic(clamp01(elapsed / config.introSec)) : 1;
      frame.flip = animated ? flip.value * Math.PI : 0;
      frame.tiltX = state.tiltX;
      frame.tiltY = state.tiltY;
      frame.ringTiltX = ringTiltX.value;
      frame.ringTiltY = ringTiltY.value;
      frame.bob = animated
        ? Math.sin((elapsed * TAU) / config.bobPeriodSec) * config.bobAmplitude
        : 0;
      renderer.render(frame);
    };

    const resize = () => {
      const scale = pixelRatio * renderScale;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      renderer?.resize(canvas.width, canvas.height);
      measureLayout();
      draw(frameId !== 0);
    };

    // Only ever steps down: stepping back up would oscillate on a GPU that sits right at the limit
    const adaptQuality = (frameSec: number) => {
      if (frameSec > MAX_FRAME_GAP_SEC) return;
      sampledTime += frameSec;
      sampledFrames += 1;
      if (sampledFrames < QUALITY_SAMPLE_FRAMES) return;

      const averageMs = (sampledTime / sampledFrames) * 1000;
      sampledFrames = 0;
      sampledTime = 0;
      if (averageMs > config.quality.slowFrameMs && renderScale > config.quality.minRenderScale) {
        renderScale = Math.max(config.quality.minRenderScale, renderScale - QUALITY_STEP);
        resize();
      }
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const frameSec = (now - lastFrame) / 1000;
      lastFrame = now;
      const dt = Math.min(frameSec, MAX_FRAME_SEC);
      elapsed += dt;

      state = stageRef.current?.advance(now) ?? REST_STATE;
      stepSpring(flip, flipRef.current, dt, config.flip);
      stepSpring(ringTiltX, state.tiltX, dt, config.ringLag);
      stepSpring(ringTiltY, state.tiltY, dt, config.ringLag);
      draw(true);
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
        if (motionQuery.matches) {
          state = REST_STATE;
          draw(false);
        }
      }
    };

    const start = (created: MedallionRenderer, ready: FaceCanvases) => {
      renderer = created;
      created.setFaces(ready.front, ready.back);
      elapsed = 0;
      resize();
      canvas.dataset.ready = 'true';
      onReadyChange(true);
      sync();
    };

    const init = async () => {
      const created = createMedallionRenderer(canvas, config);
      // Without WebGL the HTML ring stays exactly as it was
      if (!created) return;

      if (!faces) {
        const [front, back] = await Promise.all([
          rasterizeFace(frontImage),
          rasterizeFace(backImage),
        ]);
        if (front && back) faces = { front, back };
      }
      if (cancelled || !faces) {
        created.dispose();
        return;
      }
      start(created, faces);
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      renderer = null;
      delete canvas.dataset.ready;
      onReadyChange(false);
    };
    const handleContextRestored = () => void init();

    void init();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(canvas);

    motionQuery.addEventListener('change', sync);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      cancelled = true;
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener('change', sync);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      renderer?.dispose();
      renderer = null;
      delete canvas.dataset.ready;
      onReadyChange(false);
    };
  }, [canvasRef, stageRef, flipRef, onReadyChange]);
}
