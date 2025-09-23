import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import Features from '@/components/Features';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <ServicesSection />
        <Features />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
