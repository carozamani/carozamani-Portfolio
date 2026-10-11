'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import GlassMenu from '@/components/shared/GlassMenu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const position = pathname === '/' ? 'fixed' : 'absolute';

  return (
    <>
      <div
        className={clsx('pointer-events-none inset-x-0 top-2 z-50 flex justify-center', position)}
      >
        <GlassMenu />
      </div>
      {/* sticky, not fixed: a zero-height strip pinned to the top of the page for its full length */}
      <div className="sticky top-0 z-50 hidden h-0 sm:block">
        <div className="absolute top-[1.875rem] right-6">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
