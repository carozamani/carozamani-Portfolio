// app/layout.tsx یا app/layout.jsx
import { Toaster } from 'sonner'; // ✨ وارد کردن Toaster
import CursorGlow from './components/ui/CursorGlow';
import GlassMenu from './components/ui/GlassMenu';


import "./styles/typography.css";
import "./styles/colors.css";
import "./styles/shadows.css";
import "./styles/shapes.css";

import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" dir="ltr">
      <body className="relative w-full min-h-screen bg-top bg-cover bg-no-repeat">

        {/* Fixed menu at the top */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <GlassMenu />
        </div>

        {/* Full-width content */}
        <main className="relative z-20 w-full h-full">
          <CursorGlow />
          {children}
        </main>

        {/* Sonner Toaster */}
        {/* richColors + position="bottom-right" برای نمایش زیبا در پایین سمت راست */}
        <Toaster richColors position="bottom-right" />

      </body>
    </html>
  );
}
