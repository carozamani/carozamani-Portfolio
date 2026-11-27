'use client';

import { RiPauseFill, RiPlayFill } from 'react-icons/ri';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { usePodcastPlayer } from './PodcastPlayerProvider';
import styles from './PodcastThumbPlay.module.css';

type Props = {
  episodeId: string;
  disabled?: boolean;
};

/**
 * On phones the transport under each episode is hidden; this single button, laid over the episode's
 * picture, starts it instead (and pauses it again). It is invisible on larger screens.
 */
export function PodcastThumbPlay({ episodeId, disabled = false }: Props) {
  const { player: t } = useDictionary();
  const { activeId, isPlaying, unavailable, select, toggle } = usePodcastPlayer();

  const isActive = activeId === episodeId;
  const playing = isActive && isPlaying;

  return (
    <button
      type="button"
      className={styles.button}
      data-active={isActive || undefined}
      data-playing={playing || undefined}
      onClick={() => {
        if (isActive) toggle();
        else select(episodeId);
      }}
      disabled={disabled || (isActive && unavailable)}
      aria-label={playing ? t.pause : t.play}
    >
      <span className={styles.disc}>
        {playing ? <RiPauseFill aria-hidden="true" /> : <RiPlayFill aria-hidden="true" />}
      </span>
    </button>
  );
}
