'use client';

import { PlayerProvider } from '../hooks/usePlayer';
import Card from './Card';
import type { CardProps } from '@/types/card';
import styles from './MediaSection.module.css';

interface SectionProps {
  type: 'podcast' | 'article';
  layoutDirection: 'cardsLeft' | 'cardsRight';
  content: React.ReactNode;
  cards: CardProps[];
}

function CardsList({ cards }: { cards: CardProps[] }) {
  return (
    <div className={styles.cards}>
      {cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  );
}

function ContentBlock({ children }: { children: React.ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

export default function Section({ layoutDirection, content, cards }: SectionProps) {
  const isCardsRight = layoutDirection === 'cardsRight';

  return (
    <section className={styles.section}>
      <PlayerProvider>
        <div className={styles.grid}>
          {isCardsRight ? (
            <>
              <ContentBlock>{content}</ContentBlock>
              <CardsList cards={cards} />
            </>
          ) : (
            <>
              <CardsList cards={cards} />
              <ContentBlock>{content}</ContentBlock>
            </>
          )}
        </div>
      </PlayerProvider>
    </section>
  );
}
