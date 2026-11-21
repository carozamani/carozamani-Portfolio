import { mediaApi } from './adminApi';
import { createRemoteCollection } from './remoteCollection';

const { store, useCollection } = createRemoteCollection({
  getId: (podcast) => podcast.id,
  source: mediaApi('podcast'),
});

export const podcastStore = store;
export const usePodcasts = useCollection;
