import { fullscreenVertexShader } from './glProgram';
import { starfieldGlsl } from './starfieldGlsl';

export const starfieldVertexShader = fullscreenVertexShader;

// The same stars the hero's sky is made of, seen through a plain pinhole lens looking straight ahead
export const starfieldFragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uStarRot;
uniform float uFocal;

${starfieldGlsl}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / uRes.x;
  vec3 rd = normalize(vec3(p, uFocal));

  // Same lens correction as the hero: off-axis stars stay round dots
  float pixAng = 2.0 / (uRes.x * uFocal);
  float offAxis = clamp(rd.z, 0.25, 1.0);
  vec3 col = stars(rd, pixAng * pow(offAxis, 1.5));

  col = 1.0 - exp(-col * 1.35);
  // Dither: the faint galactic haze bands badly in 8 bits
  col += (hash12(gl_FragCoord.xy + mod(uTime, 1000.0)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;
