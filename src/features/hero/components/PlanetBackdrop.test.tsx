import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlanetBackdrop } from './PlanetBackdrop';

const source = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');

describe('PlanetBackdrop', () => {
  it.each(['top', 'bottom'] as const)('draws one canvas, placed at the %s', (placement) => {
    const doc = new DOMParser().parseFromString(
      renderToStaticMarkup(<PlanetBackdrop placement={placement} />),
      'text/html',
    );
    const frame = doc.querySelector('[data-placement]');
    expect(frame?.getAttribute('data-placement')).toBe(placement);
    expect(frame?.getAttribute('aria-hidden')).toBe('true');
    expect(frame?.querySelectorAll('canvas')).toHaveLength(1);
  });

  // Two separate canvases with their own frames drew two different-sized planets
  it('is the only way the hero and the footer draw the planet', () => {
    for (const file of ['./HeroModule.tsx', './HorizonFooter.tsx']) {
      const code = source(file);
      expect(code, file).toContain("from './PlanetBackdrop'");
      expect(code, file).not.toContain('EarthHorizonCanvas');
    }
  });
});
