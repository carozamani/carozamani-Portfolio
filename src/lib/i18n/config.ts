export const locales = ['en', 'fa'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE = 'locale';

export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fa: 'rtl',
};

export const isLocale = (value: string | undefined): value is Locale =>
  locales.some((locale) => locale === value);
