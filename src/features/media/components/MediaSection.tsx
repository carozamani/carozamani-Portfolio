'use client';

import Card from './Card';
import { usePodcastPlayer } from './PodcastPlayerProvider';
import type { CardProps } from '@/types/card';
import styles from './MediaSection.module.css';

interface SectionProps {
  type: 'podcast' | 'article';
  layoutDirection: 'cardsLeft' | 'cardsRight';
  content: React.ReactNode;
  cards: CardProps[];
}

interface CardsListProps {
  cards: CardProps[];
  activeId: string | null;
  onSelect: (id: string) => void;
  depth: 'swing-start' | 'swing-end';
}

function CardsList({ cards, activeId, onSelect, depth }: CardsListProps) {
  return (
    <div className={styles.cards} data-depth={depth}>
      {cards.map((card) => (
        <Card
          key={card.id}
          {...card}
          active={card.id === activeId}
          onSelect={card.type === 'podcast' ? () => onSelect(card.id) : undefined}
        />
      ))}
    </div>
  );
}

function ContentBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.content} data-depth="rise">
      {children}
    </div>
  );
}

export default function Section({ type, layoutDirection, content, cards }: SectionProps) {
  const isCardsRight = layoutDirection === 'cardsRight';
  const { activeId, select } = usePodcastPlayer();

  const list = (
    <CardsList
      cards={cards}
      activeId={type === 'podcast' ? activeId : null}
      onSelect={select}
      depth={isCardsRight ? 'swing-end' : 'swing-start'}
    />
  );

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {isCardsRight ? (
          <>
            <ContentBlock>{content}</ContentBlock>
            {list}
          </>
        ) : (
          <>
            {list}
            <ContentBlock>{content}</ContentBlock>
          </>
        )}
      </div>
    </section>
  );
}
