import { describe, expect, it } from 'vitest';
import type { CardProps } from '@/types/card';
import { pickSuggestions } from './pickSuggestions';

const episode = (id: string, overrides: Partial<CardProps> = {}): CardProps => ({
  id,
  type: 'podcast',
  title: id,
  summary: '',
  date: '',
  ...overrides,
});

const ids = (cards: CardProps[]) => cards.map((card) => card.id);

// Oldest to newest, like the site's content
const library = [episode('a'), episode('b'), episode('c'), episode('d'), episode('e')];

describe('pickSuggestions', () => {
  it('uses the admin picks, in the admin order', () => {
    const current = episode('a', { recommended: ['d', 'b'] });
    expect(ids(pickSuggestions(current, library))).toEqual(['d', 'b']);
  });

  it('skips unknown ids, the episode itself and duplicates', () => {
    const current = episode('a', { recommended: ['zzz', 'a', 'c', 'c', 'b'] });
    expect(ids(pickSuggestions(current, library))).toEqual(['c', 'b']);
  });

  it('falls back to the newest other episodes when nothing is picked', () => {
    expect(ids(pickSuggestions(episode('a'), library))).toEqual(['e', 'd', 'c']);
    expect(ids(pickSuggestions(episode('e', { recommended: [] }), library))).toEqual([
      'd',
      'c',
      'b',
    ]);
  });

  it('falls back when none of the picked episodes exist any more', () => {
    const current = episode('a', { recommended: ['gone'] });
    expect(ids(pickSuggestions(current, library))).toEqual(['e', 'd', 'c']);
  });

  it('never returns more than the limit', () => {
    const current = episode('a', { recommended: ['b', 'c', 'd', 'e'] });
    expect(ids(pickSuggestions(current, library))).toEqual(['b', 'c', 'd']);
    expect(ids(pickSuggestions(current, library, 2))).toEqual(['b', 'c']);
  });

  it('ignores articles and returns nothing when there is no other episode', () => {
    const mixed = [episode('a'), episode('post', { type: 'article' })];
    expect(pickSuggestions(episode('a'), mixed)).toEqual([]);
  });
});
