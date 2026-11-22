'use client';

import Image from 'next/image';
import { useRef, type ChangeEvent, type CSSProperties } from 'react';
import {
  FiShuffle,
  FiSkipBack,
  FiSkipForward,
  FiVolume1,
  FiVolume2,
  FiVolumeX,
  FiX,
} from 'react-icons/fi';
import { MdForward10, MdReplay10, MdRepeatOne } from 'react-icons/md';
import { RiPauseFill, RiPlayFill } from 'react-icons/ri';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { SKIP_SECONDS, usePodcastPlayer, type RepeatMode } from './PodcastPlayerProvider';
import styles from './PodcastPlayer.module.css';

function repeatLabel(
  mode: RepeatMode,
  t: { repeatOff: string; repeatAll: string; repeatOne: string },
) {
  if (mode === 'one') return t.repeatOne;
  if (mode === 'all') return t.repeatAll;
  return t.repeatOff;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const fill = (percent: number) => ({ '--fill': `${percent}%` }) as CSSProperties;

/** Compact global dock player — sticky to the bottom of every page. */
export function PodcastPlayer() {
  const { player: t } = useDictionary();
  const {
    activeCard,
    isPlaying,
    currentTime,
    duration,
    unavailable,
    volume,
    shuffle,
    repeatMode,
    toggle,
    skip,
    seek,
    playPrevious,
    playNext,
    toggleShuffle,
    cycleRepeatMode,
    setVolume,
    close,
  } = usePodcastPlayer();

  const lastVolumeRef = useRef(volume > 0 ? volume : 1);

  if (!activeCard?.audioSrc) return null;

  const muted = volume === 0;
  const VolumeIcon = muted ? FiVolumeX : volume < 0.45 ? FiVolume1 : FiVolume2;

  const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
    seek(Number(event.target.value));
  };

  const onVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (next > 0) lastVolumeRef.current = next;
    setVolume(next);
  };

  const toggleMute = () => {
    if (muted) setVolume(lastVolumeRef.current || 1);
    else {
      if (volume > 0) lastVolumeRef.current = volume;
      setVolume(0);
    }
  };

  return (
    <div
      className={styles.player}
      dir="ltr"
      role="group"
      aria-label={`${t.nowPlaying}: ${activeCard.title}`}
    >
      <button type="button" className={styles.closeButton} onClick={close} aria-label={t.close}>
        <FiX aria-hidden="true" />
      </button>

      <div className={styles.inner}>
        <input
          type="range"
          className={styles.progress}
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={onSeek}
          disabled={unavailable || !duration}
          aria-label={t.seek}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          style={fill(duration ? (currentTime / duration) * 100 : 0)}
        />

        <div className={styles.meta}>
          <div className={styles.artwork}>
            {activeCard.image ? (
              <Image
                src={activeCard.image}
                alt=""
                width={48}
                height={48}
                className={styles.artworkImage}
              />
            ) : (
              <span className={styles.artworkGlyph}>{activeCard.title.charAt(0)}</span>
            )}
          </div>
          <div className={styles.nowPlaying}>
            <span className={styles.label}>{t.nowPlaying}</span>
            <span className={styles.title} dir="auto">
              {activeCard.title}
            </span>
            <span className={styles.time}>
              {unavailable ? t.unavailable : `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.secondary} role="group">
            <button
              type="button"
              className={styles.iconButton}
              data-active={shuffle || undefined}
              onClick={toggleShuffle}
              disabled={unavailable}
              aria-pressed={shuffle}
              aria-label={t.shuffle}
            >
              <FiShuffle aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => skip(-SKIP_SECONDS)}
              disabled={unavailable}
              aria-label={format(t.rewind, { n: SKIP_SECONDS })}
            >
              <MdReplay10 aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => skip(SKIP_SECONDS)}
              disabled={unavailable}
              aria-label={format(t.forward, { n: SKIP_SECONDS })}
            >
              <MdForward10 aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              data-active={repeatMode !== 'off' || undefined}
              onClick={cycleRepeatMode}
              disabled={unavailable}
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
            <div className={styles.volume}>
              <div className={styles.volumePanel}>
                <input
                  type="range"
                  className={styles.volumeSlider}
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={onVolume}
                  aria-label={t.volume}
                  aria-valuetext={`${Math.round(volume * 100)}%`}
                  style={fill(volume * 100)}
                />
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleMute}
                aria-label={muted ? t.unmute : t.mute}
              >
                <VolumeIcon aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={styles.primary} role="group">
            <button
              type="button"
              className={styles.iconButton}
              onClick={playPrevious}
              disabled={unavailable}
              aria-label={t.previous}
            >
              <FiSkipBack aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.playButton}
              data-playing={isPlaying || undefined}
              onClick={toggle}
              disabled={unavailable}
              aria-label={isPlaying ? t.pause : t.play}
            >
              {isPlaying ? <RiPauseFill aria-hidden="true" /> : <RiPlayFill aria-hidden="true" />}
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={playNext}
              disabled={unavailable}
              aria-label={t.next}
            >
              <FiSkipForward aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
