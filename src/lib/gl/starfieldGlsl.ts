// Shared by the hero's planet shader and the page-wide starfield, so both skies are the same stars.
// The including shader declares `uniform float uTime;` and `uniform float uStarRot;` before this chunk.
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

`;
