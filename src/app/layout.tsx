import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Vazirmatn } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { SiteChrome } from '@/components/shared/SiteChrome';
import { PodcastPlayerProvider } from '@/features/media/components/PodcastPlayerProvider';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { localeDirection } from '@/lib/i18n/config';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';

import '@/styles/colors.css';
import '@/styles/typography.css';
import '@/styles/spacing.css';
import '@/styles/shadows.css';
import '@/styles/shapes.css';
import '@/styles/motion.css';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const brandFont = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-brand',
});

const persianFont = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

const wordmarkFont = localFont({
  src: '../assets/fonts/abeatbykai.otf',
  display: 'swap',
  variable: '--font-wordmark',
});

export const viewport: Viewport = {
  themeColor: '#000814',
};

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = dictionaries[await getLocale()];

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description, type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${brandFont.variable} ${inter.variable} ${persianFont.variable} ${wordmarkFont.variable}`}
    >
      <body className="relative min-h-screen w-full bg-cover bg-top bg-no-repeat">
        <LocaleProvider locale={locale} dict={dict}>
          <PodcastPlayerProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border-2 focus:border-(--color-brand-primary) focus:bg-(--color-surface-canvas) focus:px-5 focus:py-3 focus:text-(--color-text-primary)"
            >
              {dict.skipLink}
            </a>

            <SiteChrome />

            <main id="main-content" className="relative z-20 h-full w-full">
              {children}
            </main>

            <Toaster richColors position="bottom-right" />
          </PodcastPlayerProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
