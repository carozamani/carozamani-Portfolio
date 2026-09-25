'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Card.module.css';
import TypographyComponent from '@/components/ui/Typography';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';
import type { CardProps } from '@/types/card';

export default function Card({
  type,
  title,
  summary,
  image,
  href,
  date,
  listeners = 0,
  duration = '',
  readTime = '',
  active = false,
  onSelect,
}: CardProps & { active?: boolean; onSelect?: () => void }) {
  const isPodcast = type === 'podcast';
  const { locale, dict } = useLocale();

  const truncatedSummary = summary.length > 150 ? summary.slice(0, 150) + '...' : summary;

  const ImageBlock = image ? (
    <div
      className={`${styles.imageContainer} ${isPodcast ? styles.circle : styles.square} ${active ? styles.blur : ''}`}
    >
      <Image src={image} alt={title} fill className={styles.image} />

      {isPodcast && (
        <div className={styles.centerIcon}>{active ? <PauseIcon /> : <PlayIcon />}</div>
      )}

      <div className={styles.imageGradient} />
    </div>
  ) : null;

  const TextBlock = (
    <div className={styles.textSection}>
      <TypographyComponent variant="h4" color="text-primary" className={styles.title}>
        {title}
      </TypographyComponent>

      <TypographyComponent
        variant="body1"
        color="text-secondary"
        ellipsis
        className={styles.summary}
      >
        {truncatedSummary}
      </TypographyComponent>

      <div className={styles.metadata}>
        <MetadataItem icon={<CalendarIcon />} label={date} />

        {isPodcast && duration && <MetadataItem icon={<ClockIcon />} label={duration} />}
        {isPodcast && listeners && listeners > 0 && (
          <MetadataItem
            icon={<ListenerIcon />}
            label={format(dict.media.listeners, {
              n: listeners.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en'),
            })}
          />
        )}

        {type === 'article' && readTime && <MetadataItem icon={<ClockIcon />} label={readTime} />}
      </div>
    </div>
  );

  const CardInner = (
    <>
      {TextBlock}
      {ImageBlock}
      {isPodcast && active && <div className={styles.glowOverlay} />}
      <div className={styles.beforeLayer} />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.cardLink}>
        {CardInner}
      </Link>
    );
  }

  return (
    <div
      className={styles.cardDiv}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? active : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect();
        }
      }}
    >
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
