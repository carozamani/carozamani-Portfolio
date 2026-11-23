import { notFound } from 'next/navigation';
import { getMediaBySlug } from '@/lib/api';
import { getSiteContent } from '@/lib/content';
import { PodcastDetail } from '@/features/media/components/PodcastDetail';
import { localizeCard } from '@/features/media/lib/localizeCard';
import { pickSuggestions } from '@/features/media/lib/pickSuggestions';
import { getDictionary } from '@/lib/i18n/server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PodcastPage({ params }: PageProps) {
  const { slug } = await params;
  const [fromApi, content] = await Promise.all([getMediaBySlug(slug), getSiteContent()]);
  const episode =
    fromApi?.type === 'podcast'
      ? fromApi
      : (content.podcasts.find((item) => item.id === slug) ?? null);

  if (!episode || episode.type !== 'podcast') {
    notFound();
  }

  const dict = await getDictionary();
  const suggestions = pickSuggestions(episode, content.podcasts).map((item) =>
    localizeCard(item, dict),
  );

  return <PodcastDetail episode={localizeCard(episode, dict)} suggestions={suggestions} />;
}
