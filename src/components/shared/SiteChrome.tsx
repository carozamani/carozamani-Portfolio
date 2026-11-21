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

  // On every page, home included, the menu is fixed to the viewport and stays put while scrolling;
  // the logotype and language switcher are absolutely positioned, so they scroll away with the page.
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 flex justify-center">
        <GlassMenu />
      </div>
      {/* Phones: sits exactly where the menu bar reserves room for it, on the end edge */}
      <div className="pointer-events-auto absolute end-1.5 top-[1.625rem] z-50 min-[520px]:end-3 min-[520px]:top-[1.875rem] sm:hidden">
        <LanguageSwitcher />
      </div>
      {/* From sm up the logotype and the switcher sit in a box capped at 96rem, so
          on wide screens they stay with the page instead of sticking to the window edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 mx-auto hidden max-w-[96rem] sm:block">
        {/* The logotype holds the left side from md up, where the menu pill leaves it room */}
        <div className="pointer-events-auto absolute top-[1.75rem] left-8 hidden md:block lg:left-14">
          <Link
            href="/"
            dir="ltr"
            aria-label={dict.hero.logoAlt}
            className="block rounded-lg drop-shadow-[0_0_0.625rem_hsla(0,0%,0%,0.5)] transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-primary)"
          >
            {/* The same logotype as the hero (dim "caro", shadow), at half the size: ~148px wide at 1.625rem. */}
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
