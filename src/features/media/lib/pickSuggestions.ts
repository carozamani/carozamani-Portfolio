import type { CardProps } from '@/types/card';

/** How many episodes the "suggested" box under an episode shows. */
export const SUGGESTION_LIMIT = 3;

/**
 * The episodes suggested under `episode`: the ones its admin picked (`recommended`, in that order),
 * or, when none were picked or none of them exist any more, the most recent other episodes, newest
 * first. `all` is ordered oldest to newest, like the rest of the site's content.
 */
export function pickSuggestions(
  episode: CardProps,
  all: CardProps[],
  limit: number = SUGGESTION_LIMIT,
): CardProps[] {
  const others = all.filter((item) => item.type === 'podcast' && item.id !== episode.id);
  const byId = new Map(others.map((item) => [item.id, item]));

  const picked: CardProps[] = [];
  const seen = new Set<string>();
  for (const id of episode.recommended ?? []) {
    const item = byId.get(id);
    if (item && !seen.has(id)) {
      seen.add(id);
      picked.push(item);
    }
  }

  const chosen = picked.length > 0 ? picked : [...others].reverse();
  return chosen.slice(0, limit);
}
