import { notFound } from 'next/navigation';
import { articleCards, getArticleBySlug } from '@/data/media';
import ArticleDetail from '@/features/media/components/ArticleDetail';
import { localizeCard } from '@/features/media/lib/localizeCard';
import { getDictionary } from '@/lib/i18n/server';

export function generateStaticParams() {
  return articleCards.map((article) => ({ slug: article.id }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetail article={localizeCard(article, await getDictionary())} />;
}
