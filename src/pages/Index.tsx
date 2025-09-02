import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import AssessmentFlow from '@/components/AssessmentFlow';
import Disclaimer from '@/components/Disclaimer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <AssessmentFlow />
        <Disclaimer />
      </main>
    </div>
  );
};

export default Index;
