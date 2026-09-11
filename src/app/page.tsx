'use client';

import { motion } from 'framer-motion';
import FeatureGrid from "./components/ui/about-me/AboutMe.section";
import HeroSection from "./components/ui/HeroSection/HeroSection";
import MediaSection from "./components/ui/Media/MediaSection.component";

import ContactSection from './components/ui/ContactSection/ContactSection';
import QuantumCarousel from './components/ui/case-studies/quantum-carousel/QuantumCarousel.component';
import Footer from './components/ui/Footer/Footer';

export default function HomePage() {
  const sectionAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const transition = { duration: 0.7, ease: 'easeOut' as const };

  return (
    <div className="relative w-screen text-white overflow-x-hidden bg-black">
      <div className="relative z-10">

        {/* Hero Section */}
        <motion.section
          id="Home"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={sectionAnimation}
          transition={transition}
        >
          <HeroSection />
        </motion.section>

        {/* FeatureGrid */}
        <motion.section
          id="about"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={sectionAnimation}
          transition={transition}
        >
          <FeatureGrid />
        </motion.section>

        {/* Case Studies Carousel */}
        <motion.section
          id="projects"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={sectionAnimation}
          transition={transition}
        >
          <QuantumCarousel />
        </motion.section>

        {/* Media Section */}
        <motion.section
          id="testimonials"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={sectionAnimation}
          transition={transition}
        >
          <MediaSection />
        </motion.section>

        {/* Contact Section */}
        <motion.section
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }} // مقدار کمی بزرگتر برای تشخیص بهتر
          variants={sectionAnimation}
          transition={transition}
        >
          <ContactSection />
        </motion.section>

        <Footer />

      </div>
    </div>
  );
}
