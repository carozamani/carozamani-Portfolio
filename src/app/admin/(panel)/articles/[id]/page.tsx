import { ArticleEditorPage } from '@/features/admin/components/ArticleEditorPage';

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ArticleEditorPage id={id} />;
}
