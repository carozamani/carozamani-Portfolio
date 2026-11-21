/**
 * Lenis only runs where the page is plain content. A case-study page stretches iframes over the
 * full page height, and a wheel event over an iframe never reaches Lenis, so scrolling there would
 * flip between smooth and native mid-page. The admin panel keeps native scrolling too.
 * Exact matches on purpose: `/articles/some-slug` and `/case-studies/some-slug` stay native.
 */
const SMOOTH_SCROLL_PATHS = new Set(['/', '/articles', '/case-studies']);

export function isSmoothScrollRoute(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return SMOOTH_SCROLL_PATHS.has(path);
}
