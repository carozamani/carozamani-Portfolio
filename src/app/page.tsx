import dynamic from 'next/dynamic';
import { HeroModule } from '@/features/hero/components/HeroModule';
import { AboutMeModule } from '@/features/about-me/components/AboutMeModule';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { ContentGate } from '@/components/shared/ContentGate';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';

const CaseStudiesModule = dynamic(() =>
  import('@/features/case-studies/components/CaseStudiesModule').then(
    (mod) => mod.CaseStudiesModule,
  ),
);
const MediaModule = dynamic(() =>
  import('@/features/media/components/MediaModule').then((mod) => mod.MediaModule),
);
const ContactModule = dynamic(() =>
  import('@/features/contact/components/ContactModule').then((mod) => mod.ContactModule),
);
const Footer = dynamic(() => import('@/components/shared/Footer'));

export default async function HomePage() {
  const { about } = dictionaries[await getLocale()];

  return (
    <div className="relative w-full overflow-x-hidden bg-(--color-page-bg) text-white">
      <div className="relative z-10">
        <section id="Home">
          <HeroModule />
        </section>

        {/* Server-rendered for crawlers/AI engines; AboutMeModule below renders this visually client-side. */}
        <p className="sr-only">{about.description}</p>

        <AnimatedSection id="about" fullScreen variant="fade-up" delay={0.1}>
          <AboutMeModule />
        </AnimatedSection>

        <ContentGate section="projects">
          <AnimatedSection id="projects" fullScreen variant="fade-up" delay={0.1}>
            <CaseStudiesModule preview />
          </AnimatedSection>
        </ContentGate>

        <ContentGate section="media">
          <AnimatedSection id="testimonials" fullScreen variant="fade-up" delay={0.1}>
            <MediaModule />
          </AnimatedSection>
        </ContentGate>

        <AnimatedSection id="contact" fullScreen viewAmount={0.4} variant="scale-in">
          <ContactModule />
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  );
}
