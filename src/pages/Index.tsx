// homepage should remain public; don't auto-redirect authenticated users here
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import Features from '@/components/Features';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();

  // Keep the public homepage accessible. Post-login redirects are handled on the Auth page.

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <ServicesSection />
        <Features />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
