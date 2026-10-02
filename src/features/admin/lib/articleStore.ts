import { mediaApi } from './adminApi';
import { createRemoteCollection } from './remoteCollection';

const { store, useCollection } = createRemoteCollection({
  getId: (article) => article.id,
  source: mediaApi('article'),
});

export const articleStore = store;
export const useArticles = useCollection;
