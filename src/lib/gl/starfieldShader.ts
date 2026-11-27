import { fullscreenVertexShader } from './glProgram';
import { starfieldGlsl } from './starfieldGlsl';

export const starfieldVertexShader = fullscreenVertexShader;

// The night sky seen through a plain pinhole lens looking straight ahead
export const starfieldFragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uCameraPitch;
uniform float uFocal;
// Brightness of the whole sky
uniform float uDim;

${starfieldGlsl}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / uRes.x;
  vec3 rd = normalize(vec3(p, uFocal));

  // Off-axis stars stay round dots
  float pixAng = 2.0 / (uRes.x * uFocal);
  float offAxis = clamp(rd.z, 0.25, 1.0);
  // Pitch the view through the celestial sphere; the viewport itself never rolls sideways.
  vec3 col = stars(rd, pixAng * pow(offAxis, 1.5), uCameraPitch);

  // The night sky is never quite black: a faint blue airglow, a little stronger towards the bottom
  col += vec3(0.0022, 0.0042, 0.0095) * (0.6 + 0.4 * (1.0 - smoothstep(-0.8, 0.5, p.y)));

  col = 1.0 - exp(-col * 1.35);
  // A touch of lens vignetting, as in a photograph
  col *= 1.0 - 0.2 * smoothstep(0.4, 1.5, length(p));
  col *= uDim;
  // Dither: the faint galactic haze bands badly in 8 bits
  col = max(col + (hash12(gl_FragCoord.xy + mod(uTime, 1000.0)) - 0.5) / 255.0, 0.0);

  gl_FragColor = vec4(col, 1.0);
}
`;
