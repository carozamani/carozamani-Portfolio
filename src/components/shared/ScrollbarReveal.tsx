'use client';

import { useEffect } from 'react';

const EDGE_ZONE_PX = 24;

export function ScrollbarReveal() {
  useEffect(() => {
    const root = document.documentElement;

    const onMove = (e: MouseEvent) => {
      const nearEdge = window.innerWidth - e.clientX <= EDGE_ZONE_PX;
      if (nearEdge) root.setAttribute('data-scrollbar', 'visible');
      else root.removeAttribute('data-scrollbar');
    };
    const onLeave = () => root.removeAttribute('data-scrollbar');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      root.removeAttribute('data-scrollbar');
    };
  }, []);

  return null;
}
