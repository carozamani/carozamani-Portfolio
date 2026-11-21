import { describe, expect, it } from 'vitest';
import { rewriteUploadUrls, withAssetAccess } from './assetUrl';

describe('withAssetAccess', () => {
  it('adds the token only to locked file paths', () => {
    expect(withAssetAccess('/uploads/a.webp', 'tok')).toBe('/uploads/a.webp?access=tok');
    expect(withAssetAccess('/case-studies/jabedee-en.html', 'a b')).toBe(
      '/case-studies/jabedee-en.html?access=a%20b',
    );
    expect(withAssetAccess('/image/cover.webp', 'tok')).toBe('/image/cover.webp');
    expect(withAssetAccess('/uploads/a.webp?v=1', 'tok')).toBe('/uploads/a.webp?v=1&access=tok');
  });

  it('does not add a second token', () => {
    const once = withAssetAccess('/uploads/a.webp', 'one');
    expect(withAssetAccess(once, 'two')).toBe(once);
  });
});

describe('rewriteUploadUrls', () => {
  it('leaves inline images alone', () => {
    const html = '<img src="data:image/jpeg;base64,abc"><img src="/uploads/a.webp">';
    expect(rewriteUploadUrls(html, 'tok')).toBe(
      '<img src="data:image/jpeg;base64,abc"><img src="/uploads/a.webp?access=tok">',
    );
  });
});
