'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { COVER_MS, createBlastEngine } from '@/lib/transition/blastEngine';
import type { Point } from '@/lib/transition/blastMath';
import { registerTransitionRunner } from '@/lib/transition/transitionBus';
import { resolveTransitionHref } from '@/lib/transition/transitionTarget';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { Wordmark } from '@/components/ui/Wordmark';
import styles from './PageTransition.module.css';

// A navigation that never lands (offline, a redirect back to the same path) must not strand the
// visitor behind a black screen
const NAVIGATION_TIMEOUT_MS = 4000;
const PAINT_FALLBACK_MS = 120;

// The brand mark, filled with the brand colour: the SVG itself is not recolourable, so it is used as a
// mask over a solid colour instead
const LOGO_MASK = 'url(/image/LogoMark.svg)';

// What the black screen is waiting for: `isDone` is checked whenever the route or the language changes
type Arrival = { isDone: () => boolean; resolve: () => void };

const nextPaint = () =>
  new Promise<void>((resolve) => {
    // requestAnimationFrame is paused in background tabs, so a timer guarantees the reveal runs
    const timer = window.setTimeout(resolve, PAINT_FALLBACK_MS);
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        window.clearTimeout(timer);
        resolve();
      }),
    );
  });

// A keyboard activation reports detail 0 and no pointer position, so the blast starts at the element
const clickOrigin = (event: MouseEvent, element: Element): Point => {
  if (event.detail > 0) return { x: event.clientX, y: event.clientY };
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Plays the blast on every internal link that changes page, and on a language switch: the screen is
 * blown to black from the click point, the route (or the language) changes underneath, then the black
 * is burned away to reveal the new page.
 * A small logo in the brand colour, with the "carozamani" wordmark under it in that same colour, is in
 * the middle of the screen from the first frame: it fades up
 * over the same `COVER_MS` the blast takes to spread, so it reaches full opacity exactly when the
 * screen is fully black, never before. The black clears as soon as the new page is ready, with no
 * extra hold.
 * Links opt out with `data-page-transition="off"` on themselves or an ancestor.
 * Other code (the language switch) plays it through the transition bus.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef({ pathname, locale });
  const arrivalRef = useRef<Arrival | null>(null);

  useEffect(() => {
    latestRef.current = { pathname, locale };
    const waiting = arrivalRef.current;
    if (waiting?.isDone()) waiting.resolve();
  }, [pathname, locale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = canvas ? createBlastEngine(canvas) : null;
    if (!engine) return;

    let busy = false;
    // Where the last click landed: a language switch starts its blast from the button that was pressed
    let lastOrigin: Point | null = null;

    const showLogo = (visible: boolean) => {
      if (logoRef.current) logoRef.current.dataset.visible = String(visible);
    };

    const waitForArrival = (isDone: () => boolean) =>
      new Promise<void>((resolve) => {
        let timer = 0;
        const arrive = () => {
          window.clearTimeout(timer);
          arrivalRef.current = null;
          resolve();
        };
        timer = window.setTimeout(arrive, NAVIGATION_TIMEOUT_MS);
        arrivalRef.current = { isDone, resolve: arrive };
      });

    // `change` is what happens under the black screen; `isDone` says when its result is on screen
    const play = async (change: () => void, isDone: () => boolean, origin: Point) => {
      busy = true;
      // Shown before the blast starts, not after it ends: the fade is a compositor transition that
      // is already running when the main thread gets busy with the change
      showLogo(true);
      try {
        await engine.cover(origin);
        const arrival = waitForArrival(isDone);
        change();
        await arrival;
        await nextPaint();
      } finally {
        // It starts leaving as the black starts to clear, well before the front reaches the middle
        showLogo(false);
        await engine.reveal();
        busy = false;
      }
    };

    // Capture phase on window: this runs before Next's <Link> handler, which skips any click that
    // is already default-prevented, while other onClick handlers on the link still fire
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      lastOrigin = clickOrigin(
        event,
        event.target.closest('button, a[href], [role="option"]') ?? event.target,
      );
      if (event.defaultPrevented) return;
      const anchor = event.target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = resolveTransitionHref(
        {
          href: anchor.href,
          target: anchor.getAttribute('target'),
          download: anchor.hasAttribute('download'),
          optedOut: anchor.closest('[data-page-transition="off"]') !== null,
        },
        event,
        { origin: window.location.origin, pathname: window.location.pathname },
      );
      if (!href) return;

      event.preventDefault();
      if (busy) return;
      const from = latestRef.current.pathname;
      void play(
        () => router.push(href),
        () => latestRef.current.pathname !== from,
        lastOrigin ?? clickOrigin(event, anchor),
      );
    };

    // The language switch: the same black screen, with the new language swapped in underneath it
    const unregister = registerTransitionRunner((start) => {
      if (busy || latestRef.current.pathname.startsWith('/admin')) return false;
      const from = latestRef.current.locale;
      void play(
        start,
        () => latestRef.current.locale !== from,
        lastOrigin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      );
      return true;
    });

    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      unregister();
      arrivalRef.current = null;
      showLogo(false);
      engine.destroy();
    };
  }, [router]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} data-active="false" aria-hidden="true" />
      <div
        ref={logoRef}
        className={styles.logo}
        data-visible="false"
        aria-hidden="true"
        style={{ '--logo-fade-ms': `${COVER_MS}ms` } as React.CSSProperties}
      >
        <span className={styles.badge}>
          <span
            className={styles.mark}
            style={{ maskImage: LOGO_MASK, WebkitMaskImage: LOGO_MASK }}
          />
          <Wordmark uniform className={styles.name} />
        </span>
      </div>
    </>
  );
}
