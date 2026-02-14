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
  RotateCcw
} from 'lucide-react';
import ExerciseProgram from '@/components/ExerciseProgram';
import ProgressTracker from '@/components/ProgressTracker';
import MonitoringSystem from '@/components/MonitoringSystem';
import ChatSystem from '@/components/ChatSystem';
import BookingSystem from '@/components/BookingSystem';
import ExerciseProgramDisplay from '@/components/ExerciseProgramDisplay';
import { useLanguage } from '@/contexts/LanguageContext';

const PatientDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Prevent showing the legacy assessment flow by checking for an existing assessment
  const [checkedAssessments, setCheckedAssessments] = useState<boolean>(false);

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
        const { data } = await supabase.from('assessments').select('id').eq('patient_user_id', user.id).limit(1);
        if (!data || data.length === 0) {
          // No assessment found -> send user to the new assessment page
          navigate('/assessment', { replace: true });
          // we set checked to true to stop blocking render if navigation is prevented for some reason
          setCheckedAssessments(true);
          return;
        }
      } catch (err) {
        console.error('Failed to check assessments', err);
      }

      setCheckedAssessments(true);
    };

    checkAssessment();
  }, [user, loading, role, navigate]);
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

  if (role !== 'patient') {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {t('patient.welcomeBack')}, {displayName}!
              </h1>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {(hasProgressEntries || hasAssessment) ? t('patient.trackingActive') : t('patient.trackingStart')}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {weeklyProgress > 0 ? t('patient.goodProgress') : t('patient.startTracking')}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={startNewAssessment}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('patient.newAssessment')}
            </Button>
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
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('patient.painLevel')}</p>
                      <p className="text-2xl font-bold text-primary">
                        {loadingStats ? '—' : latestPain !== null ? `${latestPain}/10` : '—'}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('patient.exerciseStreak')}</p>
                      <p className="text-2xl font-bold text-success">
                        {loadingStats ? '—' : `${exerciseStreak} ${t('patient.days')}`}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('patient.weeklyProgress')}</p>
                      <p className="text-2xl font-bold text-secondary">
                        {loadingStats ? '—' : `${weeklyProgress}%`}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('patient.nextSession')}</p>
                      <p className="text-lg font-bold text-accent">
                        {loadingStats
                          ? '—'
                          : nextSession
                          ? `${nextSession.date} ${nextSession.time}`
                          : t('patient.noSession')}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-accent" />
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
              <ChatSystem />
              <BookingSystem />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
