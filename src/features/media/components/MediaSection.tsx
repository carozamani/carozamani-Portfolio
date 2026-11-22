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
  isPlaying: boolean;
  onPlay: (id: string) => void;
  depth: 'swing-start' | 'swing-end';
}

function CardsList({ cards, activeId, isPlaying, onPlay, depth }: CardsListProps) {
  return (
    <div className={styles.cards} data-depth={depth}>
      {cards.map((card) => {
        const href =
          card.href ??
          (card.type === 'podcast'
            ? `/podcasts/${card.id}`
            : card.type === 'article'
              ? `/articles/${card.id}`
              : undefined);
        const isActive = card.type === 'podcast' && card.id === activeId;

        return (
          <Card
            key={card.id}
            {...card}
            href={href}
            active={isActive}
            playing={isActive && isPlaying}
            onPlay={card.type === 'podcast' ? () => onPlay(card.id) : undefined}
          />
        );
      })}
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
  const { activeId, isPlaying, select, toggle } = usePodcastPlayer();

  const list = (
    <CardsList
      cards={cards}
      activeId={type === 'podcast' ? activeId : null}
      isPlaying={isPlaying}
      onPlay={(id) => {
        if (id === activeId) toggle();
        else select(id);
      }}
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
