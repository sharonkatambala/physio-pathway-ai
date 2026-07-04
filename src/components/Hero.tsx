import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-physiotherapy.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional physiotherapy session"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/65" />
      </div>

      <div className="relative z-10 pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="page-shell">
          <div className="max-w-2xl space-y-5">
            <Badge variant="secondary" className="w-fit">
              {t('hero.tagline')}
            </Badge>

            <div className="space-y-3">
              <h1 className="font-display font-bold text-foreground leading-[1.1]">
                <span className="gradient-text text-5xl sm:text-[3.25rem] italic">ErgoCare+</span>
                <span className="block text-[2.25rem] sm:text-[2.75rem] lg:text-5xl not-italic">{t('hero.title')}</span>
              </h1>
              <p className="text-[17px] sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <Button asChild size="lg" className="bg-gradient-hero shadow-glow text-[15px] font-semibold h-11 px-7 rounded-xl">
              <Link to="/auth">
                {t('hero.startAssessment')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-muted-foreground bg-card/85 backdrop-blur-sm border border-border/70 rounded-xl px-3.5 py-2 shadow-xs">
                <Shield className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-base font-medium">{t('hero.hipaaCompliant')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-card/85 backdrop-blur-sm border border-border/70 rounded-xl px-3.5 py-2 shadow-xs">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-base font-medium">{t('hero.available')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-card/85 backdrop-blur-sm border border-border/70 rounded-xl px-3.5 py-2 shadow-xs">
                <Users className="h-4 w-4 text-secondary flex-shrink-0" />
                <span className="text-base font-medium">{t('hero.patients')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
