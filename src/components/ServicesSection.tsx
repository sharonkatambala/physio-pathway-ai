import { Brain, Video, Calendar, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Brain,
      titleKey: 'services.aiAssessment',
      descKey: 'services.aiAssessmentDesc',
      badge: 'AI-Powered',
    },
    {
      icon: Video,
      titleKey: 'services.exercisePrograms',
      descKey: 'services.exerciseProgramsDesc',
      badge: 'Personalized',
    },
    {
      icon: Calendar,
      titleKey: 'services.professionalSessions',
      descKey: 'services.professionalSessionsDesc',
      badge: 'Expert Care',
    },
    {
      icon: TrendingUp,
      titleKey: 'services.progressMonitoring',
      descKey: 'services.progressMonitoringDesc',
      badge: 'Data-Driven',
    },
    {
      icon: Users,
      titleKey: 'services.patientPortal',
      descKey: 'services.patientPortalDesc',
      badge: 'Connected Care',
    },
  ];

  return (
    <section id="services" className="section-pad bg-background">
      <div className="page-shell">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.12em] mb-3">What We Offer</p>
          <h2 className="text-foreground">{t('services.title')}</h2>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, titleKey, descKey, badge }) => (
            <div
              key={titleKey}
              className="group bg-card rounded-2xl p-9 border border-border/60 hover:border-primary/25 hover:shadow-card transition-all duration-200"
            >
              <Icon className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-foreground mb-3">{t(titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-primary font-semibold text-base hover:gap-3 transition-all duration-150"
          >
            Get started with all features
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
