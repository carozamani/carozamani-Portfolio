'use client';

import { MediaEditorialList } from './MediaEditorialList';
import { localizeCard } from '../lib/localizeCard';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CardProps } from '@/types/card';
import styles from './MediaListPage.module.css';

type Props = { kind: 'podcasts' | 'articles'; cards: CardProps[] };

export default function MediaListPage({ kind, cards }: Props) {
  const dict = useDictionary();
  const { title, description } = dict.media[kind];
  const localized = cards.map((card) => localizeCard(card, dict));

  return (
    <div className={styles.page}>
      <div className={styles.contentWide}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <MediaEditorialList kind={kind} cards={localized} />
      </div>
    </div>
  );
}
