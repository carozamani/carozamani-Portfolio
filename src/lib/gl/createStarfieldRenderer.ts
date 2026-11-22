import type { StarfieldBackdropConfig } from '@/data/starfieldBackdrop';

import { createFullscreenTriangle, createProgram } from './glProgram';
import { lensFocal } from './starfieldMotion';
import { starfieldFragmentShader, starfieldVertexShader } from './starfieldShader';

export interface StarfieldFrame {
  elapsedSec: number;
  /** Radians the sky has turned; see starRotation. */
  starRotation: number;
}

export interface StarfieldRenderer {
  resize: (width: number, height: number) => void;
  render: (frame: StarfieldFrame) => void;
  dispose: () => void;
}

export function createStarfieldRenderer(
  canvas: HTMLCanvasElement,
  config: StarfieldBackdropConfig,
): StarfieldRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const program = createProgram(gl, starfieldVertexShader, starfieldFragmentShader);
  if (!program) return null;

  gl.useProgram(program);

  const buffer = createFullscreenTriangle(gl, program);
  const uRes = gl.getUniformLocation(program, 'uRes');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uStarRot = gl.getUniformLocation(program, 'uStarRot');
  const uFocal = gl.getUniformLocation(program, 'uFocal');

  return {
    resize(width, height) {
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uFocal, lensFocal(width, height, config.camera));
    },

    render({ elapsedSec, starRotation }) {
      gl.uniform1f(uTime, elapsedSec);
      gl.uniform1f(uStarRot, starRotation);
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
