import { Badge } from "@/components/ui/badge";
import { Video, Brain, Calendar, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesSection = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      icon: Brain,
      titleKey: "services.aiAssessment",
      descKey: "services.aiAssessmentDesc",
      features: ["Video Analysis", "Questionnaire", "Progress Tracking"],
      badge: "AI-Powered"
    },
    {
      icon: Video,
      titleKey: "services.exercisePrograms",
      descKey: "services.exerciseProgramsDesc",
      features: ["Video Demonstrations", "Progress Monitoring", "Pain Tracking"],
      badge: "Personalized"
    },
    {
      icon: Calendar,
      titleKey: "services.professionalSessions",
      descKey: "services.professionalSessionsDesc",
      features: ["Certified Professionals", "Flexible Scheduling", "Direct Communication"],
      badge: "Expert Care"
    },
    {
      icon: TrendingUp,
      titleKey: "services.progressMonitoring",
      descKey: "services.progressMonitoringDesc",
      features: ["Visual Charts", "Pain Assessment", "Exercise Compliance"],
      badge: "Data-Driven"
    },
    {
      icon: Users,
      titleKey: "services.patientPortal",
      descKey: "services.patientPortalDesc",
      features: ["Real-time Chat", "Report Sharing", "Appointment Management"],
      badge: "Connected Care"
    }
  ];

  return (
    <section id="services" className="section-pad bg-background">
      <div className="page-shell">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t('services.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:shadow-card transition-all duration-300 group">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(service.descKey)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
