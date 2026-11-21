import type { EarthHorizonConfig, Rgb } from '@/data/earthHorizon';

import { earthHorizonFragmentShader, earthHorizonVertexShader } from './earthHorizonShader';
import { createFullscreenTriangle, createProgram } from './glProgram';

/** How far the camera has slid the planet across the frame, in half-widths of the hero, y up. */
export interface PlanetShift {
  x: number;
  y: number;
}

const NO_SHIFT: PlanetShift = { x: 0, y: 0 };

export interface EarthHorizonRenderer {
  resize: (width: number, height: number) => void;
  render: (elapsedSec: number, shift?: PlanetShift) => void;
  dispose: () => void;
}

const TAU = Math.PI * 2;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// The look (glow thickness, ground detail, travel speed) was tuned at a 48° limb angle, where the
// distance from the camera to the horizon is 0.9 planet radii; other angles are scaled against it
const REFERENCE_HORIZON_DISTANCE = 0.9;
const LIGHT_BEYOND_HORIZON_DEG = 9.5;

const uniformNames = [
  'uRes',
  'uShift',
  'uTime',
  'uPitch',
  'uFocal',
  'uCamDist',
  'uSurfaceRot',
  'uStarRot',
  'uSun',
  'uScale',
  'uDeep',
  'uCore',
  'uHot',
  'uOcean',
  'uLand',
  'uCloud',
  'uCity',
  'uCloudAmount',
  'uSurfaceBrightness',
  'uCityStrength',
] as const;

type UniformName = (typeof uniformNames)[number];

export function createEarthHorizonRenderer(
  canvas: HTMLCanvasElement,
  config: EarthHorizonConfig,
): EarthHorizonRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const program = createProgram(gl, earthHorizonVertexShader, earthHorizonFragmentShader);
  if (!program) return null;

  gl.useProgram(program);

  const buffer = createFullscreenTriangle(gl, program);

  const uniforms = Object.fromEntries(
    uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as Record<UniformName, WebGLUniformLocation | null>;

  const { camera, motion, look, colors } = config;
  const limbAngle = toRadians(camera.limbAngleDeg);
  const focal = 1 / Math.tan(toRadians(camera.horizontalFovDeg) / 2);
  const swayAmplitude = toRadians(camera.swayDeg);
  const scale = REFERENCE_HORIZON_DISTANCE * Math.tan(limbAngle);
  const sunAngle = Math.PI / 2 - limbAngle + toRadians(LIGHT_BEYOND_HORIZON_DEG);

  const setColor = (name: UniformName, [r, g, b]: Rgb) => gl.uniform3f(uniforms[name], r, g, b);

  gl.uniform1f(uniforms.uFocal, focal);
  gl.uniform1f(uniforms.uCamDist, 1 / Math.sin(limbAngle));
  gl.uniform1f(uniforms.uScale, scale);
  gl.uniform3f(uniforms.uSun, 0, Math.cos(sunAngle), Math.sin(sunAngle));
  gl.uniform1f(uniforms.uCloudAmount, look.cloudAmount);
  gl.uniform1f(uniforms.uSurfaceBrightness, look.surfaceBrightness);
  gl.uniform1f(uniforms.uCityStrength, look.cityStrength);
  setColor('uDeep', colors.deep);
  setColor('uCore', colors.core);
  setColor('uHot', colors.hot);
  setColor('uOcean', colors.ocean);
  setColor('uLand', colors.land);
  setColor('uCloud', colors.cloud);
  setColor('uCity', colors.city);

  let width = 1;
  let height = 1;
  let basePitch = 0;
  // The focal length the current frame is rendered with: longer than `focal` when the sides are cropped
  let viewFocal = focal;

  // Tilts the camera so the top of the curve lands at `horizonHeight` of the viewport at any aspect ratio
  const computeBasePitch = () => {
    const crestY = (2 * camera.horizonHeight - 1) * (height / width);
    return Math.atan(crestY / viewFocal) + Math.PI / 2 - limbAngle;
  };

  return {
    resize(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      // A frame narrower than the reference keeps the desktop's vertical view: zooming in on the
      // centre crops the sides rather than shrinking the whole horizon into a thin strip
      viewFocal = focal * Math.max(1, camera.referenceAspect / (width / height));
      gl.uniform1f(uniforms.uFocal, viewFocal);
      basePitch = computeBasePitch();
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.uRes, width, height);
    },

    render(elapsedSec, shift = NO_SHIFT) {
      const sway = swayAmplitude * Math.sin((TAU * elapsedSec) / camera.swayPeriodSec);
      gl.uniform2f(uniforms.uShift, shift.x, shift.y);
      gl.uniform1f(uniforms.uTime, elapsedSec);
      gl.uniform1f(uniforms.uPitch, basePitch + sway);
      gl.uniform1f(
        uniforms.uSurfaceRot,
        (motion.initialSurfaceRotation + (elapsedSec * motion.surfaceSpeed) / scale) % TAU,
      );
      gl.uniform1f(
        uniforms.uStarRot,
        (motion.initialStarRotation + elapsedSec * motion.starDrift) % TAU,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    // The context itself is left alive: React strict mode remounts onto the same canvas, and a context
    // that was explicitly lost cannot be reacquired from it
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
