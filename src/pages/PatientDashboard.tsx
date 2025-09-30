import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from '@/components/Navigation';
import HealthInputForm from '@/components/HealthInputForm';
import VideoAssessment from '@/components/VideoAssessment';
import AIQuestionnaire from '@/components/AIQuestionnaire';
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

const PatientDashboard = () => {
  const { user, profile, loading } = useAuth();
  // Start with 'input' to show assessment first for new users
  const [assessmentStep, setAssessmentStep] = useState<'input' | 'video' | 'questionnaire' | 'results' | 'complete'>('input');
  const [healthData, setHealthData] = useState<any>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'patient') {
    return <Navigate to="/physiotherapist-dashboard" replace />;
  }

  const handleHealthInput = (data: any) => {
    setHealthData(data);
    setAssessmentStep('video');
  };

  const handleVideoComplete = (file?: File) => {
    setVideoFile(file || null);
    setAssessmentStep('questionnaire');
  };

  const handleQuestionnaireComplete = (answers: Record<string, string>) => {
    setQuestionnaireAnswers(answers);
    setAssessmentStep('results');
    // Simulate AI processing
    setTimeout(() => {
      setAssessmentStep('complete');
    }, 3000);
  };

  const handleQuestionnaireBack = () => {
    setAssessmentStep('video');
  };

  const startNewAssessment = () => {
    setAssessmentStep('input');
    setHealthData(null);
    setVideoFile(null);
    setQuestionnaireAnswers({});
  };

  // Show assessment flow if not complete
  if (assessmentStep !== 'complete') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">FIZIO AI Assessment</h1>
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
              <span>Health Info</span>
              <span>Video (Optional)</span>
              <span>Questionnaire</span>
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
                <h3 className="text-xl font-semibold mb-2">AI is Analyzing Your Assessment</h3>
                <p className="text-muted-foreground">
                  Our advanced AI is processing your health information, video, and questionnaire responses to create your personalized treatment plan...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

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
                Welcome back, {profile?.first_name || user.email}!
              </h1>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <Target className="h-4 w-4 mr-1" />
                  Lower Back Pain Program
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Week 1, Day 3
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Good Progress
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={startNewAssessment}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="chat">Chat & Book</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pain Level</p>
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
                      <p className="text-muted-foreground text-sm">Exercise Streak</p>
                      <p className="text-2xl font-bold text-success">7 days</p>
                    </div>
                    <Target className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Weekly Progress</p>
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
                      <p className="text-muted-foreground text-sm">Next Session</p>
                      <p className="text-lg font-bold text-accent">Today 2PM</p>
                    </div>
                    <Calendar className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Results Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  AI Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <h4 className="font-semibold text-primary mb-2">Condition Assessment</h4>
                    <p className="text-sm">Based on your assessment, you likely have mechanical lower back pain with mild muscle tension. This is commonly caused by prolonged sitting and poor posture.</p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-lg border-l-4 border-success">
                    <h4 className="font-semibold text-success mb-2">Recommended Category</h4>
                    <p className="text-sm">Pain & Mobility Relief - Lower Back Pain Exercises focusing on core activation and posture correction.</p>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary">
                    <h4 className="font-semibold text-secondary mb-2">FITT Plan</h4>
                    <p className="text-sm">
                      <strong>Frequency:</strong> 5 days/week • 
                      <strong>Intensity:</strong> Moderate • 
                      <strong>Time:</strong> 15-20 minutes • 
                      <strong>Type:</strong> Mobility & Strengthening
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Complete morning stretches (✓ Done)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Core strengthening exercises (15 min)</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Start Now
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Video className="h-5 w-5 text-accent" />
                    <span>Upload today's progress video</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Upload
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