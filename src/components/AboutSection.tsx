import { Shield, Users, Heart, Award, TrendingUp, Brain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AboutStats {
  patients: number;
  physiotherapists: number;
  assessments: number;
  programs: number;
}

const AboutSection = ({ stats }: { stats: AboutStats }) => {
  const { t } = useLanguage();

  const metrics = [
    { value: stats.patients.toLocaleString(),         label: 'Registered Patients' },
    { value: stats.physiotherapists.toLocaleString(), label: 'Physiotherapists' },
    { value: stats.assessments.toLocaleString(),      label: 'Assessments Done' },
    { value: stats.programs.toLocaleString(),         label: 'Exercise Programs' },
  ];

  const pillars = [
    { icon: Shield, title: t('about.evidenceBased'), desc: t('about.evidenceDesc') },
    { icon: Heart, title: t('about.patientCentered'), desc: t('about.patientDesc') },
    { icon: Users, title: t('about.accessible'), desc: t('about.accessibleDesc') },
  ];

  return (
    <section id="about" className="section-pad bg-background">
      <div className="page-shell">
        <div className="text-center mb-14">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] mb-3">Who We Are</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{t('about.title')}</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {metrics.map(({ value, label }) => (
            <div key={label} className="bg-card rounded-2xl border border-border/60 p-7 text-center shadow-xs hover:border-primary/25 hover:shadow-card transition-all duration-200">
              <p className="text-4xl font-extrabold text-primary tracking-tight">{value}</p>
              <p className="text-base text-muted-foreground mt-2 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: description + pillars */}
          <div className="space-y-5">
            <p className="text-base text-muted-foreground leading-relaxed">{t('about.description1')}</p>
            <p className="text-base text-muted-foreground leading-relaxed">{t('about.description2')}</p>

            <div className="space-y-3 pt-2">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mission card */}
          <div className="bg-gradient-card rounded-2xl p-8 border border-border/60 shadow-card">
            <h3 className="text-foreground mb-3">{t('about.mission')}</h3>
            <p className="text-base text-muted-foreground mb-7 leading-relaxed">
              We are on a mission to make expert physiotherapy accessible to everyone, everywhere - through the power of AI and human expertise combined.
            </p>

            <div className="space-y-5">
              {[
                { icon: Brain, title: 'AI-First Assessment', desc: 'Ergocare AI analyzes your condition with clinical precision, instantly generating a comprehensive health profile.' },
                { icon: Award, title: 'Expert-Approved Plans', desc: 'Every exercise program is reviewed and approved by our network of certified physiotherapists.' },
                { icon: TrendingUp, title: 'Measurable Results', desc: 'Track your recovery journey with data-driven insights, progress charts, and milestone achievements.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
