import type { CaseStudy } from '@/types/caseStudy';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'project-one',
    title: 'Project One',
    image: '',
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    image: '',
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    image: '',
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}
