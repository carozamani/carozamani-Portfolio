import type { SiteContent } from '@/lib/ContentProvider';
import { getCaseStudies, getMedia, getPublicSettings } from '@/lib/api';
import { RESUME_HREFS } from '@/lib/resume';

// On globalThis so a dev hot reload of this module doesn't throw the last good answers away
const store = globalThis as typeof globalThis & { siteContentLastGood?: Partial<SiteContent> };
const lastGood = (store.siteContentLastGood ??= {});

/**
 * One backend call. When it fails, the last answer the backend gave stands in for it: a failed request
 * says nothing about whether the section is empty, so it must not make the menu entry disappear.
 * Only a source that has never answered falls back to `empty`.
 */
async function fromBackend<K extends keyof SiteContent>(
  key: K,
  load: () => Promise<SiteContent[K]>,
  empty: SiteContent[K],
): Promise<SiteContent[K]> {
  try {
    const value = await load();
    lastGood[key] = value;
    return value;
  } catch {
    return lastGood[key] ?? empty;
  }
}

/** A backend outage hides the sections instead of failing the whole page. */
export async function getSiteContent(): Promise<SiteContent> {
  const [caseStudies, podcasts, articles, resumes] = await Promise.all([
    fromBackend('caseStudies', getCaseStudies, []),
    fromBackend('podcasts', () => getMedia('podcast'), []),
    fromBackend('articles', () => getMedia('article'), []),
    fromBackend('resumes', () => getPublicSettings().then((settings) => settings.resumes), {
      ...RESUME_HREFS,
    }),
  ]);

  return { caseStudies, podcasts, articles, resumes };
}
