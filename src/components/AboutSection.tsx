import { Shield, Users, Award, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t('about.title')}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('about.subtitle')}
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {t('about.description1')}
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                {t('about.description2')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-card rounded-xl border border-border">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">10k+</div>
                <div className="text-sm text-muted-foreground">{t('about.patientsTreated')}</div>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border">
                <Award className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">{t('about.successRate')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">{t('about.mission')}</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">{t('about.evidenceBased')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.evidenceDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">{t('about.patientCentered')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.patientDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">{t('about.accessible')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.accessibleDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;