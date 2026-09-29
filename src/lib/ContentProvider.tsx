'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CaseStudy } from '@/types/caseStudy';
import type { CardProps } from '@/types/card';
import { getCaseStudies, getMedia } from '@/lib/api';

interface ContentState {
  loaded: boolean;
  caseStudies: CaseStudy[];
  podcasts: CardProps[];
  articles: CardProps[];
}

const EMPTY: ContentState = { loaded: false, caseStudies: [], podcasts: [], articles: [] };

const ContentContext = createContext<ContentState>(EMPTY);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCaseStudies().catch(() => []),
      getMedia('podcast').catch(() => []),
      getMedia('article').catch(() => []),
    ]).then(([caseStudies, podcasts, articles]) => {
      if (!cancelled) setState({ loaded: true, caseStudies, podcasts, articles });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

export type ContentSection = 'projects' | 'media';

export function useHasSection(section: ContentSection) {
  const { loaded, caseStudies, podcasts, articles } = useContent();
  if (!loaded) return false;
  return section === 'projects' ? caseStudies.length > 0 : podcasts.length + articles.length > 0;
}
