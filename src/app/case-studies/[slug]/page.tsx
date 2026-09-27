import { notFound } from 'next/navigation';
import { caseStudies } from '@/data/caseStudies';
import CaseStudyDetail from '@/features/case-studies/components/CaseStudyDetail';

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const index = caseStudies.findIndex((study) => study.slug === slug);
  const caseStudy = index === -1 ? undefined : caseStudies[index];

  if (!caseStudy) {
    notFound();
  }

  const prevStudy = index > 0 ? caseStudies[index - 1] : undefined;
  const nextStudy = index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined;

  return <CaseStudyDetail caseStudy={caseStudy} prevStudy={prevStudy} nextStudy={nextStudy} />;
}
