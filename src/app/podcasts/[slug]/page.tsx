import { notFound } from 'next/navigation';
import { getMediaBySlug } from '@/lib/api';
import { getSiteContent } from '@/lib/content';
import { PodcastDetail } from '@/features/media/components/PodcastDetail';
import { localizeCard } from '@/features/media/lib/localizeCard';
import { getDictionary } from '@/lib/i18n/server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PodcastPage({ params }: PageProps) {
  const { slug } = await params;
  const fromApi = await getMediaBySlug(slug);
  const episode =
    fromApi?.type === 'podcast'
      ? fromApi
      : ((await getSiteContent()).podcasts.find((item) => item.id === slug) ?? null);

  if (!episode || episode.type !== 'podcast') {
    notFound();
  }

  return <PodcastDetail episode={localizeCard(episode, await getDictionary())} />;
}
