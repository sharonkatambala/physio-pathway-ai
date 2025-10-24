<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import { useState } from 'react';
>>>>>>> c152a9c29a8f8110d3a980d081535e47a1e7f59c
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
<<<<<<< HEAD
// Legacy assessment components removed. New assessment is handled at /assessment route.
=======
import HealthInputForm from '@/components/HealthInputForm';
import VideoAssessment from '@/components/VideoAssessment';
import AIQuestionnaire from '@/components/AIQuestionnaire';
>>>>>>> c152a9c29a8f8110d3a980d081535e47a1e7f59c
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
<<<<<<< HEAD
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
=======
  // Start with 'input' to show assessment first for new users
  const [assessmentStep, setAssessmentStep] = useState<'input' | 'video' | 'questionnaire' | 'results' | 'complete'>('input');
  const [healthData, setHealthData] = useState<any>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
>>>>>>> c152a9c29a8f8110d3a980d081535e47a1e7f59c
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

<<<<<<< HEAD
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
=======
  const handleHealthInput = (data: any) => {
    setHealthData(data);
    setAssessmentStep('video');
  };

  const handleVideoComplete = (file?: File) => {
    setVideoFile(file || null);
    setAssessmentStep('questionnaire');
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    setQuestionnaireAnswers(answers);
    setAssessmentStep('results');
    
    try {
      const assessmentData = {
        healthData,
        questionnaireAnswers: answers,
        hasVideo: !!videoFile,
      };

      const { data, error } = await supabase.functions.invoke('generate-exercise-program', {
        body: { assessmentData }
      });

      if (error) {
        console.error('Error generating exercise program:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('Payment required. Please add credits to continue.');
        } else {
          toast.error('Failed to generate exercise program');
        }
        setAssessmentStep('questionnaire');
        return;
      }

      setExerciseProgram(data.exerciseProgram);
      setAssessmentStep('complete');
      toast.success('Your personalized exercise program is ready!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred. Please try again.');
      setAssessmentStep('questionnaire');
    }
  };

  const handleQuestionnaireBack = () => {
    setAssessmentStep('video');
  };

  const startNewAssessment = () => {
    setAssessmentStep('input');
    setHealthData(null);
    setVideoFile(null);
    setQuestionnaireAnswers({});
    setExerciseProgram('');
  };

  // Show assessment flow if not complete
  if (assessmentStep !== 'complete') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">{t('assessment.title')}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                assessmentStep === 'input' ? 'bg-primary text-white' : 
                ['video', 'questionnaire', 'results'].includes(assessmentStep) ? 'bg-success text-white' : 'bg-muted'
              }`}>
                {assessmentStep === 'input' ? '1' : <CheckCircle className="h-4 w-4" />}
              </div>
              <div className="w-16 h-1 bg-border"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                assessmentStep === 'video' ? 'bg-primary text-white' : 
                ['questionnaire', 'results'].includes(assessmentStep) ? 'bg-success text-white' : 'bg-muted'
              }`}>
                {assessmentStep === 'video' ? '2' : ['questionnaire', 'results'].includes(assessmentStep) ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <div className="w-16 h-1 bg-border"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                assessmentStep === 'questionnaire' ? 'bg-primary text-white' : 
                assessmentStep === 'results' ? 'bg-success text-white' : 'bg-muted'
              }`}>
                {assessmentStep === 'questionnaire' ? '3' : assessmentStep === 'results' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground max-w-md">
              <span>{t('assessment.healthInfo')}</span>
              <span>{t('assessment.video')}</span>
              <span>{t('assessment.questionnaire')}</span>
            </div>
          </div>

          {assessmentStep === 'input' && (
            <HealthInputForm onSubmit={handleHealthInput} />
          )}

          {assessmentStep === 'video' && (
            <VideoAssessment onComplete={handleVideoComplete} />
          )}

          {assessmentStep === 'questionnaire' && (
            <AIQuestionnaire 
              onComplete={handleQuestionnaireComplete}
              onBack={handleQuestionnaireBack}
            />
          )}

          {assessmentStep === 'results' && (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold mb-2">{t('assessment.generating')}</h3>
                <p className="text-muted-foreground">
                  {t('assessment.generatingDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
>>>>>>> c152a9c29a8f8110d3a980d081535e47a1e7f59c

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