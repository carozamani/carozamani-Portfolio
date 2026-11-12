import type { SiteContent } from '@/lib/ContentProvider';
import { getCaseStudies, getMedia, getPublicSettings } from '@/lib/api';
import { RESUME_HREFS } from '@/lib/resume';

/** A backend outage hides the sections instead of failing the whole page. */
export async function getSiteContent(): Promise<SiteContent> {
  const [caseStudies, podcasts, articles, settings] = await Promise.all([
    getCaseStudies().catch(() => []),
    getMedia('podcast').catch(() => []),
    getMedia('article').catch(() => []),
    getPublicSettings().catch(() => ({ resumes: { ...RESUME_HREFS } })),
  ]);

  return { caseStudies, podcasts, articles, resumes: settings.resumes };
}
