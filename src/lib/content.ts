import type { SiteContent } from '@/lib/ContentProvider';
import { getCaseStudies, getMedia } from '@/lib/api';

/** A backend outage hides the sections instead of failing the whole page. */
export async function getSiteContent(): Promise<SiteContent> {
  const [caseStudies, podcasts, articles] = await Promise.all([
    getCaseStudies().catch(() => []),
    getMedia('podcast').catch(() => []),
    getMedia('article').catch(() => []),
  ]);

  return { caseStudies, podcasts, articles };
}
