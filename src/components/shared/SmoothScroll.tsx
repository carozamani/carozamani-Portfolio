'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { registerScrollEngine } from '@/lib/scroll/scrollEngine';
import { isSmoothScrollRoute } from '@/lib/scroll/smoothScrollRoutes';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * Inertial page scrolling through Lenis, on the routes `isSmoothScrollRoute` allows. Visitors who
 * prefer reduced motion get the browser's own scrolling: Lenis is never created for them, and if
 * they flip the setting while the page is open it is created or torn down on the spot.
 * Touch keeps native momentum, which is already smooth and expected on a phone.
 */
export function SmoothScroll() {
  const enabled = isSmoothScrollRoute(usePathname());

  useEffect(() => {
    if (!enabled) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    let lenis: Lenis | null = null;

    const stop = () => {
      registerScrollEngine(null);
      lenis?.destroy();
      lenis = null;
    };

    const sync = () => {
      stop();
      if (reducedMotion.matches) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.09 });
      registerScrollEngine(lenis);
    };

    sync();
    reducedMotion.addEventListener('change', sync);

    return () => {
      reducedMotion.removeEventListener('change', sync);
      stop();
    };
  }, [enabled]);

  return null;
}
