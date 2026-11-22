/**
 * Decides when a freshly navigated page is built, so the page transition can keep its black screen
 * up until then. A route change alone is not enough: lazy client blocks are still loading, images and
 * fonts are still arriving and the hero's planet has not drawn its first frame.
 *
 * A page is built when all of these hold at once:
 *  - nothing under the page root carries `data-page-pending`. Anything that loads after the route
 *    has changed (a `next/dynamic` block, a fetch, a WebGL canvas) sets that attribute while it is
 *    unfinished, and removes it when done.
 *  - the browser has no web font still loading;
 *  - every image that is in view, or loads eagerly, has finished (or failed);
 *  - the DOM has been quiet for a moment, which catches whatever mounts in the wake of the above.
 *
 * It never waits forever: after `timeoutMs` the page counts as ready whatever is still pending.
 */

export const PAGE_PENDING_ATTRIBUTE = 'data-page-pending';

const PENDING_SELECTOR = `[${PAGE_PENDING_ATTRIBUTE}]`;

const QUIET_MS = 200;
const TIMEOUT_MS = 6000;
const POLL_MS = 50;

export type PageReadyView = {
  innerWidth: number;
  innerHeight: number;
  fonts?: { status: string };
};

export type PendingReason = 'marker' | 'fonts' | 'image';

const browserView = (): PageReadyView => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  fonts: document.fonts,
});

const isInViewport = (rect: DOMRect, view: PageReadyView) =>
  rect.width > 0 &&
  rect.height > 0 &&
  rect.bottom > 0 &&
  rect.right > 0 &&
  rect.top < view.innerHeight &&
  rect.left < view.innerWidth;

/** What the page is still waiting for, or null when nothing is. */
export function findPendingReason(root: Element, view: PageReadyView): PendingReason | null {
  if (root.querySelector(PENDING_SELECTOR)) return 'marker';
  if (view.fonts?.status === 'loading') return 'fonts';

  for (const image of Array.from(root.querySelectorAll('img'))) {
    if (image.complete) continue;
    if (!image.getAttribute('src') && !image.getAttribute('srcset')) continue;
    // A lazy image outside the viewport is not loaded by the browser, so waiting for it would never end
    if (
      image.getAttribute('loading') === 'lazy' &&
      !isInViewport(image.getBoundingClientRect(), view)
    ) {
      continue;
    }
    return 'image';
  }

  return null;
}

export type PageReadyOptions = {
  /** Where the page lives: mutations and pending markers are looked for under it. */
  root: Element;
  /** How long the DOM must stay free of added or removed nodes. */
  quietMs?: number;
  /** The longest the wait may take. */
  timeoutMs?: number;
  signal?: AbortSignal;
  view?: () => PageReadyView;
};

export type PageReadyOutcome = 'ready' | 'timeout' | 'aborted';

export function waitForPageReady({
  root,
  quietMs = QUIET_MS,
  timeoutMs = TIMEOUT_MS,
  signal,
  view = browserView,
}: PageReadyOptions): Promise<PageReadyOutcome> {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    let lastChangeAt = startedAt;

    // Only nodes coming and going count. Attribute writes are left out on purpose: the hero moves its
    // layers on every frame, which would keep the page from ever looking quiet
    const observer = new MutationObserver(() => {
      lastChangeAt = performance.now();
    });
    observer.observe(root, { childList: true, subtree: true });

    const finish = (outcome: PageReadyOutcome) => {
      clearInterval(timer);
      observer.disconnect();
      signal?.removeEventListener('abort', onAbort);
      resolve(outcome);
    };
    const onAbort = () => finish('aborted');

    // A timer, not requestAnimationFrame: frames stop in a background tab and the wait must still end
    const timer = setInterval(() => {
      const now = performance.now();
      if (now - startedAt >= timeoutMs) return finish('timeout');
      if (now - lastChangeAt < quietMs) return;
      if (findPendingReason(root, view()) === null) finish('ready');
    }, POLL_MS);

    if (signal?.aborted) onAbort();
    else signal?.addEventListener('abort', onAbort, { once: true });
  });
}
