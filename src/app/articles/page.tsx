import { notFound } from 'next/navigation';
import { getMedia } from '@/lib/api';
import { MEDIA_PREVIEW_LIMIT } from '@/data/media';
import MediaListPage from '@/features/media/components/MediaListPage';

export default async function Page() {
  const articleCards = await getMedia('article');

  if (articleCards.length <= MEDIA_PREVIEW_LIMIT) {
    notFound();
  }

  return <MediaListPage kind="articles" cards={articleCards} />;
}
