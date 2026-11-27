/**
 * The geometry of the page-wide sky, shared by the TypeScript that places the stars and the shaders that
 * draw them, so both always agree where the Milky Way lies.
 *
 * The observer's frame: x runs to the right of the screen, y points to the nadir (down, towards the
 * planet) and z runs along the meridian towards the first horizon. The camera tilts in the y-z plane as
 * the page scrolls; the celestial sphere turns slowly about its pole.
 */
export type Vec3 = readonly [number, number, number];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

/** Straight overhead */
export const ZENITH: Vec3 = [0, -1, 0];

/** The point of the meridian `elevationRad` away from the first horizon: 0 is that horizon, a quarter turn is the zenith, a half turn is the opposite horizon. */
export function meridianDirection(elevationRad: number): Vec3 {
  return [0, -Math.sin(elevationRad), Math.cos(elevationRad)];
}

export interface GalaxyPlacement {
  /** Where, along the page's sweep from one horizon to the other, the Milky Way crosses the meridian */
  crossElevationDeg: number;
  /** How steeply it crosses: 0 runs level across the screen, 90 runs straight up it */
  bandAngleDeg: number;
  /** How far along the band, from that crossing, the bright galactic centre lies */
  coreOffsetDeg: number;
}

export interface GalaxyFrame {
  /** Pole of the galactic plane */
  pole: Vec3;
  /** Direction of the galactic centre */
  core: Vec3;
}

/**
 * Puts the Milky Way where the scroll will meet it: the band crosses the meridian at the chosen
 * elevation and angle, with its bright centre a little way along it.
 */
export function galaxyFrame(placement: GalaxyPlacement): GalaxyFrame {
  const e = toRadians(placement.crossElevationDeg);
  const theta = toRadians(placement.bandAngleDeg);
  const crossing = meridianDirection(e);
  // The meridian's own direction of travel at the crossing
  const along: Vec3 = [0, -Math.cos(e), -Math.sin(e)];
  const tangent: Vec3 = [
    Math.cos(theta),
    Math.sin(theta) * along[1],
    Math.sin(theta) * along[2],
  ];
  const pole = normalize(cross(crossing, tangent));
  const offset = toRadians(placement.coreOffsetDeg);
  const core: Vec3 = [
    crossing[0] * Math.cos(offset) + tangent[0] * Math.sin(offset),
    crossing[1] * Math.cos(offset) + tangent[1] * Math.sin(offset),
    crossing[2] * Math.cos(offset) + tangent[2] * Math.sin(offset),
  ];
  return { pole, core };
}

/** The axis the sky turns about: tilted from the zenith by the observer's colatitude, in the meridian plane. */
export function poleAxis(latitudeDeg: number): Vec3 {
  const lat = toRadians(latitudeDeg);
  return [0, -Math.sin(lat), Math.cos(lat)];
}

/** Rotation by `angle` about `axis` (Rodrigues), as a column-major 3x3 ready for `uniformMatrix3fv`. It turns sky directions into observer directions. */
export function skyRotation(axis: Vec3, angle: number): Float32Array {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  // row-major rows, then transposed into column-major
  const r = [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
  const out = new Float32Array(9);
  for (let col = 0; col < 3; col += 1) {
    for (let row = 0; row < 3; row += 1) out[col * 3 + row] = r[row][col];
  }
  return out;
}

/**
 * How much of the galaxy's light lies in a direction: brightest towards the galactic centre, where the
 * plane swells into a bulge, thinning to a slim and much fainter band on the far side. The shader has
 * the same formula; keep them in step.
 */
export function galacticDensity(s: Vec3, frame: GalaxyFrame): number {
  const sinB = dot(s, frame.pole);
  const cosB = Math.sqrt(Math.max(1 - sinB * sinB, 0.0001));
  const cosL = Math.min(1, Math.max(-1, dot(s, frame.core) / cosB));
  const towardsCentre = Math.exp(-(1 - cosL) * 1.7);
  const bulge = Math.exp(-(1 - cosL) * 2.4);
  const width = 0.085 + (0.19 - 0.085) * bulge;
  const disk = Math.exp((-sinB * sinB) / (2 * width * width));
  const halo = 0.22 * Math.exp((-sinB * sinB) / 0.2312);
  return (0.26 + 0.74 * towardsCentre) * (disk + halo);
}

/**
 * Where a point of the sky lies, given where the camera would be looking when that point is dead centre
 * of the screen (`elevationDeg`, measured along the page's sweep) and how far to the right of the centre
 * line it sits (`lateralDeg`, negative is left). The sky-frame direction a shader needs.
 */
export function skyDirection(elevationDeg: number, lateralDeg: number): Vec3 {
  const meridian = meridianDirection(toRadians(elevationDeg));
  const lateral = toRadians(lateralDeg);
  return normalize([
    Math.sin(lateral),
    meridian[1] * Math.cos(lateral),
    meridian[2] * Math.cos(lateral),
  ]);
}

interface SkyPlace {
  /** Camera elevation at which it crosses the middle of the screen; 40 is the top of the page, 220 the bottom. */
  elevationDeg: number;
  /** Degrees right of the middle of the screen when it does; negative is left. */
  lateralDeg: number;
}

/** A bright star with a soft halo and four diffraction spikes. */
export interface Beacon extends SkyPlace {
  /** Radius of the halo in screen pixels at the reference lens; the spikes are several times as long. */
  size: number;
  tint: Vec3;
}

/** A cloud of glowing gas. */
export interface Nebula extends SkyPlace {
  radiusDeg: number;
  tint: Vec3;
  strength: number;
  /** Moves the cloud's pattern, so two nebulae never share a shape. */
  seed: number;
}

/** A knot of stars: loose and bright (open) or dense with a glowing heart (globular). */
export interface Cluster extends SkyPlace {
  radiusDeg: number;
  tint: Vec3;
  /** Stars per unit area, 0 to 1 */
  density: number;
  kind: 'open' | 'globular';
}

/**
 * Everything that makes one stretch of the sky unlike another. A pan across a field of identical stars
 * reads as the same picture sliding past; a bright star, a nebula, a cluster and the band of the galaxy
 * each arriving in turn, from alternating sides, reads as turning through a real sky.
 */
export interface SkyConfig {
  galaxy: GalaxyPlacement;
  beacons: readonly Beacon[];
  nebulae: readonly Nebula[];
  clusters: readonly Cluster[];
}
