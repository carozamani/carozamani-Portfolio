import { caseStudiesApi } from './adminApi';
import { createRemoteCollection } from './remoteCollection';

const { store, useCollection } = createRemoteCollection({
  getId: (study) => study.slug,
  source: caseStudiesApi,
});

export const caseStudyStore = store;
export const useCaseStudies = useCollection;
