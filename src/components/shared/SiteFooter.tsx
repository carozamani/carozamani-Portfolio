'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/shared/Footer';
import { HorizonFooter } from '@/features/hero/components/HorizonFooter';

// Lives in the root layout so every page that shows the site header also shows the footer.
// The admin panel has its own shell (SiteChrome hides the header there too), so it is skipped.
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="relative z-20 w-full overflow-x-clip text-white">
      <HorizonFooter>
        <Footer />
      </HorizonFooter>
    </div>
  );
}
