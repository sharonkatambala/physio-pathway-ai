import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Calendar, 
  Shield,
  Brain,
  Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Brain,
      titleKey: "features.aiAssessmentTitle",
      descKey: "features.aiAssessmentDesc"
    },
    {
      icon: Video,
      titleKey: "features.videoAnalysis",
      descKey: "features.videoAnalysisDesc"
    },
    {
      icon: Target,
      titleKey: "features.personalizedExercises",
      descKey: "features.personalizedExercisesDesc"
    },
    {
      icon: TrendingUp,
      titleKey: "features.progressTracking",
      descKey: "features.progressTrackingDesc"
    },
    {
      icon: MessageSquare,
      titleKey: "features.aiSupport",
      descKey: "features.aiSupportDesc"
    },
    {
      icon: Calendar,
      titleKey: "features.bookPhysiotherapists",
      descKey: "features.bookPhysiotherapistsDesc"
    },
    {
      icon: Activity,
      titleKey: "features.realtimeMonitoring",
      descKey: "features.realtimeMonitoringDesc"
    },
    {
      icon: Shield,
      titleKey: "features.medicalSecurity",
      descKey: "features.medicalSecurityDesc"
    }
  ];

  return (
    <section id="features" className="section-pad bg-muted/30">
      <div className="page-shell">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
