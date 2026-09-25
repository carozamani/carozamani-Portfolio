'use client';

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { FiPause, FiPlay, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { MdForward10, MdReplay10 } from 'react-icons/md';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import styles from './PodcastPlayer.module.css';

const SKIP_SECONDS = 10;
const SPEEDS = [1, 1.25, 1.5, 2] as const;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const fill = (percent: number) => ({ '--fill': `${percent}%` }) as CSSProperties;

type Props = { title: string; src: string; onClose: () => void };

export function PodcastPlayer({ title, src, onClose }: Props) {
  const { player: t } = useDictionary();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    audio?.play().catch(() => {});
    return () => audio?.pause();
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setUnavailable(true));
    else audio.pause();
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), duration || 0);
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) audioRef.current.currentTime = Number(event.target.value);
  };

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const applyVolume = (next: number) => {
    setVolume(next);
    if (audioRef.current) audioRef.current.volume = next;
  };

  const muted = volume === 0;

  return (
    <div className={styles.player} dir="ltr" role="group" aria-label={`${t.nowPlaying}: ${title}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setCurrentTime(0)}
        onError={() => setUnavailable(true)}
      />

      <div className={styles.header}>
        <div className={styles.nowPlaying}>
          <span className={styles.label}>{t.nowPlaying}</span>
          <span className={styles.title} dir="auto">
            {title}
          </span>
        </div>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label={t.close}>
          <FiX aria-hidden="true" />
        </button>
      </div>

      <input
        type="range"
        className={styles.range}
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={seek}
        disabled={unavailable || !duration}
        aria-label={t.seek}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        style={fill(duration ? (currentTime / duration) * 100 : 0)}
      />

      <div className={styles.times}>
        {unavailable ? (
          <span>{t.unavailable}</span>
        ) : (
          <>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.speed}
          onClick={cycleSpeed}
          aria-label={format(t.speed, { n: SPEEDS[speedIndex] })}
        >
          {SPEEDS[speedIndex]}x
        </button>

        <div className={styles.transport}>
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
            className={styles.playButton}
            onClick={toggle}
            disabled={unavailable}
            aria-label={isPlaying ? t.pause : t.play}
          >
            {isPlaying ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
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
        </div>

        <div className={styles.volume}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => applyVolume(muted ? 1 : 0)}
            aria-label={muted ? t.unmute : t.mute}
          >
            {muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
          </button>
          <input
            type="range"
            className={`${styles.range} ${styles.volumeRange}`}
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => applyVolume(Number(e.target.value))}
            aria-label={t.volume}
            style={fill(volume * 100)}
          />
        </div>
      </div>
    </div>
  );
}
