import { describe, expect, it } from 'vitest';
import {
  resolveTransitionHref,
  type ClickSnapshot,
  type LinkSnapshot,
  type LocationSnapshot,
} from './transitionTarget';

const ORIGIN = 'https://example.com';

const plainClick: ClickSnapshot = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};

const link = (href: string, overrides: Partial<LinkSnapshot> = {}): LinkSnapshot => ({
  href,
  target: null,
  download: false,
  optedOut: false,
  ...overrides,
});

const at = (pathname: string): LocationSnapshot => ({ origin: ORIGIN, pathname });

describe('resolveTransitionHref', () => {
  it('returns path, query and hash for an internal route change', () => {
    expect(
      resolveTransitionHref(link(`${ORIGIN}/case-studies/alpha?x=1#top`), plainClick, at('/')),
    ).toBe('/case-studies/alpha?x=1#top');
  });

  it('plays when jumping from a sub page to a home section', () => {
    expect(
      resolveTransitionHref(link(`${ORIGIN}/#projects`), plainClick, at('/case-studies')),
    ).toBe('/#projects');
  });

  it('treats an explicit _self target like no target', () => {
    expect(
      resolveTransitionHref(link(`${ORIGIN}/articles`, { target: '_self' }), plainClick, at('/')),
    ).toBe('/articles');
  });

  it.each([
    ['same page hash jump', `${ORIGIN}/#projects`, '/'],
    ['same page with a trailing slash', `${ORIGIN}/articles/`, '/articles'],
    ['query-only change', `${ORIGIN}/articles?page=2`, '/articles'],
  ])('skips a %s', (_label, href, pathname) => {
    expect(resolveTransitionHref(link(href), plainClick, at(pathname))).toBeNull();
  });

  it.each([
    ['external site', 'https://other.com/page'],
    ['mailto link', 'mailto:hi@example.com'],
    ['tel link', 'tel:+123456789'],
    ['static file', `${ORIGIN}/resume.pdf`],
    ['api route', `${ORIGIN}/api/content`],
    ['admin route', `${ORIGIN}/admin/articles`],
  ])('skips an %s', (_label, href) => {
    expect(resolveTransitionHref(link(href), plainClick, at('/'))).toBeNull();
  });

  it('skips links leaving the admin panel', () => {
    expect(resolveTransitionHref(link(`${ORIGIN}/`), plainClick, at('/admin/articles'))).toBeNull();
  });

  it.each([
    ['middle click', { ...plainClick, button: 1 }],
    ['cmd click', { ...plainClick, metaKey: true }],
    ['ctrl click', { ...plainClick, ctrlKey: true }],
    ['shift click', { ...plainClick, shiftKey: true }],
    ['alt click', { ...plainClick, altKey: true }],
  ])('leaves a %s to the browser', (_label, click) => {
    expect(resolveTransitionHref(link(`${ORIGIN}/articles`), click, at('/'))).toBeNull();
  });

  it('respects target, download and the opt-out marker', () => {
    const here = at('/');
    expect(
      resolveTransitionHref(link(`${ORIGIN}/articles`, { target: '_blank' }), plainClick, here),
    ).toBeNull();
    expect(
      resolveTransitionHref(link(`${ORIGIN}/articles`, { download: true }), plainClick, here),
    ).toBeNull();
    expect(
      resolveTransitionHref(link(`${ORIGIN}/articles`, { optedOut: true }), plainClick, here),
    ).toBeNull();
  });
});
