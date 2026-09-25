import dynamic from 'next/dynamic';
import { HeroModule } from '@/features/hero/components/HeroModule';
import { AboutMeModule } from '@/features/about-me/components/AboutMeModule';
import { AnimatedSection } from '@/components/shared/AnimatedSection';

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

export default function HomePage() {
  return (
    <div className="relative w-screen overflow-x-hidden bg-(--color-page-bg) text-white">
      <div className="relative z-10">
        <AnimatedSection id="Home" variant="fade-up">
          <HeroModule />
        </AnimatedSection>

        <AnimatedSection id="about" variant="fade-up" delay={0.1}>
          <AboutMeModule />
        </AnimatedSection>

        <AnimatedSection id="projects" variant="fade-up" delay={0.1}>
          <CaseStudiesModule preview />
        </AnimatedSection>

        <AnimatedSection id="testimonials" variant="fade-up" delay={0.1}>
          <MediaModule />
        </AnimatedSection>

        <AnimatedSection id="contact" viewAmount={0.4} variant="scale-in">
          <ContactModule />
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  );
}
