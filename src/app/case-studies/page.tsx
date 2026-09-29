import { notFound } from 'next/navigation';
import { getCaseStudies } from '@/lib/api';
import { PROJECTS_PREVIEW_LIMIT } from '@/data/caseStudies';
import { CaseStudiesModule } from '@/features/case-studies/components/CaseStudiesModule';

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  if (caseStudies.length <= PROJECTS_PREVIEW_LIMIT) {
    notFound();
  }

  return <CaseStudiesModule />;
}
