import type { EarthHorizonConfig } from '@/data/earthHorizon';

import { smoothstep } from './stageMath';

export interface PlanetLighting {
  /** Multiplies the ground and cloud brightness. */
  surface: number;
  /** Multiplies the city lights. */
  cities: number;
}

/** The planet's light for a given scroll progress through the hero, 0 (resting) to 1 (scrolled out). */
export function planetJourney(
  progress: number,
  journey: EarthHorizonConfig['journey'],
): PlanetLighting {
  // Eased at both ends so the light neither jumps as the scroll starts nor stops dead as it finishes
  const k = smoothstep(0, 1, progress);
  return {
    surface: 1 + (journey.surfaceDim - 1) * k,
    cities: 1 + (journey.cityBoost - 1) * k,
  };
}
