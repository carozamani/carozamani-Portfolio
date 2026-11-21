import type { HeroStageConfig } from '@/data/heroStage';
import type { Rgb } from '@/data/earthHorizon';

import { createFullscreenTriangle, createProgram } from './glProgram';
import { medallionFragmentShader, medallionVertexShader } from './medallionShader';

export interface MedallionFrame {
  /** Seconds since the medallion appeared: drives the travelling arc and the dither. */
  time: number;
  /** 0 to 1: how far the ring has drawn itself in. */
  intro: number;
  /** Radians the portrait has turned about its vertical axis. */
  flip: number;
  tiltX: number;
  tiltY: number;
  ringTiltX: number;
  ringTiltY: number;
  /** Vertical float in portrait radii. */
  bob: number;
}

/** Sizes measured from the HTML ring, in portrait radii, so the WebGL ring lands exactly on it. */
export interface MedallionLayout {
  /** Half the canvas side. */
  extent: number;
  ringRadius: number;
  tubeRadius: number;
}

export interface MedallionRenderer {
  resize: (width: number, height: number) => void;
  setLayout: (layout: MedallionLayout) => void;
  setFaces: (front: TexImageSource, back: TexImageSource) => void;
  render: (frame: MedallionFrame) => void;
  dispose: () => void;
}

const uniformNames = [
  'uRes',
  'uTime',
  'uIntro',
  'uFlip',
  'uTilt',
  'uRingTilt',
  'uBob',
  'uExtent',
  'uRing',
  'uGlow',
  'uRingColor',
  'uHot',
  'uDeep',
  'uFront',
  'uBack',
] as const;

type UniformName = (typeof uniformNames)[number];

const MAX_ANISOTROPY = 4;

function createFaceTexture(gl: WebGLRenderingContext, unit: number) {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Transparent until the real face is uploaded
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

export function createMedallionRenderer(
  canvas: HTMLCanvasElement,
  { colors, look }: HeroStageConfig['medallion'],
): MedallionRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const program = createProgram(gl, medallionVertexShader, medallionFragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  const buffer = createFullscreenTriangle(gl, program);

  const front = createFaceTexture(gl, 0);
  const back = createFaceTexture(gl, 1);
  if (!front || !back) return null;

  const uniforms = Object.fromEntries(
    uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as Record<UniformName, WebGLUniformLocation | null>;

  const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
  const anisotropyLevel = anisotropy
    ? Math.min(MAX_ANISOTROPY, Number(gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
    : 0;

  const setColor = (name: UniformName, [r, g, b]: Rgb) => gl.uniform3f(uniforms[name], r, g, b);

  gl.uniform1i(uniforms.uFront, 0);
  gl.uniform1i(uniforms.uBack, 1);
  gl.uniform1f(uniforms.uGlow, look.glow);
  setColor('uRingColor', colors.ring);
  setColor('uHot', colors.hot);
  setColor('uDeep', colors.deep);

  const upload = (texture: WebGLTexture, unit: number, source: TexImageSource) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Premultiplied end to end: the faces are translucent, and filtering premultiplied texels leaves no dark fringe
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if (anisotropy && anisotropyLevel > 1) {
      gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropyLevel);
    }
  };

  return {
    resize(width, height) {
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.uRes, width, height);
    },

    setLayout({ extent, ringRadius, tubeRadius }) {
      gl.uniform1f(uniforms.uExtent, extent);
      gl.uniform2f(uniforms.uRing, ringRadius, tubeRadius);
    },

    setFaces(frontSource, backSource) {
      upload(front, 0, frontSource);
      upload(back, 1, backSource);
    },

    render(frame) {
      gl.uniform1f(uniforms.uTime, frame.time);
      gl.uniform1f(uniforms.uIntro, frame.intro);
      gl.uniform1f(uniforms.uFlip, frame.flip);
      gl.uniform2f(uniforms.uTilt, frame.tiltX, frame.tiltY);
      gl.uniform2f(uniforms.uRingTilt, frame.ringTiltX, frame.ringTiltY);
      gl.uniform1f(uniforms.uBob, frame.bob);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    // The context itself is left alive: React strict mode remounts onto the same canvas, and a context
    // that was explicitly lost cannot be reacquired from it
    dispose() {
      gl.deleteTexture(front);
      gl.deleteTexture(back);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
