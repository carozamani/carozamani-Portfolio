'use client';

import { FiShuffle } from 'react-icons/fi';
import { MdRepeatOne } from 'react-icons/md';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { usePodcastPlayer, type RepeatMode } from './PodcastPlayerProvider';
import styles from './PodcastTransport.module.css';

function repeatLabel(
  mode: RepeatMode,
  t: { repeatOff: string; repeatAll: string; repeatOne: string },
) {
  if (mode === 'one') return t.repeatOne;
  if (mode === 'all') return t.repeatAll;
  return t.repeatOff;
}

type Props = {
  disabled?: boolean;
  className?: string;
};

/** Shuffle + repeat-mode controls shared by the dock and episode transports. */
export function PodcastPlaybackModes({ disabled = false, className }: Props) {
  const { player: t } = useDictionary();
  const { shuffle, repeatMode, toggleShuffle, cycleRepeatMode } = usePodcastPlayer();

  return (
    <div className={`${styles.modes} ${className ?? ''}`.trim()}>
      <button
        type="button"
        className={styles.iconButton}
        data-active={shuffle || undefined}
        onClick={toggleShuffle}
        disabled={disabled}
        aria-pressed={shuffle}
        aria-label={t.shuffle}
      >
        <FiShuffle aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        data-active={repeatMode !== 'off' || undefined}
        onClick={cycleRepeatMode}
        disabled={disabled}
        aria-label={repeatLabel(repeatMode, t)}
      >
        {repeatMode === 'one' ? (
          <MdRepeatOne aria-hidden="true" />
        ) : repeatMode === 'all' ? (
          <TbRepeat aria-hidden="true" />
        ) : (
          <TbRepeatOff aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
