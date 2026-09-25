'use client';

import Card from './Card';
import { usePodcastPlayer } from './PodcastPlayerProvider';
import { localizeCard } from '../lib/localizeCard';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CardProps } from '@/types/card';
import styles from './MediaListPage.module.css';

type Props = { kind: 'podcasts' | 'articles'; cards: CardProps[] };

export default function MediaListPage({ kind, cards }: Props) {
  const dict = useDictionary();
  const { title, description } = dict.media[kind];
  const { activeId, select } = usePodcastPlayer();

  const localized = cards.map((card) => localizeCard(card, dict));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.grid}>
          {localized.map((card) => (
            <Card
              key={card.id}
              {...card}
              active={card.id === activeId}
              onSelect={card.type === 'podcast' ? () => select(card.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
