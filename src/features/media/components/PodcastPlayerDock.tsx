'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PodcastPlayer } from './PodcastPlayer';
import { usePodcastPlayer } from './PodcastPlayerProvider';
import styles from './PodcastPlayerDock.module.css';

const emptySubscribe = () => () => {};

/** Fixed mini-player dock on every page while an episode is active. */
export function PodcastPlayerDock() {
  const { activeCard } = usePodcastPlayer();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted || !activeCard?.audioSrc) return null;

  // No transform/opacity animation on this tree: both break backdrop-filter.
  return createPortal(
    <div className={styles.dock}>
      <div className={styles.surface}>
        <PodcastPlayer />
      </div>
    </div>,
    document.body,
  );
}
