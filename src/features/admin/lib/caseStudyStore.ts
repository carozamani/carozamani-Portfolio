import { caseStudies } from '@/data/caseStudies';
import type { AdminCaseStudy } from '@/types/admin';
import { createEntityStore } from './entityStore';

const seed: AdminCaseStudy[] = caseStudies.map((study) => ({ ...study, status: 'published' }));

const { store, useItems } = createEntityStore<AdminCaseStudy>({
  key: 'admin.case-studies.v1',
  seed,
  getId: (study) => study.slug,
});

export const caseStudyStore = store;
export const useCaseStudies = useItems;
