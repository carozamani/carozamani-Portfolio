import { notFound } from 'next/navigation';
import { MEDIA_PREVIEW_LIMIT, articleCards } from '@/data/media';
import MediaListPage from '@/features/media/components/MediaListPage';

export default function Page() {
  if (articleCards.length <= MEDIA_PREVIEW_LIMIT) {
    notFound();
  }

  return <MediaListPage kind="articles" cards={articleCards} />;
}
