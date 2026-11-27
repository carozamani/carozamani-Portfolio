// The page-wide sky: stars on a celestial sphere, with a Milky Way running through it.
// The including shader declares `uniform float uTime;` before this chunk.
export const starfieldGlsl = /* glsl */ `const float PI = 3.14159265359;
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

// The Milky Way is a plane through the sky sphere, fixed in the sky's own frame. GAL_N is the pole of
// that plane and GAL_X points at the galactic centre.
const vec3 GAL_N = vec3(0.44397, 0.78925, 0.42423);
const vec3 GAL_X = vec3(0.87155, -0.49028, 0.0);

// How much of the galaxy's light lies in a direction: brightest towards the galactic centre, where the
// plane swells into a bulge, thinning to a slim and much fainter band on the far side of the sky
float galacticDensity(vec3 s) {
  float sinB = dot(s, GAL_N);
  float cosB = sqrt(max(1.0 - sinB * sinB, 0.0001));
  float cosL = clamp(dot(s, GAL_X) / cosB, -1.0, 1.0);
  float towardsCentre = exp(-(1.0 - cosL) * 1.7);
  float bulge = exp(-(1.0 - cosL) * 2.4);
  float width = mix(0.085, 0.19, bulge);
  float disk = exp(-sinB * sinB / (2.0 * width * width));
  float halo = 0.22 * exp(-sinB * sinB / 0.2312);
  return (0.26 + 0.74 * towardsCentre) * (disk + halo);
}

// Spectral colours: a few blue-white stars, mostly white to yellow-white, and the odd orange one
vec3 starColor(float h) {
  vec3 c = mix(vec3(0.62, 0.76, 1.0), vec3(1.0, 0.98, 0.96), smoothstep(0.0, 0.22, h));
  c = mix(c, vec3(1.0, 0.90, 0.72), smoothstep(0.30, 0.62, h));
  return mix(c, vec3(1.0, 0.70, 0.46), smoothstep(0.80, 0.97, h));
}

// The glow of the stars too faint and too many to tell apart, broken up by star clouds and by the dark
// lanes of dust that lie along the plane. Writes how much dust there is here, so the stars behind it
// can be dimmed and reddened by the same amount.
vec3 milkyWay(vec3 s, out float dust) {
  dust = 0.0;
  float density = galacticDensity(s);
  if (density < 0.01) return vec3(0.0);

  float sinB = dot(s, GAL_N);
  float cosB = sqrt(max(1.0 - sinB * sinB, 0.0001));
  float cosL = clamp(dot(s, GAL_X) / cosB, -1.0, 1.0);
  float bulge = exp(-(1.0 - cosL) * 2.4);

  // Star clouds: broad patches of brighter and thinner glow, with finer knots inside them
  float broad = fbm(s * 2.2 + 3.0, 3);
  float clouds = fbm(s * 7.0 + 9.0, 4);
  float structure = (0.45 + 0.9 * broad) * (0.55 + 0.85 * clouds);

  // The great rift: a ragged dark lane just off the plane, deepest towards the centre, plus a few
  // loose patches of dust nearby
  float wander = (fbm(s * 4.5 + 17.0, 3) - 0.5) * 0.09;
  float offPlane = sinB - 0.012 - wander;
  float ridged = 1.0 - abs(2.0 * fbm(s * 11.0 + 5.0, 4) - 1.0);
  float rift = exp(-offPlane * offPlane / 0.001352) * (0.45 + 0.55 * bulge) * (0.55 + 0.45 * ridged);
  float loosePatches = smoothstep(0.58, 0.82, broad) * exp(-sinB * sinB / 0.0288) * 0.5;
  dust = clamp(rift + loosePatches, 0.0, 1.0);

  float glow = density * structure * (1.0 - 0.85 * dust);
  // A warm, yellow centre fading to cooler, bluer outer arms; dust reddens what shines through it
  vec3 tint = mix(vec3(0.58, 0.70, 1.0), vec3(1.0, 0.78, 0.52), clamp(bulge * 1.2 + 0.2 * broad, 0.0, 1.0));
  tint = mix(tint, vec3(0.90, 0.55, 0.35), dust * 0.5);
  float grain = 0.88 + 0.24 * noise3(s * 55.0);
  return tint * glow * grain * 0.30;
}

// Equal-area grid around the X axis: rotating the sky is just shifting the longitude, with no pole in view.
// \`gain\` is how strongly this layer crowds into the Milky Way.
vec3 starLayer(float sx, float lam, float cosLat, float nv, float nu, float prob, float gain,
               float rMin, float rMax, float bMin, float bMax, float pixAng, float dust) {
  float u = (lam / (2.0 * PI) + 0.5) * nu;
  float v = (sx * 0.5 + 0.5) * nv;
  vec2 id = floor(vec2(u, v));
  vec2 fr = vec2(u, v) - id;

  // Ask the galaxy how crowded the sky is at the middle of this cell. Asked per cell, not per pixel,
  // so a star is either there or not and is never cut in half
  float cellLam = ((id.x + 0.5) / nu - 0.5) * 2.0 * PI;
  float cellSx = ((id.y + 0.5) / nv - 0.5) * 2.0;
  float cellCos = sqrt(max(1.0 - cellSx * cellSx, 0.0));
  vec3 cellDir = vec3(cellSx, cellCos * sin(cellLam), cellCos * cos(cellLam));
  float keep = min(prob * (1.0 + gain * galacticDensity(cellDir)), 0.92);
  if (hash12(id + vec2(nv, nu) * 0.37) > keep) return vec3(0.0);

  vec2 pos = vec2(hash12(id + 11.1), hash12(id + vec2(23.7, 5.3))) * 0.6 + 0.2;
  vec2 d = (fr - pos) * vec2(2.0 * PI / nu * cosLat, 2.0 / nv / cosLat);
  float dpx = length(d) / pixAng;

  // Many faint stars and few bright ones, and the bright ones are also the big ones
  float mag = pow(hash12(id + vec2(41.3, 2.2)), 2.6);
  float r = mix(rMin, rMax, sqrt(mag)) * 1.4;
  float br = mix(bMin, bMax, mag);
  float q = dpx * dpx / (r * r);
  if (q > 600.0) return vec3(0.0);

  // Scintillation: bright stars shimmer more, and the average brightness stays put
  float rate = 0.8 + 2.4 * hash12(id + vec2(7.7, 3.3));
  float phase = 6.2831 * hash12(id + vec2(91.1, 4.4));
  float amp = mix(0.05, 0.22, mag);
  float tw = 1.0 + amp * (0.65 * sin(uTime * rate + phase) + 0.35 * sin(uTime * rate * 2.3 + phase * 1.7));

  // A real star image has soft, long wings, not the hard edge of a Gaussian
  float body = pow(1.0 + q, -2.8) + 0.05 * mag * exp(-q / 9.0);

  vec3 tint = mix(vec3(1.0), starColor(hash12(id + vec2(63.9, 6.6))), 0.30 + 0.70 * mag);
  tint = mix(tint, tint * vec3(1.0, 0.80, 0.62), dust * 0.55);
  return tint * body * br * tw * (1.0 - 0.75 * dust);
}

vec3 stars(vec3 rd, float pixAng, float cameraPitch) {
  // Rotate each view ray as the astronaut pitches their gaze, keeping the screen upright.
  vec3 s = rotX(rd, cameraPitch);
  float lam = atan(s.y, s.z);
  float cosLat = sqrt(max(1.0 - s.x * s.x, 0.001));

  float dust;
  vec3 c = milkyWay(s, dust);
  // Dense faint dust first, then progressively rarer and brighter stars; every layer crowds into the Milky Way
  c += starLayer(s.x, lam, cosLat, 230.0, 724.0, 0.14, 3.2, 0.45, 0.7, 0.07, 0.30, pixAng, dust);
  c += starLayer(s.x, lam, cosLat, 110.0, 346.0, 0.09, 2.6, 0.55, 0.9, 0.16, 0.65, pixAng, dust);
  c += starLayer(s.x, lam, cosLat, 46.0, 144.0, 0.11, 1.8, 0.75, 1.2, 0.30, 1.0, pixAng, dust);
  c += starLayer(s.x, lam, cosLat, 22.0, 70.0, 0.17, 1.0, 1.0, 1.7, 0.55, 1.4, pixAng, dust);
  c += starLayer(s.x, lam, cosLat, 12.0, 38.0, 0.12, 0.4, 1.4, 2.6, 1.0, 2.2, pixAng, dust);
  return c;
}

`;
