'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import styles from './PageScrollbar.module.css';

const MIN_THUMB = 40;
const HIDE_DELAY = 2000;
// width of the right-edge strip that reveals the scrollbar
const EDGE = 14;

/**
 * Native page scrollbars reserve their own gutter, so nothing can show behind them.
 * This draws the page scrollbar as an overlay instead; the native one is hidden in globals.css.
 * It stays out of sight until the page scrolls or the pointer reaches the right edge, and only
 * the visible thumb takes pointer input, so content under the edge stays clickable.
 */
export function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const nearEdge = useRef(false);
  const hideTimer = useRef(0);

  // visibility is toggled through a data attribute so scrolling never re-renders React
  const reveal = () => {
    window.clearTimeout(hideTimer.current);
    trackRef.current?.setAttribute('data-visible', 'true');
  };

  const hideLater = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (nearEdge.current || drag.current) return;
      trackRef.current?.removeAttribute('data-visible');
    }, HIDE_DELAY);
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    trackRef.current?.removeAttribute('data-dragging');
    hideLater();
  };

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const viewport = window.innerHeight;
      const scrollable = doc.scrollHeight - viewport;

      track.dataset.hidden = String(scrollable <= 0);
      if (scrollable <= 0) return;

      const height = Math.max((viewport / doc.scrollHeight) * viewport, MIN_THUMB);
      const top = (window.scrollY / scrollable) * (viewport - height);
      thumb.style.height = `${height}px`;
      thumb.style.transform = `translateY(${top}px)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onScroll = () => {
      schedule();
      reveal();
      hideLater();
    };
    const setNearEdge = (near: boolean) => {
      if (near === nearEdge.current) return;
      nearEdge.current = near;
      if (near) reveal();
      else hideLater();
    };
    // tracked on the window rather than with enter/leave so a fast flick off the edge is never missed
    const onPointerMove = (event: globalThis.PointerEvent) => {
      setNearEdge(event.clientX >= window.innerWidth - EDGE);
    };
    // leaving the window through the right edge sends no further move, so clear the edge state here
    const onPointerOut = (event: globalThis.PointerEvent) => {
      if (!event.relatedTarget) setNearEdge(false);
    };
    const onBlur = () => setNearEdge(false);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut);
    window.addEventListener('blur', onBlur);
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, []);

  const scrollRatio = () => {
    const doc = document.documentElement;
    const thumbHeight = thumbRef.current?.offsetHeight ?? 0;
    return (doc.scrollHeight - window.innerHeight) / (window.innerHeight - thumbHeight);
  };

  const onThumbDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startScroll: window.scrollY };
    trackRef.current?.setAttribute('data-dragging', 'true');
    reveal();
  };

  const onThumbMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const delta = (event.clientY - drag.current.startY) * scrollRatio();
    window.scrollTo({ top: drag.current.startScroll + delta, behavior: 'instant' });
  };

  return (
    <div ref={trackRef} className={styles.track} aria-hidden="true">
      <div
        ref={thumbRef}
        className={styles.thumb}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      />
    </div>
  );
}
