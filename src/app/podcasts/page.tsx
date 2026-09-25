import { notFound } from 'next/navigation';
import { MEDIA_PREVIEW_LIMIT, podcastCards } from '@/data/media';
import MediaListPage from '@/features/media/components/MediaListPage';

export default function Page() {
  if (podcastCards.length <= MEDIA_PREVIEW_LIMIT) {
    notFound();
  }

  return <MediaListPage kind="podcasts" cards={podcastCards} />;
}
