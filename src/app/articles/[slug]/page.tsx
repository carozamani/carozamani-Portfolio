import { notFound } from 'next/navigation';
import { getMediaBySlug } from '@/lib/api';
import { getSiteContent } from '@/lib/content';
import ArticleDetail from '@/features/media/components/ArticleDetail';
import { localizeCard } from '@/features/media/lib/localizeCard';
import { getDictionary } from '@/lib/i18n/server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const fromApi = await getMediaBySlug(slug);
  const article =
    fromApi?.type === 'article'
      ? fromApi
      : ((await getSiteContent()).articles.find((item) => item.id === slug) ?? null);

  if (!article || article.type !== 'article') {
    notFound();
  }

  return <ArticleDetail article={localizeCard(article, await getDictionary())} />;
}
