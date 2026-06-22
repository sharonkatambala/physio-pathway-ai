import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
// Legacy assessment components removed. New assessment is handled at /assessment route.
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  Video, 
  MessageSquare,
  Activity,
  FileText,
  Bell,
  User,
  Brain,
  Play,
  CheckCircle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import ExerciseProgram from '@/components/ExerciseProgram';
import ProgressTracker from '@/components/ProgressTracker';
import MonitoringSystem from '@/components/MonitoringSystem';
import BookingSystem from '@/components/BookingSystem';
import ExerciseProgramDisplay from '@/components/ExerciseProgramDisplay';
import { useLanguage } from '@/contexts/LanguageContext';

const PatientDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const navigate = useNavigate();
  // Prevent showing the legacy assessment flow by checking for an existing assessment
  const [checkedAssessments, setCheckedAssessments] = useState<boolean>(false);
  // null = still checking; false = first-time (no assessment yet); true = returning
  const [hasAnyAssessment, setHasAnyAssessment] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAssessment = async () => {
      // If we don't have a user yet or the app is still loading, skip for now
      if (!user || loading) return;

      // If current user is not a patient, mark check complete so dashboard renders for other roles
      if (role !== 'patient') {
        setCheckedAssessments(true);
        return;
      }

      try {
        // Don't force first-time users into the assessment flow — let them land on
        // their overview, where a prominent prompt invites them to start the assessment.
        const { data } = await supabase.from('assessments').select('id').eq('patient_user_id', user.id).limit(1);
        setHasAnyAssessment(!!(data && data.length > 0));
      } catch (err) {
        console.error('Failed to check assessments', err);
      } finally {
        setCheckedAssessments(true);
      }
    };

    checkAssessment();
  }, [user, loading, role]);
  // We removed the legacy inline assessment flow; redirect users to the new /assessment.
  const [exerciseProgram, setExerciseProgram] = useState<string>('');
  const [latestPain, setLatestPain] = useState<number | null>(null);
  const [exerciseStreak, setExerciseStreak] = useState<number>(0);
  const [weeklyProgress, setWeeklyProgress] = useState<number>(0);
  const [nextSession, setNextSession] = useState<{ date: string; time: string } | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [hasProgressEntries, setHasProgressEntries] = useState<boolean>(false);
  const [hasAssessment, setHasAssessment] = useState<boolean>(false);

  const displayName = useMemo(() => {
    const metaFirst = (user?.user_metadata?.first_name as string | undefined) ?? '';
    const metaLast = (user?.user_metadata?.last_name as string | undefined) ?? '';
    const first = profile?.first_name?.trim() || metaFirst.trim();
    const last = profile?.last_name?.trim() || metaLast.trim();
    const full = `${first} ${last}`.trim();
    return full || user?.email || t('patient.welcomeBack');
  }, [profile?.first_name, profile?.last_name, user?.user_metadata, user?.email, t]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user || !profile?.id || role !== 'patient') return;
      setLoadingStats(true);
      try {
        const { data: progressEntries } = await supabase
          .from('progress_entries')
          .select('pain_level, created_at, completed_exercises_count')
          .eq('patient_user_id', user.id)
          .order('created_at', { ascending: false });

        if (progressEntries && progressEntries.length > 0) {
          setHasProgressEntries(true);
          setHasAssessment(false);
          const latest = progressEntries[0];
          setLatestPain(latest.pain_level ?? null);

          const dates = progressEntries
            .map((entry) => entry.created_at)
            .filter(Boolean)
            .map((d) => new Date(d as string));

          const uniqueDays = Array.from(new Set(dates.map((d) => d.toISOString().slice(0, 10)))).sort();
          let streak = 0;
          let cursor = new Date();
          for (;;) {
            const key = cursor.toISOString().slice(0, 10);
            if (uniqueDays.includes(key)) {
              streak += 1;
              cursor.setDate(cursor.getDate() - 1);
            } else {
              break;
            }
          }
          setExerciseStreak(streak);

          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekCount = dates.filter((d) => d >= weekAgo).length;
          setWeeklyProgress(Math.min(100, Math.round((weekCount / 7) * 100)));
        } else {
          setHasProgressEntries(false);
          setLatestPain(null);
          setExerciseStreak(0);
          setWeeklyProgress(0);

          const { data: assessments } = await supabase
            .from('assessments')
            .select('pain_level, created_at')
            .eq('patient_user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (assessments && assessments.length > 0) {
            setHasAssessment(true);
            setLatestPain(assessments[0].pain_level ?? null);
          } else {
            setHasAssessment(false);
          }
        }

        const { data: appointments } = await supabase
          .from('appointments')
          .select('appointment_date, appointment_time, status')
          .eq('patient_id', profile.id)
          .neq('status', 'cancelled')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(1);

        if (appointments && appointments.length > 0) {
          const next = appointments[0];
          setNextSession({
            date: next.appointment_date,
            time: next.appointment_time?.slice(0, 5) ?? ''
          });
        } else {
          setNextSession(null);
        }
      } catch (err) {
        console.error('Failed to load patient stats', err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user, profile?.id, role]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role === 'physiotherapist') {
    return <Navigate to="/physiotherapist-dashboard" replace />;
  }

  // Wait for the assessment existence check to complete before rendering dashboard.
  // This prevents the legacy HealthInputForm flow from briefly rendering for users without assessments.
  if (!checkedAssessments) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  const startNewAssessment = () => {
    // Redirect patients to the dedicated assessment page
    navigate('/assessment');
  };

  // We no longer render the inline assessment flow here. Patients are redirected to /assessment

  // Main dashboard view after assessment is complete
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="page-shell py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('patient.welcomeBack')}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                {displayName || 'Dashboard'}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {(hasProgressEntries || hasAssessment || hasAnyAssessment) ? t('patient.trackingActive') : t('patient.trackingStart')}
                </Badge>
                <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {weeklyProgress > 0 ? t('patient.goodProgress') : t('patient.startTracking')}
                </Badge>
              </div>
            </div>
            {hasAnyAssessment !== false && (
              <Button variant="outline" size="sm" onClick={startNewAssessment} className="flex-shrink-0 gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                {t('patient.newAssessment')}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="exercises">{t('dashboard.exercises')}</TabsTrigger>
            <TabsTrigger value="progress">{t('dashboard.progress')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('dashboard.monitoring')}</TabsTrigger>
            <TabsTrigger value="chat">{t('dashboard.chatBook')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* First-time prompt: invite the patient to complete their first assessment */}
            {hasAnyAssessment === false && (
              <Card className="border-primary/30 bg-primary/5 shadow-card">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {tr('Start your first assessment', 'Anza tathmini yako ya kwanza')}
                      </h3>
                      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                        {tr(
                          'Complete a quick assessment so Ergocare AI can build your personalized recovery plan.',
                          'Kamilisha tathmini fupi ili Ergocare AI iweze kutengeneza mpango wako binafsi wa kupona.'
                        )}
                      </p>
                    </div>
                  </div>
                  <Button onClick={startNewAssessment} className="flex-shrink-0 bg-gradient-hero shadow-soft">
                    {tr('Start Assessment', 'Anza Tathmini')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="shadow-card border-border/60 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-muted-foreground mb-1">{t('patient.painLevel')}</p>
                      <p className="text-2xl font-extrabold text-foreground tracking-tight">
                        {loadingStats ? <span className="text-muted-foreground">—</span> : latestPain !== null ? `${latestPain}/10` : '—'}
                      </p>
                    </div>
                    <div className="icon-container bg-primary/10 flex-shrink-0">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-border/60 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-muted-foreground mb-1">{t('patient.exerciseStreak')}</p>
                      <p className="text-2xl font-extrabold text-foreground tracking-tight">
                        {loadingStats ? <span className="text-muted-foreground">—</span> : `${exerciseStreak} ${t('patient.days')}`}
                      </p>
                    </div>
                    <div className="icon-container bg-success/10 flex-shrink-0">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-border/60 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-muted-foreground mb-1">{t('patient.weeklyProgress')}</p>
                      <p className="text-2xl font-extrabold text-foreground tracking-tight">
                        {loadingStats ? <span className="text-muted-foreground">—</span> : `${weeklyProgress}%`}
                      </p>
                    </div>
                    <div className="icon-container bg-secondary/10 flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-border/60 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-muted-foreground mb-1">{t('patient.nextSession')}</p>
                      <p className="text-lg font-extrabold text-foreground tracking-tight leading-snug mt-0.5">
                        {loadingStats
                          ? <span className="text-muted-foreground">—</span>
                          : nextSession
                          ? `${nextSession.date} ${nextSession.time}`
                          : t('patient.noSession')}
                      </p>
                    </div>
                    <div className="icon-container bg-accent/10 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI-Generated Exercise Program */}
            {exerciseProgram && <ExerciseProgramDisplay program={exerciseProgram} />}

            {/* Today's Tasks */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t('patient.todaysActions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                  {hasProgressEntries
                    ? t('patient.actionsReady')
                    : t('patient.actionsEmpty')}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate('/progress')}>
                      {t('patient.logProgress')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/exercises')}>
                      {t('patient.viewExercises')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/booking')}>
                      {t('patient.bookSession')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <ExerciseProgram />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringSystem />
          </TabsContent>

          <TabsContent value="chat">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center text-center gap-4 py-10">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {tr('Message your physiotherapist', 'Tuma ujumbe kwa physiotherapist wako')}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {tr(
                        'Chat directly with your physiotherapist in real time. Your conversations are private and shared only with your care team.',
                        'Wasiliana moja kwa moja na physiotherapist wako kwa wakati halisi. Mazungumzo yako ni ya faragha na yanaonekana kwa timu yako ya huduma pekee.'
                      )}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/messages')} className="bg-gradient-hero shadow-soft">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {tr('Open Messages', 'Fungua Ujumbe')}
                  </Button>
                </CardContent>
              </Card>
              <BookingSystem />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
