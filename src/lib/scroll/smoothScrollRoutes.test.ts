import { describe, expect, it } from 'vitest';
import { isSmoothScrollRoute } from './smoothScrollRoutes';

describe('isSmoothScrollRoute', () => {
  it.each(['/', '/articles', '/case-studies'])('is on for %s', (path) => {
    expect(isSmoothScrollRoute(path)).toBe(true);
  });

  it('tolerates a trailing slash', () => {
    expect(isSmoothScrollRoute('/articles/')).toBe(true);
  });

  it.each([
    '/case-studies/some-project', // iframes swallow wheel events here
    '/articles/some-article',
    '/admin',
    '/admin/articles',
    '/admin/login',
    '/not-a-page',
  ])('is off for %s', (path) => {
    expect(isSmoothScrollRoute(path)).toBe(false);
  });
});
