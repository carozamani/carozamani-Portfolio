import { articleCards } from '@/data/media';
import { paragraphsToDoc } from '@/lib/rich-text/doc';
import type { AdminCard } from '@/types/admin';
import { createEntityStore } from './entityStore';

const seed: AdminCard[] = articleCards.map((card) => ({
  ...card,
  status: 'published',
  content: card.content ?? paragraphsToDoc(card.body ?? []),
}));

const { store, useItems } = createEntityStore<AdminCard>({
  key: 'admin.articles.v1',
  seed,
  getId: (article) => article.id,
});

export const articleStore = store;
export const useArticles = useItems;
