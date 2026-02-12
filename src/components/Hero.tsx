import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Clock, Users } from 'lucide-react';
import heroImage from '@/assets/hero-physiotherapy.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional physiotherapy session" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/65"></div>
      </div>

      <div className="relative z-10 section-pad pt-28 sm:pt-32">
        <div className="page-shell">
          <div className="max-w-2xl space-y-8">
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
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-hero shadow-glow text-lg h-14 px-8">
                {t('hero.startAssessment')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-sm">{t('hero.hipaaCompliant')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm">{t('hero.available')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-secondary" />
                <span className="text-sm">{t('hero.patients')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
