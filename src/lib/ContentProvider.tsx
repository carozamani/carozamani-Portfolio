'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { CaseStudy } from '@/types/caseStudy';
import type { CardProps } from '@/types/card';
import { RESUME_HREFS } from '@/lib/resume';

export interface SiteContent {
  caseStudies: CaseStudy[];
  podcasts: CardProps[];
  articles: CardProps[];
  resumes: { en: string; fa: string };
}

const ContentContext = createContext<SiteContent>({
  caseStudies: [],
  podcasts: [],
  articles: [],
  resumes: { ...RESUME_HREFS },
});

export function ContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

export type ContentSection = 'projects' | 'media';

export function useHasSection(section: ContentSection) {
  const { caseStudies, podcasts, articles } = useContent();
  return section === 'projects' ? caseStudies.length > 0 : podcasts.length + articles.length > 0;
}
