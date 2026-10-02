'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { locales, type Locale } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import styles from './LanguageSwitcher.module.css';

const OPTIONS: Record<Locale, { code: string }> = {
  en: { code: 'EN' },
  fa: { code: 'FA' },
};

export function LanguageSwitcher() {
  const { locale, dict, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setOpen(false);
    setLocale(next);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.panel} data-open={open}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={dict.language.label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={styles.trigger}
          dir="ltr"
        >
          <span className={styles.code}>{OPTIONS[locale].code}</span>
        </button>

        <ul
          id={listId}
          role="listbox"
          aria-label={dict.language.label}
          hidden={!open}
          className={styles.menu}
        >
          {locales
            .filter((code) => code !== locale)
            .map((code) => (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-label={OPTIONS[code].code}
                  aria-selected={code === locale}
                  onClick={() => choose(code)}
                  className={styles.option}
                  dir="ltr"
                >
                  <span className={styles.optionCode}>{OPTIONS[code].code}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
