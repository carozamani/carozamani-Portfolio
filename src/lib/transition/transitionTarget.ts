export type LinkSnapshot = {
  /** The anchor's resolved `href`. */
  href: string;
  target: string | null;
  download: boolean;
  /** The anchor sits inside an element marked `data-page-transition="off"`. */
  optedOut: boolean;
};

export type ClickSnapshot = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

export type LocationSnapshot = {
  origin: string;
  pathname: string;
};

// Same rule Button uses: a static file such as /resume.pdf is not an app route
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

const trimTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);
const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

/**
 * Decides whether a click on a link should play the page transition. Returns the URL to push
 * (path, query and hash), or null when the browser or Next should handle the click untouched:
 * new-tab gestures, downloads, external and non-http links, files, API routes, the admin panel,
 * and anything that stays on the same page (hash jumps are the scroll engine's job).
 */
export function resolveTransitionHref(
  link: LinkSnapshot,
  click: ClickSnapshot,
  current: LocationSnapshot,
): string | null {
  if (click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) {
    return null;
  }
  if (link.download || link.optedOut) return null;
  if (link.target && link.target !== '_self') return null;

  let url: URL;
  try {
    url = new URL(link.href, current.origin);
  } catch {
    return null;
  }
  // mailto:, tel: and other schemes report the origin "null", so they fail this check too
  if (url.origin !== current.origin) return null;

  const next = trimTrailingSlash(url.pathname);
  const here = trimTrailingSlash(current.pathname);
  if (next === here) return null;
  if (FILE_EXTENSION.test(next) || next.startsWith('/api/')) return null;
  if (isAdminPath(next) || isAdminPath(here)) return null;

  return `${url.pathname}${url.search}${url.hash}`;
}
