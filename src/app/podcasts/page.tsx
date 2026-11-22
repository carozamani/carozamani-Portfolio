import { notFound } from 'next/navigation';
import { MEDIA_PREVIEW_LIMIT } from '@/data/media';
import MediaListPage from '@/features/media/components/MediaListPage';
import { getSiteContent } from '@/lib/content';

export default async function Page() {
  const { podcasts } = await getSiteContent();

  if (podcasts.length <= MEDIA_PREVIEW_LIMIT) {
    notFound();
  }

  return <MediaListPage kind="podcasts" cards={podcasts} />;
}
