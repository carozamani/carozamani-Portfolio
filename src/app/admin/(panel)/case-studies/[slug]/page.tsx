import { CaseStudyEditorPage } from '@/features/admin/components/CaseStudyEditorPage';

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <CaseStudyEditorPage slug={slug} />;
}
