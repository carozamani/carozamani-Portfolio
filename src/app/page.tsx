import { HeroModule } from '@/features/hero/components/HeroModule';
import { AboutMeModule } from '@/features/about-me/components/AboutMeModule';
import { CaseStudiesModule } from '@/features/case-studies/components/CaseStudiesModule';
import { MediaModule } from '@/features/media/components/MediaModule';
import { ContactModule } from '@/features/contact/components/ContactModule';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import Footer from '@/components/shared/Footer';

export default function HomePage() {
  return (
    <div className="relative w-screen text-white overflow-x-hidden bg-black">
      <div className="relative z-10">
        <AnimatedSection id="Home">
          <HeroModule />
        </AnimatedSection>

        <AnimatedSection id="about">
          <AboutMeModule />
        </AnimatedSection>

        <AnimatedSection id="projects">
          <CaseStudiesModule />
        </AnimatedSection>

        <AnimatedSection id="testimonials">
          <MediaModule />
        </AnimatedSection>

        <AnimatedSection id="contact" viewAmount={0.4}>
          <ContactModule />
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  );
}
