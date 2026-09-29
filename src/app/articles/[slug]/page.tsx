import { notFound } from 'next/navigation';
import { getMediaBySlug } from '@/lib/api';
import ArticleDetail from '@/features/media/components/ArticleDetail';
import { localizeCard } from '@/features/media/lib/localizeCard';
import { getDictionary } from '@/lib/i18n/server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getMediaBySlug(slug);

  if (!article || article.type !== 'article') {
    notFound();
  }

  return <ArticleDetail article={localizeCard(article, await getDictionary())} />;
}
