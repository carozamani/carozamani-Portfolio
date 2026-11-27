import dynamic from 'next/dynamic';
import { HeroModule } from '@/features/hero/components/HeroModule';
import { AboutMeModule } from '@/features/about-me/components/AboutMeModule';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { BackToTop } from '@/components/shared/BackToTop';
import { ContentGate } from '@/components/shared/ContentGate';
import { ScrollHold } from '@/components/shared/ScrollHold';
import { testimonials } from '@/data/testimonials';
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
const TestimonialsModule = dynamic(() =>
  import('@/features/testimonials/components/TestimonialsModule').then(
    (mod) => mod.TestimonialsModule,
  ),
);
const ContactModule = dynamic(() =>
  import('@/features/contact/components/ContactModule').then((mod) => mod.ContactModule),
);

export default async function HomePage() {
  const dict = dictionaries[await getLocale()];

  return (
    <div className="relative w-full overflow-x-clip text-white">
      <div className="relative z-10">
        <section id="Home">
          <HeroModule />
        </section>

        {/* Server-rendered for crawlers/AI engines; AboutMeModule below renders this visually client-side. */}
        <p className="sr-only">{dict.about.description}</p>

        {/* Held in place like the sections below it. It reveals on first contact (viewAmount 0): while pinned it
            is always fully in view, so no fraction of it has to be visible before it appears. */}
        <ScrollHold>
          <AnimatedSection
            id="about"
            fullScreen
            viewAmount={0}
            variant="fade-up"
            delay={0.1}
            depth={false}
          >
            <AboutMeModule />
          </AnimatedSection>
        </ScrollHold>

        <ContentGate section="projects">
          <ScrollHold>
            <AnimatedSection id="projects" fullScreen variant="fade-up" delay={0.1} depth="sink">
              <CaseStudiesModule preview />
            </AnimatedSection>
          </ScrollHold>
        </ContentGate>

        <ContentGate section="media">
          <ScrollHold>
            <AnimatedSection
              id="testimonials"
              fullScreen
              variant="fade-up"
              delay={0.1}
              depth="sink"
            >
              <MediaModule />
            </AnimatedSection>
          </ScrollHold>
        </ContentGate>

        {/* Held in place and sized like the sections around it. Skipped when there are no recommendations:
            TestimonialsModule renders nothing then, and an empty held screen would be dead scroll. */}
        {testimonials.length > 0 && (
          <ScrollHold>
            <AnimatedSection
              id="recommendations"
              fullScreen
              variant="fade-up"
              delay={0.1}
              depth={false}
            >
              <TestimonialsModule />
            </AnimatedSection>
          </ScrollHold>
        )}

        <ScrollHold>
          <AnimatedSection
            id="contact"
            fullScreen
            viewAmount={0.4}
            variant="scale-in"
            depth="unfold"
          >
            <ContactModule />
          </AnimatedSection>
        </ScrollHold>
      </div>

      <BackToTop label={dict.backToTop} />
    </div>
  );
}
