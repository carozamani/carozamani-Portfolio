import { describe, expect, it } from 'vitest';

import { earthHorizonConfig } from '@/data/earthHorizon';

import { planetJourney } from './planetJourney';

const { journey } = earthHorizonConfig;

describe('planetJourney', () => {
  it('leaves the resting light alone before the scroll starts', () => {
    expect(planetJourney(0, journey)).toEqual({ surface: 1, cities: 1 });
  });

  it('reaches the configured night light when the hero is scrolled out', () => {
    const end = planetJourney(1, journey);
    expect(end.surface).toBeCloseTo(journey.surfaceDim, 9);
    expect(end.cities).toBeCloseTo(journey.cityBoost, 9);
  });

  it('dims the ground and brightens the cities steadily on the way', () => {
    let previous = planetJourney(0, journey);
    for (let p = 0.1; p <= 1.0001; p += 0.1) {
      const now = planetJourney(p, journey);
      expect(now.surface).toBeLessThanOrEqual(previous.surface);
      expect(now.cities).toBeGreaterThanOrEqual(previous.cities);
      previous = now;
    }
  });

  it('eases in: the first tenth of the scroll changes the light by less than a tenth of the way', () => {
    const early = planetJourney(0.1, journey);
    const dimmedShare = (1 - early.surface) / (1 - journey.surfaceDim);
    expect(dimmedShare).toBeLessThan(0.1);
  });

  it('holds the end values when the progress overshoots', () => {
    expect(planetJourney(3, journey)).toEqual(planetJourney(1, journey));
    expect(planetJourney(-1, journey)).toEqual(planetJourney(0, journey));
  });
});
