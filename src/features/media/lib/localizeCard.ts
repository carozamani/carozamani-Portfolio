import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { CardProps } from '@/types/card';

export function localizeCard(card: CardProps, dict: Dictionary): CardProps {
  const text = dict.media.items[card.id];
  return text ? { ...card, ...text } : card;
}
