import { fullscreenVertexShader } from './glProgram';

export const earthHorizonVertexShader = fullscreenVertexShader;

// The planet is an analytic unit sphere ray-traced per pixel; the camera hovers above it looking along
// the surface. "Travelling" is the ground texture rotating about the X axis, never the camera moving.
// The look follows an orbital photo: daylit blue ocean, broken white cloud cover, a thin hot atmosphere
// line on the limb, a dense natural star field with a faint galactic haze, and a surface that sinks
// into darkness towards the bottom of the frame.
export const earthHorizonFragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
// How far the hero camera has slid the whole view, in half-widths (y up): pointer parallax, plus the
// planet falling behind the page while the hero scrolls out
uniform vec2 uShift;
uniform float uTime;
uniform float uPitch;
uniform float uFocal;
uniform float uCamDist;
uniform float uSurfaceRot;
uniform float uStarRot;
// Direction the light comes from: just behind the far horizon
uniform vec3 uSun;
// Keeps rim thickness and ground detail the same on screen however close the camera sits
uniform float uScale;
uniform vec3 uDeep;
uniform vec3 uCore;
uniform vec3 uHot;
uniform vec3 uOcean;
uniform vec3 uLand;
uniform vec3 uCloud;
uniform vec3 uCity;
uniform float uCloudAmount;
uniform float uSurfaceBrightness;
uniform float uCityStrength;

const float PI = 3.14159265359;
const mat3 OCTAVE = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

float fbm(vec3 p, int octaves) {
  float a = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    sum += a * noise3(p);
    p = OCTAVE * p * 2.01;
    a *= 0.5;
  }
  return sum;
}

vec3 rotX(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
}

// Equal-area grid around the X axis: rotating the sky is just shifting the longitude, with no pole in view
vec3 starLayer(float sx, float lam, float cosLat, float nv, float nu, float prob,
               float rMin, float rMax, float bMin, float bMax, float pixAng) {
  float u = (lam / (2.0 * PI) + 0.5) * nu;
  float v = (sx * 0.5 + 0.5) * nv;
  vec2 id = floor(vec2(u, v));
  vec2 fr = vec2(u, v) - id;
  if (hash12(id + vec2(nv, nu) * 0.37) < 1.0 - prob) return vec3(0.0);

  vec2 pos = vec2(hash12(id + 11.1), hash12(id + vec2(23.7, 5.3))) * 0.6 + 0.2;
  vec2 d = (fr - pos) * vec2(2.0 * PI / nu * cosLat, 2.0 / nv / cosLat);
  float dpx = length(d) / pixAng;
  float r = mix(rMin, rMax, hash12(id + vec2(5.5, 1.1)));
  float br = mix(bMin, bMax, hash12(id + vec2(41.3, 2.2)));
  float tw = 0.82 + 0.18 * sin(uTime * (0.8 + 2.4 * hash12(id + vec2(7.7, 3.3))) + 6.2831 * hash12(id + vec2(91.1, 4.4)));
  // Tight core plus a faint wide halo: bright stars read as lens-soft points, faint ones as dust
  float body = exp(-dpx * dpx / (r * r)) + 0.10 * exp(-dpx * dpx / (10.0 * r * r));
  vec3 tint = mix(vec3(0.66, 0.80, 1.0), vec3(1.0, 0.94, 0.88), hash12(id + vec2(63.9, 6.6)));
  return tint * body * br * tw;
}

// Faint band of unresolved stars and dust across the sky; deliberately subtle so it reads as depth, not as an effect
vec3 galaxy(vec3 s) {
  vec3 bandNormal = normalize(vec3(0.45, 0.80, 0.43));
  float lat = dot(s, bandNormal);
  float band = exp(-lat * lat / 0.045);
  if (band < 0.012) return vec3(0.0);
  float cloud = fbm(s * 3.4 + 9.0, 5);
  float lanes = smoothstep(0.40, 0.70, fbm(s * 8.0 + 2.0, 4));
  float density = band * (0.20 + 0.80 * cloud) * (1.0 - 0.45 * lanes);
  vec3 tint = mix(vec3(0.30, 0.42, 0.80), vec3(0.85, 0.72, 0.62), smoothstep(0.45, 0.8, cloud));
  return tint * density * 0.30;
}

vec3 stars(vec3 rd, float pixAng) {
  vec3 s = rotX(rd, uStarRot);
  float lam = atan(s.y, s.z);
  float cosLat = sqrt(max(1.0 - s.x * s.x, 0.001));
  // Dense faint dust first, then progressively rarer and brighter stars
  vec3 c = starLayer(s.x, lam, cosLat, 230.0, 724.0, 0.20, 0.45, 0.7, 0.07, 0.22, pixAng);
  c += starLayer(s.x, lam, cosLat, 110.0, 346.0, 0.12, 0.55, 0.9, 0.18, 0.5, pixAng);
  c += starLayer(s.x, lam, cosLat, 46.0, 144.0, 0.14, 0.75, 1.2, 0.35, 0.75, pixAng);
  c += starLayer(s.x, lam, cosLat, 22.0, 70.0, 0.20, 1.0, 1.6, 0.6, 1.1, pixAng);
  c += starLayer(s.x, lam, cosLat, 12.0, 38.0, 0.12, 1.5, 2.4, 1.0, 1.6, pixAng);
  c += galaxy(s);
  return c;
}

vec3 surfaceColor(vec3 ro, vec3 rd, float tca, float b) {
  // For rays grazing past the limb the clamp returns the tangent point, which keeps the edge anti-aliased
  float t0 = tca - sqrt(max(1.0 - b * b, 0.0));
  vec3 n = normalize(ro + rd * t0);
  float cosT = clamp(dot(n, -rd), 0.0, 1.0);
  vec3 q = rotX(n, uSurfaceRot);

  float nSun = dot(n, uSun);
  float sunLit = smoothstep(uSun.y - 0.30, 0.95, nSun);

  // Daylight falls off towards the bottom of the frame, the way the reference sinks into the dark
  float yv = gl_FragCoord.y / uRes.y;
  float dusk = pow(smoothstep(0.0, 0.30, yv), 1.2);
  float lit = (0.30 + 0.70 * sunLit) * mix(0.04, 1.0, dusk);

  float contN = fbm(q * 3.6 + 4.0, 4);
  float cont = smoothstep(0.44, 0.60, contN);
  // Shallow water towards the coast, a little variation in the open ocean
  float shallow = smoothstep(0.32, 0.48, contN) * (1.0 - cont);
  vec3 sea = mix(uOcean, uOcean * vec3(1.5, 2.2, 1.7), shallow);
  vec3 ground = mix(uLand, uLand * vec3(1.4, 1.2, 0.8), noise3(q * 40.0 * uScale));
  vec3 base = mix(sea, ground, cont) * lit;

  vec3 warp = vec3(noise3(q * 6.0), noise3(q * 6.0 + 11.3), noise3(q * 6.0 + 27.1)) - 0.5;
  float coarse = fbm(q * 19.0 * uScale + warp * 2.2, 5);
  float fine = fbm(q * 62.0 * uScale + warp * 3.0 + 7.0, 4);
  float grain = noise3(q * 190.0 * uScale + warp * 4.0);
  float density = coarse + 0.46 * (fine - 0.5) + 0.12 * (grain - 0.5);
  float cloud = smoothstep(0.46, 0.57, density) * uCloudAmount;
  // Thick cores catch more light than thin edges, and the clumping inside gives the cover its relief
  float body = smoothstep(0.50, 0.78, density);
  float clump = 0.78 + 0.44 * fine + 0.16 * (grain - 0.5);
  vec3 cloudCol = uCloud * mix(0.62, 1.20, body) * clump * (0.18 + 0.82 * lit);
  base *= 1.0 - 0.45 * cloud;

  // Sparse night-side lights; they only show where the daylight has faded out
  vec3 cq = q * 210.0 * uScale;
  vec3 cid = floor(cq);
  vec3 cfr = fract(cq) - 0.5;
  vec3 jit = vec3(hash13(cid + 17.0), hash13(cid + 31.0), hash13(cid + 53.0)) - 0.5;
  float region = smoothstep(0.48, 0.60, noise3(q * 7.0 + 3.0)) * cont;
  float city = step(0.80, hash13(cid)) * smoothstep(0.30, 0.04, length(cfr - jit * 0.5));
  city *= region * smoothstep(0.15, 0.5, cosT) * (1.0 - cloud) * (1.0 - smoothstep(0.0, 0.5, lit * 1.6));

  // Rayleigh scattering thickens towards the limb: the surface turns pale blue just under the bright line
  float rim = 1.0 - cosT;
  float atmoLit = mix(0.55, 1.0, smoothstep(0.30, 0.95, nSun));
  vec3 haze = (uDeep * 0.50 * pow(rim, 3.0) + uCore * 0.55 * pow(rim, 5.0) + uHot * 0.80 * pow(rim, 22.0)) * atmoLit;

  return mix(base, cloudCol, cloud) * uSurfaceBrightness + uCity * city * uCityStrength + haze;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / uRes.x - uShift;

  float ca = cos(uPitch);
  float sa = sin(uPitch);
  vec3 fwd = vec3(0.0, -sa, ca);
  vec3 up = vec3(0.0, ca, sa);
  vec3 rd = normalize(vec3(p.x, 0.0, 0.0) + p.y * up + uFocal * fwd);
  vec3 ro = vec3(0.0, uCamDist, 0.0);

  float tca = max(-dot(ro, rd), 0.0);
  vec3 cp = ro + rd * tca;
  float b = length(cp);

  float pixAng = 2.0 / (uRes.x * uFocal);
  float tangentLen = sqrt(max(uCamDist * uCamDist - 1.0, 0.0));
  float eps = tangentLen * pixAng * 1.25;

  // Atmosphere seen edge-on: a thin hot line, a tight blue shoulder and a wide faint halo
  float h = max(b - 1.0, 0.0) * uScale;
  vec3 cn = cp / max(b, 0.0001);
  float atmoLit = mix(0.55, 1.0, smoothstep(0.30, 0.95, dot(cn, uSun)));
  vec3 glow = (uDeep * 0.55 * exp(-h / 0.060) + uCore * 0.70 * exp(-h / 0.0120) + uHot * 1.35 * exp(-h / 0.0026)) * atmoLit;
  float glowLum = dot(glow, vec3(0.3, 0.5, 0.2));

  vec3 sky = glow;
  if (b > 1.0 - eps) {
    // A rectilinear lens stretches off-axis stars radially; shrinking the angular pixel keeps them round dots
    float offAxis = clamp(dot(rd, fwd), 0.25, 1.0);
    sky += stars(rd, pixAng * pow(offAxis, 1.5)) * (1.0 - clamp(glowLum * 1.8, 0.0, 1.0));
  }

  vec3 col = sky;
  if (b < 1.0 + eps) {
    col = mix(surfaceColor(ro, rd, tca, b), sky, smoothstep(-eps, eps, b - 1.0));
  }

  // Soft shoulder keeps the whites from clipping
  col = 1.0 - exp(-col * 1.35);
  // Dither: the dark blue gradients band badly in 8 bits
  col += (hash12(gl_FragCoord.xy + mod(uTime, 1000.0)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;
