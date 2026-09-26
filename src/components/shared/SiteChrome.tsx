'use client';

import { usePathname } from 'next/navigation';
import GlassMenu from '@/components/shared/GlassMenu';

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
        <GlassMenu />
      </div>
    </>
  );
}
