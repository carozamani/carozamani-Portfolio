'use client';

import { PlayerProvider } from '../hooks/usePlayer';
import Card from './Card';
import type { CardProps } from '@/types/card';
import TypographyComponent from '@/components/ui/Typography';
import styles from './MediaListPage.module.css';

export default function MediaListPage({
  title,
  description,
  cards,
}: {
  title: string;
  description: string;
  cards: CardProps[];
}) {
  return (
    <div className={styles.page}>
      <div className={styles.pageBackground} aria-hidden="true" />

      <div className={styles.content}>
        <TypographyComponent variant="h1" color="text-primary">
          {title}
        </TypographyComponent>
        <TypographyComponent
          variant="body1"
          color="text-secondary"
          className={styles.description}
        >
          {description}
        </TypographyComponent>

        <PlayerProvider>
          <div className={styles.grid}>
            {cards.map((card) => (
              <Card key={card.id} {...card} />
            ))}
          </div>
        </PlayerProvider>
      </div>
    </div>
  );
}