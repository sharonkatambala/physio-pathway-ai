import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Clock, Users } from 'lucide-react';
import heroImage from '@/assets/hero-physiotherapy.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional physiotherapy session" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">
              {t('hero.tagline')}
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Ergo<span className="text-blue-500">Care</span><span className="text-green-500 text-5xl sm:text-6xl lg:text-7xl">+</span>
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  {t('hero.title')}
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-hero shadow-glow text-lg h-14 px-8">
                {t('hero.startAssessment')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-card">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-success" />
                <span className="text-sm font-medium">{t('hero.hipaaCompliant')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{t('hero.available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-secondary" />
                <span className="text-sm font-medium">{t('hero.patients')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;