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
      <div className={clsx('top-[1.875rem] right-6 z-50 hidden sm:block', position)}>
        <LanguageSwitcher />
      </div>
    </>
  );
}
