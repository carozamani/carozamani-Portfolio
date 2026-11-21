import { createEdgeShape, traceEdge, type EdgeShape } from './blastEdge';
import {
  clamp01,
  createRng,
  easeInOutCubic,
  easeOutCubic,
  farthestCornerDistance,
  type Point,
} from './blastMath';

export type BlastEngine = {
  /** Resolves once the whole screen is black. */
  cover: (origin: Point) => Promise<void>;
  /** Resolves once the black has cleared again. */
  reveal: () => Promise<void>;
  destroy: () => void;
};

type Mode = 'idle' | 'covering' | 'covered' | 'revealing';
// 'fade' is the reduced-motion path: a plain cross-fade through black instead of the ragged front
type Variant = 'blast' | 'fade';

const IGNITE_MS = 110;
const EXPAND_MS = 500;
const COVER_MS = IGNITE_MS + EXPAND_MS;
const REVEAL_MS = 780;
const FADE_COVER_MS = 180;
const FADE_REVEAL_MS = 240;
// Safety net for hidden tabs, where requestAnimationFrame stops: the run is finished by timer
const FORCE_SLACK_MS = 1200;

const SEED_RADIUS = 0.03;
// The front overshoots the farthest corner so its teeth can never leave a gap at the end
const OVERSHOOT = 1.06;
const MAX_BACKING_PIXELS = 2_600_000;

// The edge of the black is feathered, not drawn as a line: a stack of translucent strokes of
// falling width fades it out over FEATHER_BASE + FEATHER_PER_RADIUS * radius pixels.
const FEATHER_BASE = 10;
const FEATHER_PER_RADIUS = 0.13;
const FEATHER_MAX = 150;
const FEATHER_STROKES = [1, 0.84, 0.69, 0.55, 0.42, 0.3, 0.19, 0.09] as const;
const FEATHER_ALPHA = 0.3;

const coverDuration = (variant: Variant) => (variant === 'fade' ? FADE_COVER_MS : COVER_MS);
const revealDuration = (variant: Variant) => (variant === 'fade' ? FADE_REVEAL_MS : REVEAL_MS);

/** How ragged the front is: wildest at the first instant, nearly clean when it settles. */
const edgeAmp = (progress: number, strength: number) => strength * (1 - progress) ** 1.4 + 0.012;

/**
 * The page transition: black spreads from the click point until it covers the screen, the route
 * changes underneath, then the black is eaten away from the same point to show the new page.
 * Nothing else is drawn: no sparks, fragments or light.
 */
export function createBlastEngine(canvas: HTMLCanvasElement): BlastEngine | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let mode: Mode = 'idle';
  let variant: Variant = 'blast';
  let origin: Point = { x: 0, y: 0 };
  let shape: EdgeShape = createEdgeShape(createRng(1));

  let width = 0;
  let height = 0;
  let radiusEnd = 0;

  let startedAt = 0;
  let raf = 0;
  let forceTimer = 0;
  let settle: (() => void) | null = null;

  const measure = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;

    // Cap the backing store so a 4K or retina screen never pays for pixels nobody can tell apart
    const budget = Math.sqrt(MAX_BACKING_PIXELS / (width * height));
    const scale = Math.max(0.75, Math.min(window.devicePixelRatio || 1, 2, budget));
    const backingWidth = Math.round(width * scale);
    const backingHeight = Math.round(height * scale);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    radiusEnd = farthestCornerDistance(origin, width, height) * OVERSHOOT;
  };

  const resetPaint = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.lineJoin = 'round';
  };

  const paintBlack = () => {
    resetPaint();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
  };

  /**
   * Fills the blast front solid and then feathers its outer side with the translucent strokes, so
   * the edge dissolves instead of ending on a line. Uses whatever composite operation is set: black
   * on source-over when covering, an eraser on destination-out when revealing.
   */
  const paintSoftFront = (radius: number, amp: number, time: number) => {
    traceEdge(ctx, shape, origin, radius, amp, time);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fill();

    const feather = Math.min(FEATHER_MAX, FEATHER_BASE + radius * FEATHER_PER_RADIUS);
    ctx.strokeStyle = '#000';
    ctx.globalAlpha = FEATHER_ALPHA;
    for (const fraction of FEATHER_STROKES) {
      ctx.lineWidth = feather * fraction;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const coverRadius = (elapsed: number) => {
    if (elapsed < IGNITE_MS) return radiusEnd * SEED_RADIUS * easeOutCubic(elapsed / IGNITE_MS);
    const x = clamp01((elapsed - IGNITE_MS) / EXPAND_MS);
    return radiusEnd * (SEED_RADIUS + (1 - SEED_RADIUS) * (1 - (1 - x) ** 3.2));
  };

  const drawCover = (elapsed: number) => {
    const progress = clamp01(elapsed / COVER_MS);
    resetPaint();
    ctx.clearRect(0, 0, width, height);
    paintSoftFront(coverRadius(elapsed), edgeAmp(progress, 0.16), elapsed / 1000);
  };

  const drawReveal = (elapsed: number) => {
    const progress = clamp01(elapsed / REVEAL_MS);
    paintBlack();
    // Punch a feathered hole out of the black: the new page shows through where the front has passed
    ctx.globalCompositeOperation = 'destination-out';
    paintSoftFront(radiusEnd * easeInOutCubic(progress), edgeAmp(progress, 0.13), elapsed / 1000);
    resetPaint();
  };

  const drawFade = (alpha: number) => {
    resetPaint();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  };

  const finishCover = () => {
    if (mode !== 'covering') return;
    window.clearTimeout(forceTimer);
    mode = 'covered';
    paintBlack();
    const done = settle;
    settle = null;
    done?.();
  };

  const finishReveal = () => {
    if (mode !== 'revealing') return;
    window.clearTimeout(forceTimer);
    window.cancelAnimationFrame(raf);
    raf = 0;
    mode = 'idle';
    ctx.clearRect(0, 0, width, height);
    canvas.dataset.active = 'false';
    const done = settle;
    settle = null;
    done?.();
  };

  const frame = (now: number) => {
    raf = 0;
    const elapsed = Math.max(0, now - startedAt);

    if (mode === 'covering') {
      if (variant === 'fade') drawFade(clamp01(elapsed / FADE_COVER_MS));
      else drawCover(elapsed);
      if (elapsed >= coverDuration(variant)) finishCover();
    } else if (mode === 'revealing') {
      if (variant === 'fade') drawFade(1 - clamp01(elapsed / FADE_REVEAL_MS));
      else drawReveal(elapsed);
      if (elapsed >= revealDuration(variant)) finishReveal();
    }

    // Once the screen is black there is nothing left to animate, so the loop simply stops
    if (mode === 'covering' || mode === 'revealing') raf = window.requestAnimationFrame(frame);
  };

  const ensureLoop = () => {
    if (!raf) raf = window.requestAnimationFrame(frame);
  };

  const abortRun = () => {
    window.clearTimeout(forceTimer);
    window.cancelAnimationFrame(raf);
    raf = 0;
    mode = 'idle';
    ctx.clearRect(0, 0, width, height);
    const done = settle;
    settle = null;
    done?.();
  };

  const cover: BlastEngine['cover'] = (point) =>
    new Promise<void>((resolve) => {
      abortRun();
      origin = point;
      variant = reducedMotion.matches ? 'fade' : 'blast';
      canvas.dataset.active = 'true';
      measure();

      // Every click rolls its own ragged outline, so two transitions never look the same
      shape = createEdgeShape(createRng((Math.random() * 2 ** 32) >>> 0));

      mode = 'covering';
      startedAt = performance.now();
      settle = resolve;
      forceTimer = window.setTimeout(finishCover, coverDuration(variant) + FORCE_SLACK_MS);
      ensureLoop();
    });

  const reveal: BlastEngine['reveal'] = () =>
    new Promise<void>((resolve) => {
      if (mode !== 'covered') {
        resolve();
        return;
      }
      window.clearTimeout(forceTimer);
      // The viewport may have changed while the page was black; resizing wipes the canvas, so
      // repaint the black before the first frame of the reveal can show the page underneath
      measure();
      paintBlack();

      mode = 'revealing';
      startedAt = performance.now();
      settle = resolve;
      forceTimer = window.setTimeout(finishReveal, revealDuration(variant) + FORCE_SLACK_MS);
      ensureLoop();
    });

  const onResize = () => {
    if (mode === 'idle') return;
    measure();
    if (mode === 'covered') paintBlack();
  };
  window.addEventListener('resize', onResize);

  const destroy = () => {
    window.removeEventListener('resize', onResize);
    abortRun();
    canvas.dataset.active = 'false';
  };

  return { cover, reveal, destroy };
}
