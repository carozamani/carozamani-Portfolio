'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlassMenu from '@/components/shared/GlassMenu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

export function SiteChrome() {
  const pathname = usePathname();
  const dict = useDictionary();
  if (pathname.startsWith('/admin')) return null;

  // Compact menu (logo inside pill) covers mobile + tablet.
  // From lg up: centered nav + page-box wordmark + language switcher.
  return (
    <>
      <div
        data-site-chrome
        className="pointer-events-none fixed inset-x-0 top-2 z-50 flex justify-center"
      >
        <GlassMenu />
      </div>
      <div
        data-site-chrome
        className="pointer-events-none absolute inset-x-0 top-0 z-50 mx-auto hidden max-w-[96rem] lg:block"
      >
        <div className="pointer-events-auto absolute top-[1.75rem] left-8 lg:left-14">
          <Link
            href="/"
            dir="ltr"
            aria-label={dict.hero.logoAlt}
            className="block rounded-lg drop-shadow-[0_0_0.625rem_hsla(0,0%,0%,0.5)] transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-primary)"
          >
            <Wordmark className="text-[1.625rem]" />
          </Link>
        </div>
        <div className="pointer-events-auto absolute top-[1.875rem] right-8 lg:right-14">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
