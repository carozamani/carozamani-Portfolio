import { notFound } from 'next/navigation';
import { PROJECTS_PREVIEW_LIMIT, caseStudies } from '@/data/caseStudies';
import { CaseStudiesModule } from '@/features/case-studies/components/CaseStudiesModule';

export default function CaseStudiesPage() {
  if (caseStudies.length <= PROJECTS_PREVIEW_LIMIT) {
    notFound();
  }

  return <CaseStudiesModule />;
}
