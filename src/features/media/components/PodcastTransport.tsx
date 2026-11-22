'use client';

import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { MdForward10, MdReplay10 } from 'react-icons/md';
import { RiPauseFill, RiPlayFill } from 'react-icons/ri';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { PodcastPlaybackModes } from './PodcastPlaybackModes';
import { SKIP_SECONDS, usePodcastPlayer } from './PodcastPlayerProvider';
import styles from './PodcastTransport.module.css';

type Props = {
  episodeId: string;
  disabled?: boolean;
  className?: string;
};

export function PodcastTransport({ episodeId, disabled = false, className }: Props) {
  const { player: t } = useDictionary();
  const { activeId, isPlaying, unavailable, select, toggle, skip, playPrevious, playNext } =
    usePodcastPlayer();

  const isActive = activeId === episodeId;
  const playing = isActive && isPlaying;
  const transportDisabled = disabled || (isActive && unavailable);

  return (
    <div className={`${styles.transport} ${className ?? ''}`.trim()} dir="ltr">
      <PodcastPlaybackModes />
      <button
        type="button"
        className={styles.iconButton}
        onClick={playPrevious}
        disabled={!isActive}
        aria-label={t.previous}
      >
        <FiSkipBack aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => skip(-SKIP_SECONDS)}
        disabled={!isActive || transportDisabled}
        aria-label={format(t.rewind, { n: SKIP_SECONDS })}
      >
        <MdReplay10 aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.playButton}
        data-playing={playing || undefined}
        onClick={() => {
          if (isActive) toggle();
          else select(episodeId);
        }}
        disabled={disabled || (isActive && unavailable)}
        aria-label={playing ? t.pause : t.play}
      >
        {playing ? <RiPauseFill aria-hidden="true" /> : <RiPlayFill aria-hidden="true" />}
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => skip(SKIP_SECONDS)}
        disabled={!isActive || transportDisabled}
        aria-label={format(t.forward, { n: SKIP_SECONDS })}
      >
        <MdForward10 aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={playNext}
        disabled={!isActive}
        aria-label={t.next}
      >
        <FiSkipForward aria-hidden="true" />
      </button>
    </div>
  );
}
