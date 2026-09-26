import { describe, expect, it } from 'vitest';
import { countWords, excerpt, hasContent, paragraphsToDoc, readingMinutes } from './doc';

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

describe('reading time', () => {
  it('rounds up at 200 words per minute and never drops below one minute', () => {
    expect(readingMinutes(paragraphsToDoc(['short']))).toBe(1);
    expect(readingMinutes(paragraphsToDoc([words(200)]))).toBe(1);
    expect(readingMinutes(paragraphsToDoc([words(201)]))).toBe(2);
    expect(readingMinutes(paragraphsToDoc([words(450)]))).toBe(3);
  });

  it('counts words across blocks and inline marks', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Two words' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'one ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    };
    expect(countWords(doc)).toBe(4);
  });
});

describe('excerpt', () => {
  it('keeps short text as is and trims long text on a word boundary', () => {
    expect(excerpt(paragraphsToDoc(['Hello world']))).toBe('Hello world');
    const long = excerpt(paragraphsToDoc([words(100)]));
    expect(long.endsWith('…')).toBe(true);
    expect(long.length).toBeLessThanOrEqual(161);
  });
});

describe('hasContent', () => {
  it('treats an empty paragraph as empty and an image as content', () => {
    expect(hasContent({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(false);
    expect(
      hasContent({ type: 'doc', content: [{ type: 'image', attrs: { src: '/a.png' } }] }),
    ).toBe(true);
  });
});
