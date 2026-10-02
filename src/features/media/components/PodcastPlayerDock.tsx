'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { MotionProvider } from '@/components/shared/MotionProvider';
import { PodcastPlayer } from './PodcastPlayer';
import type { CardProps } from '@/types/card';
import styles from './PodcastPlayerDock.module.css';

type Props = { card: CardProps | undefined; onClose: () => void };

/** Docks the player to the bottom of the viewport; portalled out so page transforms can't break `fixed`. */
export function PodcastPlayerDock({ card, onClose }: Props) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <MotionProvider>
      <AnimatePresence>
        {card?.audioSrc && (
          <m.div
            key={card.id}
            className={styles.dock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <PodcastPlayer title={card.title} src={card.audioSrc} onClose={onClose} />
          </m.div>
        )}
      </AnimatePresence>
    </MotionProvider>,
    document.body,
  );
}
