import { fullscreenVertexShader } from './glProgram';

export const medallionVertexShader = fullscreenVertexShader;

// The portrait medallion, ray-traced per pixel in a small canvas that sits over the portrait. Units are
// portrait radii: the portrait is a coin of radius 1 facing +z and the lens sits at z = CAM looking down -z.
// There are no meshes. The coin is an analytic cylinder (a badge under a thin dome of glass, with a bevelled
// rim), the rings are light (the distance from each ray to a torus drives a hot core, a shoulder and a wide
// halo) and everything composites as premultiplied alpha, so the planet behind shows through the glass and
// the glow.
export const medallionFragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
// 0 to 1: the ring draws itself in and the portrait fades up
uniform float uIntro;
// Radians the coin has turned about its vertical axis: 0 shows the portrait, PI the logo
uniform float uFlip;
// Lean of the coin: x about the horizontal axis, y about the vertical one
uniform vec2 uTilt;
// The rings follow the lean a moment late
uniform vec2 uRingTilt;
uniform float uBob;
// Half the canvas side, in portrait radii
uniform float uExtent;
// x: radius of the inner ring, y: radius of its tube; measured from the HTML ring so the two coincide
uniform vec2 uRing;
uniform float uGlow;
uniform vec3 uRingColor;
uniform vec3 uHot;
uniform vec3 uDeep;
uniform sampler2D uFront;
uniform sampler2D uBack;

const float TAU = 6.28318530718;
const float CAM = 7.0;
const float DISC_R = 1.0;
const float DISC_H = 0.05;
const float BEZEL = 0.05;
const float FACE_R = 0.975;
// Towards the light behind the horizon, and the soft key the glass catches in front
const vec3 SUN = vec3(0.28, 0.40, -0.87);
const vec3 KEY = vec3(-0.50, 0.55, 0.67);

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 rotX(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
}

vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

// The coin leans with uTilt and turns about its own vertical axis by uFlip
vec3 coinToWorld(vec3 v) {
  return rotX(rotY(rotY(v, uFlip), uTilt.y), uTilt.x);
}

vec3 worldToCoin(vec3 v) {
  return rotY(rotY(rotX(v, -uTilt.x), -uTilt.y), -uFlip);
}

// The ring lies in the coin's plane and follows the lean a moment late
vec3 worldToRing(vec3 v) {
  return rotY(rotX(v, -uRingTilt.x), -uRingTilt.y);
}

// What the glass and the rim reflect: the thin hot line of the horizon behind the portrait, the blue haze
// above it, the dark planet below, and a soft key light in front
vec3 environment(vec3 d) {
  float band = d.y + 0.08;
  float behind = 1.0 - smoothstep(-0.85, -0.15, d.z);
  vec3 col = uHot * exp(-band * band * 52.0) * (0.12 + 0.88 * behind) * 0.9;
  col += uDeep * exp(-max(band, 0.0) * 3.2) * (0.10 + 0.90 * behind) * 0.30;
  col += vec3(0.004, 0.014, 0.040) * (1.0 - smoothstep(-0.7, 0.05, d.y));
  col += vec3(0.85, 0.93, 1.0) * pow(max(dot(d, KEY), 0.0), 20.0) * 0.55;
  return col;
}

vec2 sampleOffset(int i) {
  if (i == 0) return vec2(-0.125, -0.375);
  if (i == 1) return vec2(0.375, -0.125);
  if (i == 2) return vec2(0.125, 0.375);
  return vec2(-0.375, 0.125);
}

// One ray against the coin, in premultiplied alpha. The badge is a translucent texture under a dome of
// glass; the rim is a dark bevelled metal that catches the light from behind the horizon.
vec4 coinSample(vec3 roC, vec3 rdW) {
  vec3 rdC = worldToCoin(rdW);

  // The cap that faces the lens
  float sgn = roC.z >= 0.0 ? 1.0 : -1.0;
  float dz = abs(rdC.z) < 0.0001 ? (rdC.z < 0.0 ? -0.0001 : 0.0001) : rdC.z;
  float tCap = (sgn * DISC_H - roC.z) / dz;
  vec3 pCap = roC + rdC * tCap;
  float rCap = length(pCap.xy);

  // The textures are always sampled, hit or not, so their derivatives stay defined at the silhouette
  vec2 uvFront = pCap.xy / FACE_R * 0.5 + 0.5;
  vec2 uvBack = vec2(1.0 - uvFront.x, uvFront.y);
  vec4 texel = sgn > 0.0 ? texture2D(uFront, uvFront) : texture2D(uBack, uvBack);

  // The side wall
  float a = dot(rdC.xy, rdC.xy);
  float b = dot(roC.xy, rdC.xy);
  float c = dot(roC.xy, roC.xy) - DISC_R * DISC_R;
  float disc = b * b - a * c;
  float tSide = -1.0;
  if (disc > 0.0 && a > 0.000001) {
    float t = (-b - sqrt(disc)) / a;
    float z = roC.z + rdC.z * t;
    if (t > 0.0 && abs(z) <= DISC_H) tSide = t;
  }

  bool capHit = tCap > 0.0 && rCap <= DISC_R;
  bool sideHit = tSide > 0.0;
  if (!capHit && !sideHit) return vec4(0.0);

  bool onCap = capHit && (!sideHit || tCap <= tSide);
  float inner = DISC_R - BEZEL;

  if (onCap && rCap < inner) {
    vec3 nFace = coinToWorld(normalize(vec3(pCap.xy * 0.45, sgn)));
    vec3 reflFace = reflect(rdW, nFace);
    float fresnel = pow(1.0 - clamp(dot(nFace, -rdW), 0.0, 1.0), 3.0);
    float vignette = 1.0 - 0.22 * smoothstep(0.55, 1.0, rCap / inner);
    vec3 sheen = environment(reflFace) * (0.05 + 0.55 * fresnel);
    sheen += vec3(0.90, 0.96, 1.00) * pow(max(dot(reflFace, KEY), 0.0), 36.0) * 0.28;
    float alpha = clamp(texel.a + 0.045, 0.0, 1.0);
    alpha = max(alpha, max(sheen.r, max(sheen.g, sheen.b)));
    vec3 rgb = texel.rgb * vignette + sheen;
    return vec4(min(rgb, vec3(alpha)), alpha);
  }

  vec3 nCoin;
  if (onCap) {
    float w = clamp((rCap - inner) / BEZEL, 0.0, 1.0);
    nCoin = normalize(vec3(normalize(pCap.xy) * (0.35 + 0.9 * w), sgn * (1.0 - 0.5 * w)));
  } else {
    vec3 pSide = roC + rdC * tSide;
    nCoin = vec3(normalize(pSide.xy), 0.0);
  }
  vec3 nRim = coinToWorld(nCoin);
  float facing = clamp(dot(nRim, -rdW), 0.0, 1.0);
  vec3 reflRim = reflect(rdW, nRim);
  vec3 rim = vec3(0.045, 0.075, 0.120);
  rim += environment(reflRim) * mix(0.45, 1.0, pow(1.0 - facing, 2.0)) * vec3(0.70, 0.90, 1.00);
  float towardLight = clamp(dot(nRim, SUN) * 0.5 + 0.5, 0.0, 1.0);
  rim += uHot * pow(1.0 - facing, 2.2) * (0.25 + 0.75 * towardLight) * 0.85;
  return vec4(min(rim, vec3(1.0)), 1.0);
}

float sdTorus(vec3 p, float majorR, float minorR) {
  return length(vec2(length(p.xy) - majorR, p.z)) - minorR;
}

// Closest approach of a ray to a ring: coarse samples along the stretch of the ray that passes the ring,
// then a ternary search around the best one. dMin is the distance to the tube's surface, tMin where along
// the ray it happens and ang the angle round the ring there.
void ringMin(vec3 ro, vec3 rd, float majorR, float minorR, out float dMin, out float tMin, out float ang) {
  dMin = 1000.0;
  tMin = CAM;
  ang = 0.0;

  float reach = majorR + 0.6;
  float b = dot(ro, rd);
  float h = b * b - (dot(ro, ro) - reach * reach);
  if (h <= 0.0) return;

  float s = sqrt(h);
  float t0 = -b - s;
  float span = 2.0 * s / 19.0;
  float bestD = 1000.0;
  float bestT = t0;
  for (int i = 0; i < 20; i++) {
    float t = t0 + span * float(i);
    float d = sdTorus(ro + rd * t, majorR, minorR);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }

  float lo = bestT - span;
  float hi = bestT + span;
  for (int j = 0; j < 9; j++) {
    float m1 = lo + (hi - lo) * 0.3333333;
    float m2 = hi - (hi - lo) * 0.3333333;
    if (sdTorus(ro + rd * m1, majorR, minorR) < sdTorus(ro + rd * m2, majorR, minorR)) {
      hi = m2;
    } else {
      lo = m1;
    }
  }

  tMin = 0.5 * (lo + hi);
  vec3 p = ro + rd * tMin;
  dMin = sdTorus(p, majorR, minorR);
  ang = atan(p.y, p.x);
}

// A ring of light: a crisp anti-aliased core, a tight shoulder and a wide halo (the glow the HTML ring
// had as a box-shadow). A brighter arc travels round it slowly, and on load it draws itself in clockwise
// from the top.
vec3 ringLight(float d, float ang, float pixW, float phase, vec3 tint, float strength) {
  float around = fract(0.25 - ang / TAU);
  float reveal = uIntro * 1.15;
  float drawn = 1.0 - smoothstep(reveal - 0.12, reveal, around);
  float chase = 0.58 + 0.42 * (0.5 + 0.5 * cos(ang - uTime * 0.55 - phase));
  float outside = max(d, 0.0);
  float core = 1.0 - smoothstep(-pixW * 0.5, pixW * 1.1, d);
  float shoulder = exp(-outside * outside / 0.001225);
  float halo = exp(-outside * outside / 0.0289);
  vec3 light = uHot * core * 1.15 + tint * (0.60 * shoulder + 0.34 * halo);
  return light * chase * drawn * strength * uGlow;
}

void main() {
  vec2 plane = (gl_FragCoord.xy / uRes * 2.0 - 1.0) * uExtent;
  float pxWorld = 2.0 * uExtent / uRes.x;
  vec3 camera = vec3(0.0, 0.0, CAM);
  vec3 rdW = normalize(vec3(plane, 0.0) - camera);
  // The lens relative to the floating assembly
  vec3 camRel = vec3(0.0, -uBob, CAM);

  vec4 coin = vec4(0.0);
  if (length(plane - vec2(0.0, uBob)) < 1.45) {
    vec3 roC = worldToCoin(camRel);
    for (int i = 0; i < 4; i++) {
      vec3 rdS = normalize(vec3(plane + sampleOffset(i) * pxWorld, 0.0) - camera);
      coin += coinSample(roC, rdS) * 0.25;
    }
    coin *= smoothstep(0.0, 0.45, uIntro);
  }

  vec3 light = vec3(0.0);
  float rs = length(plane);

  if (abs(rs - uRing.x) < 0.9) {
    float d1;
    float t1;
    float a1;
    ringMin(worldToRing(camRel), worldToRing(rdW), uRing.x, uRing.y, d1, t1, a1);
    light += ringLight(d1, a1, pxWorld * t1 / CAM, 0.0, uRingColor, 1.0);
  }

  // Soft shoulder, as on the planet, so the glow never clips
  light = 1.0 - exp(-light * 1.25);

  vec3 rgb = coin.rgb + light;
  float alpha = clamp(max(coin.a, max(rgb.r, max(rgb.g, rgb.b))), 0.0, 1.0);
  rgb = min(rgb, vec3(alpha));
  // Dither: the blue falloff bands badly in 8 bits
  rgb += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * step(0.002, alpha);
  gl_FragColor = vec4(rgb, alpha);
}
`;
