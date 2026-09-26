import { describe, expect, it } from 'vitest';
import { paragraphsToDoc, plainTextWords } from './doc';
import { renderRichText } from './render';

describe('renderRichText', () => {
  it('renders headings, links and images from the editor JSON', () => {
    const html = renderRichText({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'docs',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
        { type: 'image', attrs: { src: '/a.png', alt: 'An image' } },
      ],
    });

    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('alt="An image"');
  });

  it('does not emit javascript: links', () => {
    const html = renderRichText({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    });

    expect(html).not.toContain('javascript:');
  });

  it('turns legacy paragraph arrays into a document', () => {
    expect(renderRichText(paragraphsToDoc(['One', 'Two']))).toBe('<p>One</p><p>Two</p>');
  });
});

describe('plainTextWords', () => {
  it('counts words ignoring extra whitespace', () => {
    expect(plainTextWords('  hello   big world ')).toBe(3);
    expect(plainTextWords('')).toBe(0);
  });
});
