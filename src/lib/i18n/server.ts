import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from './config';
import { dictionaries } from './dictionaries';

function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;

  const preferred = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = Number(params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1);
      return { primary: tag.trim().toLowerCase().split('-')[0], q };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);

  return preferred.map(({ primary }) => primary).find(isLocale);
}

/** A saved choice wins; otherwise follow the browser's language, then the default. */
export async function getLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  return fromAcceptLanguage((await headers()).get('accept-language')) ?? defaultLocale;
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
