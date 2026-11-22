import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Numeral } from './Numeral';
import { Starfield } from './Starfield';

describe('Numeral', () => {
  const markup = renderToStaticMarkup(<Numeral />);

  it('is announced as a single 404 image, hiding its layers from assistive tech', () => {
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="404"');
    expect(markup.match(/<svg/g)).toHaveLength(5);
    expect(markup.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(5);
  });

  it('never repeats an svg id across its layers', () => {
    const ids = markup.match(/\sid="[^"]+"/g) ?? [];
    expect(ids.length).toBeGreaterThan(10);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('draws both glyphs in every digit layer', () => {
    expect(markup.match(/translate\(60 40\)/g)).toHaveLength(4);
    expect(markup.match(/translate\(740 40\)/g)).toHaveLength(4);
  });

  it('exposes the numeral to the stage so the spotlight can be mapped onto it', () => {
    expect(markup).toContain('data-numeral');
  });
});

describe('Starfield', () => {
  it('renders three star layers and is hidden from assistive tech', () => {
    const markup = renderToStaticMarkup(<Starfield />);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup.match(/box-shadow:/g)).toHaveLength(3);
  });
});
