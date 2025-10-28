import { useState, useEffect } from 'react';
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {t('patient.welcomeBack')}, {profile?.first_name || user.email}!
              </h1>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {t('patient.weekDay')}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {t('patient.goodProgress')}
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
                      <p className="text-2xl font-bold text-primary">3/10</p>
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
                      <p className="text-2xl font-bold text-success">7 {t('patient.days')}</p>
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
                      <p className="text-2xl font-bold text-secondary">85%</p>
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
                      <p className="text-lg font-bold text-accent">{t('patient.today')} 2PM</p>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>{t('patient.completedStretches')}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{t('patient.coreExercises')}</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      {t('patient.startNow')}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Video className="h-5 w-5 text-accent" />
                    <span>{t('patient.uploadVideo')}</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      {t('patient.upload')}
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