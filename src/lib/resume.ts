import type { Locale } from './i18n/config';

/** Static resume files served from public/; one per locale so the download button matches the site language. */
export const RESUME_HREFS: Record<Locale, string> = {
  en: '/resume-en.pdf',
  fa: '/resume-fa.pdf',
};

export function getResumeHref(locale: Locale): string {
  return RESUME_HREFS[locale];
}
