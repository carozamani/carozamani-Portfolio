import { notFound } from 'next/navigation';
import { caseStudies, getCaseStudyBySlug } from '@/data/caseStudies';
import CaseStudyDetail from './CaseStudyDetail';

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyDetail caseStudy={caseStudy} />;
}
