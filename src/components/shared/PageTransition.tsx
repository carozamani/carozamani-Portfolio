'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createBlastEngine } from '@/lib/transition/blastEngine';
import type { Point } from '@/lib/transition/blastMath';
import { resolveTransitionHref } from '@/lib/transition/transitionTarget';
import styles from './PageTransition.module.css';

// A navigation that never lands (offline, a redirect back to the same path) must not strand the
// visitor behind a black screen
const NAVIGATION_TIMEOUT_MS = 4000;
const PAINT_FALLBACK_MS = 120;

type Arrival = { from: string; resolve: () => void };

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

// A keyboard activation reports detail 0 and no pointer position, so the blast starts at the link
const clickOrigin = (event: MouseEvent, anchor: HTMLAnchorElement): Point => {
  if (event.detail > 0) return { x: event.clientX, y: event.clientY };
  const rect = anchor.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Plays the blast on every internal link that changes page: the screen is blown to black from the
 * click point, the route changes underneath, then the black is burned away to reveal the new page.
 * Links opt out with `data-page-transition="off"` on themselves or an ancestor.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathnameRef = useRef(pathname);
  const arrivalRef = useRef<Arrival | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
    const waiting = arrivalRef.current;
    if (waiting && pathname !== waiting.from) waiting.resolve();
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = canvas ? createBlastEngine(canvas) : null;
    if (!engine) return;

    let busy = false;

    const waitForArrival = () =>
      new Promise<void>((resolve) => {
        let timer = 0;
        const arrive = () => {
          window.clearTimeout(timer);
          arrivalRef.current = null;
          resolve();
        };
        timer = window.setTimeout(arrive, NAVIGATION_TIMEOUT_MS);
        arrivalRef.current = { from: pathnameRef.current, resolve: arrive };
      });

    const play = async (href: string, origin: Point) => {
      busy = true;
      try {
        await engine.cover(origin);
        const arrival = waitForArrival();
        router.push(href);
        await arrival;
        await nextPaint();
      } finally {
        await engine.reveal();
        busy = false;
      }
    };

    // Capture phase on window: this runs before Next's <Link> handler, which skips any click that
    // is already default-prevented, while other onClick handlers on the link still fire
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
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
      if (!busy) void play(href, clickOrigin(event, anchor));
    };

    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      arrivalRef.current = null;
      engine.destroy();
    };
  }, [router]);

  return (
    <canvas ref={canvasRef} className={styles.canvas} data-active="false" aria-hidden="true" />
  );
}
