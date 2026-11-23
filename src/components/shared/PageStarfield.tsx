'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';

import { usePageStarfield } from '@/hooks/usePageStarfield';
import styles from './PageStarfield.module.css';

function Sky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePageStarfield(canvasRef);

  return <canvas ref={canvasRef} className={styles.sky} aria-hidden="true" />;
}

/**
 * The sky behind every public page: one fixed canvas under the content, so each box on the page sits
 * in front of the same stars. It lives in the root layout, so it is created once and carries on across
 * navigation: the stars never restart when you move between pages. The admin panel has its own
 * backdrop and never creates the WebGL context.
 */
export function PageStarfield() {
  const inAdmin = usePathname().startsWith('/admin');
  return inAdmin ? null : <Sky />;
}
