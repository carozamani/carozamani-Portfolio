import { rgbCss, type BlastPalette } from './blastPalette';

const CAPACITY = 900;
const DEAD = 0;
const SPARK = 1;
const DEBRIS = 2;

const SPARK_DRAG = 3;
const DEBRIS_DRAG = 0.55;
const BASE_GRAVITY = 760;
const TAIL_SECONDS = 0.013;
const CORNERS = 4;

// Sparks are stroked in batches by colour, width and age: a handful of stroke() calls per frame
// instead of one per particle. A spark cools white -> light grey -> grey as it ages.
const LINE_WIDTHS = [0.9, 1.7] as const;
const SPARK_STAGE_TINT = [0, 1, 2, 2] as const;
const SPARK_STAGE_ALPHA = [1, 0.95, 0.65, 0.3] as const;
const sparkStage = (aged: number) => (aged < 0.14 ? 0 : aged < 0.4 ? 1 : aged < 0.7 ? 2 : 3);

// A fragment glows while it is hot, then goes dark: core -> primary -> ash
const debrisHeat = (seconds: number) => (seconds < 0.12 ? 0 : seconds < 0.34 ? 1 : 2);

export type ParticlePool = {
  emitSpark: (
    x: number,
    y: number,
    angle: number,
    speed: number,
    life: number,
    thick: boolean,
  ) => void;
  /** `grow` makes a fragment swell as it tumbles, as if it were flying towards the viewer. */
  emitDebris: (
    x: number,
    y: number,
    angle: number,
    speed: number,
    life: number,
    size: number,
    grow: number,
  ) => void;
  /** Gravity follows the viewport so a big screen and a small one fall at the same pace. */
  setScale: (scale: number) => void;
  step: (dt: number) => void;
  hasLive: () => boolean;
  /** Draws every nth particle, which is how the engine sheds load on a slow device. */
  draw: (stride: number) => void;
  clear: () => void;
};

export function createParticlePool(
  ctx: CanvasRenderingContext2D,
  palette: BlastPalette,
): ParticlePool {
  const px = new Float32Array(CAPACITY);
  const py = new Float32Array(CAPACITY);
  const vx = new Float32Array(CAPACITY);
  const vy = new Float32Array(CAPACITY);
  const age = new Float32Array(CAPACITY);
  const life = new Float32Array(CAPACITY);
  const size = new Float32Array(CAPACITY);
  const grow = new Float32Array(CAPACITY);
  const rotation = new Float32Array(CAPACITY);
  const spin = new Float32Array(CAPACITY);
  const corners = new Float32Array(CAPACITY * CORNERS * 2);
  const kind = new Uint8Array(CAPACITY);
  const thick = new Uint8Array(CAPACITY);
  const sparkCss = [rgbCss(palette.core), rgbCss(palette.primary), rgbCss(palette.secondary)];
  const debrisCss = [rgbCss(palette.core), rgbCss(palette.primary), rgbCss(palette.ash)];

  let gravity = BASE_GRAVITY;
  let cursor = 0;
  let used = 0;

  const claim = () => {
    for (let n = 0; n < CAPACITY; n++) {
      const i = (cursor + n) % CAPACITY;
      if (kind[i] !== DEAD) continue;
      cursor = (i + 1) % CAPACITY;
      if (i + 1 > used) used = i + 1;
      return i;
    }
    return -1;
  };

  const spawn = (
    slot: number,
    particleKind: number,
    x: number,
    y: number,
    angle: number,
    speed: number,
    lifetime: number,
  ) => {
    px[slot] = x;
    py[slot] = y;
    vx[slot] = Math.cos(angle) * speed;
    vy[slot] = Math.sin(angle) * speed;
    age[slot] = 0;
    life[slot] = lifetime;
    kind[slot] = particleKind;
  };

  const emitSpark: ParticlePool['emitSpark'] = (x, y, angle, speed, lifetime, isThick) => {
    const slot = claim();
    if (slot < 0) return;
    thick[slot] = isThick ? 1 : 0;
    spawn(slot, SPARK, x, y, angle, speed, lifetime);
  };

  const emitDebris: ParticlePool['emitDebris'] = (x, y, angle, speed, lifetime, radius, swell) => {
    const slot = claim();
    if (slot < 0) return;
    size[slot] = radius;
    grow[slot] = swell;
    rotation[slot] = Math.random() * Math.PI * 2;
    spin[slot] = (Math.random() * 2 - 1) * 9;
    // An irregular quadrilateral, never the same twice
    for (let corner = 0; corner < CORNERS; corner++) {
      const cornerAngle = (corner * Math.PI * 2) / CORNERS + (Math.random() - 0.5) * 0.9;
      const reach = 0.5 + Math.random() * 0.5;
      corners[slot * CORNERS * 2 + corner * 2] = Math.cos(cornerAngle) * reach;
      corners[slot * CORNERS * 2 + corner * 2 + 1] = Math.sin(cornerAngle) * reach;
    }
    spawn(slot, DEBRIS, x, y, angle, speed, lifetime);
  };

  const setScale: ParticlePool['setScale'] = (scale) => {
    gravity = BASE_GRAVITY * scale;
  };

  const step = (dt: number) => {
    const sparkDamp = Math.exp(-SPARK_DRAG * dt);
    const debrisDamp = Math.exp(-DEBRIS_DRAG * dt);
    for (let i = 0; i < used; i++) {
      if (kind[i] === DEAD) continue;
      age[i] += dt;
      if (age[i] >= life[i]) {
        kind[i] = DEAD;
        continue;
      }
      const damp = kind[i] === SPARK ? sparkDamp : debrisDamp;
      vx[i] *= damp;
      vy[i] = vy[i] * damp + gravity * dt;
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
    }
  };

  const hasLive = () => {
    for (let i = 0; i < used; i++) if (kind[i] !== DEAD) return true;
    return false;
  };

  const drawDebris = (stride: number) => {
    for (let heat = 0; heat < debrisCss.length; heat++) {
      for (let fade = 0; fade < 2; fade++) {
        ctx.fillStyle = debrisCss[heat];
        ctx.globalAlpha = fade === 0 ? 1 : 0.5;
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < used; i += stride) {
          if (kind[i] !== DEBRIS || debrisHeat(age[i]) !== heat) continue;
          if ((1 - age[i] / life[i] < 0.25 ? 1 : 0) !== fade) continue;

          const turn = rotation[i] + spin[i] * age[i];
          const scale = size[i] * (1 + grow[i] * age[i]);
          const cos = Math.cos(turn) * scale;
          const sin = Math.sin(turn) * scale;
          for (let corner = 0; corner < CORNERS; corner++) {
            const cx = corners[i * CORNERS * 2 + corner * 2];
            const cy = corners[i * CORNERS * 2 + corner * 2 + 1];
            const x = px[i] + cx * cos - cy * sin;
            const y = py[i] + cx * sin + cy * cos;
            if (corner === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          any = true;
        }
        if (any) ctx.fill();
      }
    }
  };

  const drawSparks = (stride: number) => {
    ctx.lineCap = 'round';
    for (let stage = 0; stage < SPARK_STAGE_TINT.length; stage++) {
      ctx.strokeStyle = sparkCss[SPARK_STAGE_TINT[stage]];
      ctx.globalAlpha = SPARK_STAGE_ALPHA[stage];
      for (let w = 0; w < LINE_WIDTHS.length; w++) {
        ctx.lineWidth = LINE_WIDTHS[w];
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < used; i += stride) {
          if (kind[i] !== SPARK || thick[i] !== w) continue;
          if (sparkStage(age[i] / life[i]) !== stage) continue;
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[i] - vx[i] * TAIL_SECONDS, py[i] - vy[i] * TAIL_SECONDS);
          any = true;
        }
        if (any) ctx.stroke();
      }
    }
  };

  const draw = (stride: number) => {
    // Fragments are solid and block the light; sparks are light and add to it
    ctx.globalCompositeOperation = 'source-over';
    drawDebris(stride);
    ctx.globalCompositeOperation = 'lighter';
    drawSparks(stride);
    ctx.globalAlpha = 1;
  };

  const clear = () => {
    kind.fill(DEAD);
    cursor = 0;
    used = 0;
  };

  return { emitSpark, emitDebris, setScale, step, hasLive, draw, clear };
}
