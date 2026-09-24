import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import GlassMenu from '@/components/shared/GlassMenu';
import { ScrollbarReveal } from '@/components/shared/ScrollbarReveal';

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

const siteTitle = 'Caro Zamani — UX & Product Designer';
const siteDescription =
  'Portfolio of Caro Zamani, a UX/Product Designer crafting seamless, user-centered digital experiences.';

export const viewport: Viewport = {
  themeColor: '#000814',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" dir="ltr" className={`${brandFont.variable} ${inter.variable}`}>
      <body className="relative min-h-screen w-full bg-cover bg-top bg-no-repeat">
        <a href="#main-content" className="skipLink">
          Skip to main content
        </a>

        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
          <GlassMenu />
        </div>
        <ScrollbarReveal />

        <main id="main-content" className="relative z-20 h-full w-full">
          {children}
        </main>

        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
