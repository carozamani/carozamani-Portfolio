'use client';

import { useRef, useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Card.module.css';
import { usePlayer } from '../PlayerContext';
import TypographyComponent from '../../typography/Typography.component';


export interface CardProps {
  id: string;
  type: 'podcast' | 'article';
  title: string;
  summary: string;
  image?: string;
  audioSrc?: string;
  href?: string;
  date: string;
  listeners?: number;
  duration?: string;
  readTime?: string;
}

export default function Card({
  id,
  type,
  title,
  summary,
  image,
  audioSrc,
  href,
  date,
  listeners = 0,
  duration = '',
  readTime = '',
}: CardProps) {
  const shouldUsePlayer = type === 'podcast';
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentId, play, stop } = usePlayer();
  const isPlaying = shouldUsePlayer ? currentId === id : false;

  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference * (1 - (totalDuration > 0 ? currentTime / totalDuration : 0));

  const handlePlayPause = (e?: MouseEvent) => {
    if (!shouldUsePlayer) return;
    e?.stopPropagation();
    e?.preventDefault();
    isPlaying ? stop() : play(id, audioRef);
  };

  useEffect(() => {
    if (!shouldUsePlayer) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setTotalDuration(audio.duration);
      setIsLoaded(true);
    };
    const onTimeUpdate = () => {
      if (isPlaying) setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      stop();
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isPlaying, stop, shouldUsePlayer]);

  const truncatedSummary = summary.length > 150 ? summary.slice(0, 150) + '...' : summary;

  const ImageBlock = image ? (
    <div className={`${styles.imageContainer} ${type === 'podcast' ? styles.circle : styles.square} ${isPlaying ? styles.blur : ''}`}>
      {type === 'podcast' && isPlaying && isLoaded && (
        <svg className={styles.progressCircle} viewBox="0 0 100 100">
          <circle
            stroke="var(--color-icon-progress-bg, rgba(255,255,255,0.25))"
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            stroke="var(--color-icon-progress, #06b6d4)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
      )}

      <Image src={image} alt={title} fill className={styles.image} />

      {type === 'podcast' && (
        <div className={styles.centerIcon}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>
      )}

      <div className={styles.imageGradient} />

      {shouldUsePlayer && <audio ref={audioRef} src={audioSrc} preload="auto" />}
    </div>
  ) : null;

  const TextBlock = (
    <div className={styles.textSection}>
      <TypographyComponent variant="h4" color="text-primary" className={styles.title}>
        {title}
      </TypographyComponent>

      <TypographyComponent variant="body1" color="text-secondary" ellipsis className={styles.summary}>
        {truncatedSummary}
      </TypographyComponent>

      <div className={styles.metadata}>
        <MetadataItem icon={<CalendarIcon />} label={date} />

        {type === 'podcast' && duration && (
          <MetadataItem icon={<ClockIcon />} label={duration} />
        )}
        {type === 'podcast' && listeners && listeners > 0 && (
          <MetadataItem icon={<ListenerIcon />} label={`${listeners}K`} />
        )}

        {type === 'article' && readTime && (
          <MetadataItem icon={<ClockIcon />} label={readTime} />
        )}
      </div>
    </div>
  );

  const CardInner = (
    <>
      {TextBlock}
      {ImageBlock}
      {shouldUsePlayer && isPlaying && <div className={styles.glowOverlay} />}
      <div className={styles.beforeLayer} />
    </>
  );

  return href ? (
    <Link href={href} className={styles.cardLink} onClick={handlePlayPause}>
      {CardInner}
    </Link>
  ) : (
    <div className={styles.cardDiv} onClick={handlePlayPause}>
      {CardInner}
    </div>
  );
}

/* ============= Metadata Item ============= */
function MetadataItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className={styles.metadataItem}>
      <span className={styles.icon}>{icon}</span>
      <TypographyComponent variant="caption" color="text-secondary">
        {label}
      </TypographyComponent>
    </div>
  );
}

/* ============= Icons ============= */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ListenerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 0 0-9.84 8.21c.21 2.22 1.34 4.22 3.03 5.75L12 22l6.81-6.04c1.69-1.53 2.82-3.53 3.03-5.75A10 10 0 0 0 12 2zM9 13a3 3 0 1 1 6 0" />
  </svg>
);

const PlayIcon = () => (
  <svg className={styles.playPauseIcon} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className={styles.playPauseIcon} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" />
    <rect x="14" y="5" width="4" height="14" />
  </svg>
);
