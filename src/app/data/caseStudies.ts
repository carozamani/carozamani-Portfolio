export type CaseStudy = {
  slug: string;
  title: string;
  /** مسیر عکس کیس‌استادی که تو فیگما طراحی می‌کنی، داخل public/case-studies بذار و آدرسش رو اینجا بده. مثال: '/case-studies/project-one.jpg' */
  image: string;
};

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
