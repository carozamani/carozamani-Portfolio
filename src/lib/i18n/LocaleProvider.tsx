'use client';

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { runTransition } from '@/lib/transition/transitionBus';
import { LOCALE_COOKIE, type Locale } from './config';
import type { Dictionary } from './dictionaries';

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;
const FADE_MS = 260;
const SWITCH_TIMEOUT_MS = 4000;
const SWITCHING_CLASS = 'locale-switching';

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();
  const timers = useRef<number[]>([]);

  // The new locale has arrived from the server: fade the page back in.
  useEffect(() => {
    document.documentElement.classList.remove(SWITCHING_CLASS);
  }, [locale]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dict,
      setLocale: (next) => {
        if (next === locale) return;

        const apply = () => {
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
          startTransition(() => router.refresh());
        };

        // The same black screen with the logo that internal links play: the language, direction and
        // font swap happens underneath it and the black clears once the new language has arrived
        if (runTransition(apply)) return;

        // No transition to play (the admin panel): fade the page out first so the swap happens out of sight.
        const root = document.documentElement;
        root.classList.add(SWITCHING_CLASS);
        timers.current.push(
          window.setTimeout(apply, FADE_MS),
          window.setTimeout(() => root.classList.remove(SWITCHING_CLASS), SWITCH_TIMEOUT_MS),
        );
      },
    }),
    [locale, dict, router],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}

export const useDictionary = () => useLocale().dict;

/** Replaces `{key}` placeholders in a dictionary string. */
export const format = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
