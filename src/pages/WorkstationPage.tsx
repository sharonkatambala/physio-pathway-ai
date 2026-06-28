import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  WORKSTATION_QUESTIONS,
  scoreWorkstation,
  sectionLabel,
  wsZoneColor,
  wsZoneLabel,
  wsHighRisk,
  type WsSection,
} from '@/lib/workstation';
import {
  Armchair,
  Monitor,
  Keyboard,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ClipboardCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react';

const SECTION_ICON: Record<WsSection, typeof Armchair> = {
  chair: Armchair,
  monitor: Monitor,
  peripherals: Keyboard,
  habits: Timer,
};

const SECTIONS: WsSection[] = ['chair', 'monitor', 'peripherals', 'habits'];

const WorkstationPage = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'sw' ? 'sw' : 'en';
  const tr = (en: string, sw: string) => (lang === 'sw' ? sw : en);
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const total = WORKSTATION_QUESTIONS.length;
  const allAnswered = answeredCount === total;

  const result = useMemo(() => scoreWorkstation(answers), [answers]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const submit = async () => {
    setSaving(true);
    const { error } = await supabase.from('ergonomic_assessments').insert({
      user_id: user.id,
      risk_score: result.risk,
      zone: result.zone,
      chair_score: result.sectionScores.chair,
      monitor_score: result.sectionScores.monitor,
      peripherals_score: result.sectionScores.peripherals,
      habits_score: result.sectionScores.habits,
      answers,
      tips: result.tips.map((t) => (lang === 'sw' ? t.sw : t.en)),
    });
    setSaving(false);
    if (error) {
      toast.error(tr('Could not save', 'Imeshindwa kuhifadhi'), { description: error.message });
    } else {
      toast.success(tr('Workstation check saved', 'Ukaguzi umehifadhiwa'));
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setAnswers({});
    setDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr('Workstation Check', 'Ukaguzi wa Eneo la Kazi')}</h1>
            <p className="text-sm text-muted-foreground">
              {tr('A quick desk ergonomics self-check. Takes about a minute.', 'Ukaguzi wa haraka wa ergonomiki ya dawati. Huchukua kama dakika moja.')}
            </p>
          </div>
        </div>

        {done ? (
          <>
            {/* Result */}
            <Card className="overflow-hidden border-0 shadow-card">
              <div className="p-6 text-primary-foreground" style={{ background: 'var(--gradient-hero)' }}>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
                    >
                      <span className="text-3xl font-bold">{result.risk}</span>
                      <span className="text-[10px] text-white/80">/ 10</span>
                    </div>
                    <div>
                      <p className="text-sm text-white/80">{tr('Ergonomic risk', 'Hatari ya ergonomiki')}</p>
                      <p className="text-2xl font-bold">{wsZoneLabel(result.zone, lang)}</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white">{tr('Lower is better', 'Chini ni bora')}</Badge>
                </div>
              </div>
            </Card>

            {/* Escalation when high risk */}
            {wsHighRisk(result.risk) && (
              <Card className="border-destructive/30 bg-destructive/5 shadow-card">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div>
                      <h3 className="font-semibold text-foreground">{tr('Your workstation needs attention', 'Eneo lako la kazi linahitaji uangalizi')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tr('A score above 5 suggests higher strain. Consider a physiotherapist to review your setup and any pain.', 'Alama zaidi ya 5 zinaonyesha mkazo zaidi. Fikiria physiotherapist kukagua mpangilio wako na maumivu yoyote.')}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/booking')} className="bg-gradient-hero shadow-soft flex-shrink-0">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    {tr('Book a physiotherapist', 'Weka physiotherapist')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">{tr('What to fix', 'Cha kurekebisha')}</CardTitle>
              </CardHeader>
              <CardContent>
                {result.tips.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    {tr('Your setup looks good. Keep moving regularly.', 'Mpangilio wako uko vizuri. Endelea kutembea mara kwa mara.')}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <span className="text-sm text-foreground/90">{lang === 'sw' ? t.sw : t.en}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {tr('Retake', 'Pima tena')}
              </Button>
              <Button onClick={() => navigate('/posture')} className="bg-gradient-hero shadow-soft">
                {tr('Now do a posture check', 'Sasa fanya ukaguzi wa mkao')}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Questions grouped by section */}
            {SECTIONS.map((section) => {
              const Icon = SECTION_ICON[section];
              const qs = WORKSTATION_QUESTIONS.filter((q) => q.section === section);
              return (
                <Card key={section} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-5 w-5 text-primary" />
                      {sectionLabel(section, lang)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {qs.map((q) => (
                      <div key={q.id}>
                        <p className="mb-2 text-sm font-medium text-foreground">{lang === 'sw' ? q.sw : q.en}</p>
                        <div className="grid gap-2">
                          {q.options.map((opt, idx) => {
                            const active = answers[q.id] === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                                  active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                                }`}
                              >
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                </span>
                                <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{lang === 'sw' ? opt.sw : opt.en}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}

            {/* Progress + submit */}
            <div className="sticky bottom-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tr('Answered', 'Umejibu')}</span>
                <span className="font-medium text-foreground">{answeredCount} / {total}</span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(answeredCount / total) * 100}%` }} />
              </div>
              <Button onClick={submit} disabled={!allAnswered || saving} className="w-full bg-gradient-hero shadow-soft">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {allAnswered ? tr('See my result', 'Ona matokeo yangu') : tr('Answer all questions to continue', 'Jibu maswali yote kuendelea')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkstationPage;
