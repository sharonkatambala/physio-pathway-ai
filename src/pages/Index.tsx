// homepage should remain public; don't auto-redirect authenticated users here
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, ClipboardList, TrendingUp, Quote, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveStats {
  patients: number;
  physiotherapists: number;
  assessments: number;
  programs: number;
}

const Index = () => {
  const { loading } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const location = useLocation();
  const [stats, setStats] = useState<LiveStats>({ patients: 0, physiotherapists: 0, assessments: 0, programs: 0 });

  // Scroll to a section when arriving with a hash (e.g. /#about from the nav on another page).
  useEffect(() => {
    if (loading || !location.hash) return;
    const id = location.hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [location.hash, loading]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (!error && data) {
        setStats({
          patients:         data.patients         ?? 0,
          physiotherapists: data.physiotherapists ?? 0,
          assessments:      data.assessments      ?? 0,
          programs:         data.programs         ?? 0,
        });
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      icon: Scan,
      step: '01',
      title: tr('AI Assessment', 'Tathmini ya AI'),
      desc: tr(
        'Complete our smart questionnaire. Ergocare AI analyzes your posture, pain patterns, and movement to build a full clinical picture instantly.',
        'Kamilisha dodoso letu mahiri. Ergocare AI inachambua mkao wako, mifumo ya maumivu, na mwendo kuunda picha kamili ya kiafya papo hapo.'
      ),
    },
    {
      icon: ClipboardList,
      step: '02',
      title: tr('Get Your Plan', 'Pata Mpango Wako'),
      desc: tr(
        'Receive a personalized exercise program designed for your condition - reviewed and approved by a certified physiotherapist.',
        'Pokea programu binafsi ya mazoezi iliyoundwa kwa hali yako - iliyokaguliwa na kuidhinishwa na physiotherapist aliyethibitishwa.'
      ),
    },
    {
      icon: TrendingUp,
      step: '03',
      title: tr('Track & Recover', 'Fuatilia na Upone'),
      desc: tr(
        'Follow guided sessions, log your progress daily, and watch measurable improvement with AI-powered insights and milestone tracking.',
        'Fuata vikao vya mwongozo, rekodi maendeleo yako kila siku, na uone uboreshaji unaopimika kwa maarifa ya AI na ufuatiliaji wa hatua.'
      ),
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: tr('Patient', 'Mgonjwa'),
      text: tr(
        'The AI assessment pinpointed my issue immediately. Three weeks in, my chronic back pain is nearly gone. This platform is a complete game-changer.',
        'Tathmini ya AI ilibaini tatizo langu mara moja. Wiki tatu baadaye, maumivu yangu sugu ya mgongo yamekaribia kuisha. Jukwaa hili limebadilisha kila kitu.'
      ),
    },
    {
      name: 'Dr. James K.',
      role: tr('Physiotherapist', 'Physiotherapist'),
      text: tr(
        'ErgoCare+ makes remote patient management effortless. The AI-generated reports are clinically accurate and save me hours of documentation every week.',
        'ErgoCare+ inafanya usimamizi wa wagonjwa wa mbali kuwa rahisi. Ripoti za AI ni sahihi kiafya na zinaniokolea masaa ya uandishi kila wiki.'
      ),
    },
    {
      name: 'Amina T.',
      role: tr('Patient', 'Mgonjwa'),
      text: tr(
        'Finally physiotherapy I can do from home with real professional guidance. The exercise videos and progress tracking keep me fully motivated.',
        'Hatimaye physiotherapy ninayoweza kufanya nyumbani kwa mwongozo halisi wa kitaalamu. Video za mazoezi na ufuatiliaji wa maendeleo vinanipa motisha kamili.'
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />

        {/* Stats strip - live data from database */}
        <div className="border-y border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="page-shell py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: stats.patients,         label: tr('Registered Patients', 'Wagonjwa Waliosajiliwa') },
                { value: stats.physiotherapists, label: tr('Physiotherapists', 'Physiotherapist') },
                { value: stats.assessments,      label: tr('Assessments Done', 'Tathmini Zilizofanyika') },
                { value: stats.programs,         label: tr('Exercise Programs', 'Programu za Mazoezi') },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ServicesSection />

        {/* How It Works */}
        <section id="how-it-works" className="section-pad bg-muted/20">
          <div className="page-shell">
            <div className="text-center mb-14">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] mb-3">{tr('Simple Process', 'Mchakato Rahisi')}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{tr('How It Works', 'Jinsi Inavyofanya Kazi')}</h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
                {tr(
                  'From assessment to recovery in three clear steps - powered by AI, guided by professionals.',
                  'Kutoka tathmini hadi kupona kwa hatua tatu wazi - kwa nguvu ya AI, kwa mwongozo wa wataalamu.'
                )}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {steps.map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={step}
                  className="relative bg-card rounded-2xl p-7 border border-border/60 shadow-xs group hover:border-primary/30 hover:shadow-card transition-all duration-200"
                >
                  <span className="absolute top-5 right-6 text-[11px] font-bold text-primary/30 tracking-[0.15em]">{step}</span>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-foreground mb-2">{title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AboutSection stats={stats} />

        {/* Testimonials */}
        <section className="section-pad bg-muted/20">
          <div className="page-shell">
            <div className="text-center mb-14">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] mb-3">{tr('Testimonials', 'Shuhuda')}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{tr('Trusted by Patients & Professionals', 'Inaaminiwa na Wagonjwa na Wataalamu')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map(({ name, role, text }) => (
                <div
                  key={name}
                  className="bg-card rounded-2xl p-7 border border-border/60 shadow-xs space-y-4 hover:border-primary/25 hover:shadow-card transition-all duration-200"
                >
                  <Quote className="h-7 w-7 text-primary/25" />
                  <p className="text-base text-muted-foreground leading-relaxed">"{text}"</p>
                  <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="section-pad-tight">
          <div className="page-shell">
            <div className="relative overflow-hidden bg-gradient-hero rounded-3xl px-8 py-16 text-center shadow-glow">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
              />
              <div className="relative z-10 max-w-2xl mx-auto space-y-5">
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-[0.15em]">{tr('Get Started Today', 'Anza Leo')}</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground">
                  {tr('Start Your Recovery Journey', 'Anza Safari Yako ya Kupona')}
                </h2>
                <p className="text-primary-foreground/80 text-lg leading-relaxed">
                  {tr(
                    'Free AI assessment. No credit card required. Get your personalized plan in minutes.',
                    'Tathmini ya AI bila malipo. Hakuna kadi ya benki inayohitajika. Pata mpango wako binafsi kwa dakika chache.'
                  )}
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-lg font-bold h-12 px-8 rounded-xl text-base"
                  >
                    <Link to="/auth">
                      {tr('Start Free Assessment', 'Anza Tathmini Bila Malipo')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-primary h-12 px-8 rounded-xl text-base font-semibold"
                  >
                    <a href="#contact">{tr('Contact Us', 'Wasiliana Nasi')}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
