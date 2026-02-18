import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Shield, Clock, Users, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-physiotherapy.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';

const Hero = () => {
  const { t, language } = useLanguage();
  
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
              <Button asChild size="lg" className="bg-gradient-hero shadow-glow text-lg h-14 px-8">
                <Link to="/auth">
                  {t('hero.startAssessment')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
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

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="group absolute bottom-16 right-6 md:bottom-20 md:right-10 z-20 h-16 w-16 rounded-full p-0 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.65)] ring-2 ring-emerald-200/70 hover:scale-105 transition-transform"
            aria-label={language === 'sw' ? 'Angalia Kuhusu na Huduma' : 'View About and Services'}
          >
            <span className="absolute -inset-4 rounded-full border-2 border-emerald-300/80 blur-[1px] animate-pulse [animation-duration:3.2s]" aria-hidden="true" />
            <span className="absolute -inset-6 rounded-full bg-emerald-400/25 blur-2xl animate-pulse [animation-duration:3.2s]" aria-hidden="true" />
            <span className="absolute inset-0 rounded-full ring-2 ring-emerald-200/40 animate-ping [animation-duration:2.6s]" aria-hidden="true" />
            <span className="absolute inset-1 rounded-full bg-emerald-900/25 backdrop-blur-sm" aria-hidden="true" />
            <span className="absolute inset-0 rounded-full border border-white/35" aria-hidden="true" />
            <Info className="h-6 w-6 text-white drop-shadow" />
            <span className="sr-only">
              {language === 'sw' ? 'Angalia Kuhusu na Huduma' : 'View About and Services'}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(94vw,1200px)] max-w-6xl max-h-[85vh] overflow-y-auto p-0">
          <div className="bg-background">
            <AboutSection />
            <ServicesSection />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
