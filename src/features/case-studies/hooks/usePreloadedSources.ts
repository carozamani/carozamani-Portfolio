'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps showing the previous sources until every new one is decoded, so swapping the images
 * (e.g. on a language change) never collapses the page height and throws the scroll position.
 */
export function usePreloadedSources(sources: string[]) {
  const key = sources.join('\n');
  const [shown, setShown] = useState({ key, sources });

  useEffect(() => {
    if (key === shown.key) return;
    let cancelled = false;

    Promise.all(
      sources.map((src) => {
        const image = new Image();
        image.src = src;
        return image.decode().catch(() => undefined);
      }),
    ).then(() => {
      if (!cancelled) setShown({ key, sources });
    });

    return () => {
      cancelled = true;
    };
    // `sources` is represented by `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, shown.key]);

  return shown.sources;
}
