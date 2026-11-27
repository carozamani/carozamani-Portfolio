'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';
import type { CardProps } from '@/types/card';
import { usePodcastPlayer } from './PodcastPlayerProvider';
import { PodcastThumbPlay } from './PodcastThumbPlay';
import { PodcastTransport } from './PodcastTransport';
import styles from './MediaEditorialList.module.css';

type Kind = 'podcasts' | 'articles';

type Props = { kind: Kind; cards: CardProps[] };

export function MediaEditorialList({ kind, cards }: Props) {
  const { locale, dict } = useLocale();
  const { activeId, isPlaying } = usePodcastPlayer();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const focusId = hoveredId ?? (kind === 'podcasts' ? activeId : null) ?? cards[0]?.id ?? null;
  const isRtl = locale === 'fa';

  return (
    <div className={styles.listWrapper}>
      <div className={styles.centerGlow} aria-hidden="true" />

      <ul className={styles.list}>
        {cards.map((card) => {
          const href =
            card.href ?? (kind === 'podcasts' ? `/podcasts/${card.id}` : `/articles/${card.id}`);
          const isActive = kind === 'podcasts' && activeId === card.id;
          const isFocused = focusId === card.id;
          const subtitle =
            kind === 'podcasts'
              ? [
                  card.date,
                  card.duration,
                  card.listeners && card.listeners > 0
                    ? format(dict.media.listeners, {
                        n: card.listeners.toLocaleString(isRtl ? 'fa-IR' : 'en'),
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : [card.date, card.readTime].filter(Boolean).join(' · ');

          return (
            <li key={card.id} className={styles.listItem}>
              <div
                className={styles.row}
                data-kind={kind}
                data-current={isActive || undefined}
                data-active={isFocused}
                data-playing={isActive && isPlaying}
                onMouseEnter={() => setHoveredId(card.id)}
              >
                {kind === 'podcasts' ? (
                  <>
                    <span className={styles.rowLogoColumn}>
                      <span className={styles.rowLogoStack}>
                        <Link
                          href={href}
                          className={styles.rowLogoLink}
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          <RowLogo card={card} />
                        </Link>
                        <PodcastThumbPlay episodeId={card.id} disabled={!card.audioSrc} />
                      </span>
                    </span>
                    <Link href={href} className={styles.rowLink}>
                      <RowText card={card} subtitle={subtitle} />
                    </Link>
                    <span
                      className={`${styles.rowControlsCell} ${styles.rowTransportCell}`}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <PodcastTransport episodeId={card.id} disabled={!card.audioSrc} />
                    </span>
                  </>
                ) : (
                  <Link href={href} className={styles.rowLink}>
                    <RowMain card={card} subtitle={subtitle} />
                    <span className={styles.rowControlsCell}>
                      <span className={styles.articleCue} aria-hidden="true">
                        {isRtl ? <FiArrowLeft /> : <FiArrowRight />}
                      </span>
                    </span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RowMain({ card, subtitle }: { card: CardProps; subtitle: string }) {
  return (
    <>
      <span className={styles.rowLogoColumn}>
        <RowLogo card={card} />
      </span>
      <RowText card={card} subtitle={subtitle} />
    </>
  );
}

function RowLogo({ card }: { card: CardProps }) {
  return (
    <span className={styles.rowLogo} title={card.title}>
      {card.image ? (
        <Image src={card.image} alt="" width={56} height={56} className={styles.rowLogoImage} />
      ) : (
        <span className={styles.rowLogoGlyph}>{card.title.charAt(0)}</span>
      )}
    </span>
  );
}

function RowText({ card, subtitle }: { card: CardProps; subtitle: string }) {
  return (
    <span className={styles.rowTitleWrap}>
      <span className={styles.rowTitle}>{card.title}</span>
      {card.summary && <span className={styles.rowSummary}>{card.summary}</span>}
      {subtitle && <span className={styles.rowSubtitle}>{subtitle}</span>}
    </span>
  );
}
