import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  Video,
  Upload,
  Star,
  RotateCcw,
  Calendar,
  Activity,
  Info
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  category: string;
  duration: string;
  sets: number;
  reps: string;
  intensity: 'Low' | 'Moderate' | 'High';
  instructions: string[];
  fittPrinciple: {
    frequency: string;
    intensity: string;
    time: string;
    type: string;
  };
  demoVideoUrl?: string;
  bodyParts: string[];
  completed: boolean;
}

const ExerciseProgram = () => {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const { toast } = useToast();

  const todaysExercises: Exercise[] = [
    {
      id: '1',
      name: 'Cat-Camel Stretch',
      category: 'Pain & Mobility Relief',
      duration: '5 min',
      sets: 2,
      reps: '10-15',
      intensity: 'Low',
      instructions: [
        'Start on hands and knees in a tabletop position',
        'Slowly arch your back, dropping your belly and lifting your head (Camel)',
        'Then round your spine, tucking your chin to chest (Cat)',
        'Hold each position for 2-3 seconds',
        'Move slowly and controlled between positions'
      ],
      fittPrinciple: {
        frequency: '2x daily',
        intensity: 'Low-Moderate RPE 3-4/10',
        time: '5-10 minutes',
        type: 'Mobility & Flexibility'
      },
      bodyParts: ['Lower Back', 'Core', 'Spine'],
      completed: false
    },
    {
      id: '2',
      name: 'Pelvic Tilts',
      category: 'Pain & Mobility Relief',
      duration: '3 min',
      sets: 2,
      reps: '8-12',
      intensity: 'Low',
      instructions: [
        'Lie on your back with knees bent, feet flat on floor',
        'Gently flatten your lower back against the floor',
        'Tighten your abdominal muscles',
        'Hold for 5 seconds, then relax',
        'Breathe normally throughout the exercise'
      ],
      fittPrinciple: {
        frequency: '2x daily',
        intensity: 'Low RPE 2-3/10',
        time: '3-5 minutes',
        type: 'Core Stabilization'
      },
      bodyParts: ['Core', 'Lower Back', 'Pelvis'],
      completed: false
    },
    {
      id: '3',
      name: 'Knee to Chest Stretch',
      category: 'Pain & Mobility Relief',
      duration: '4 min',
      sets: 3,
      reps: '30 sec hold each leg',
      intensity: 'Low',
      instructions: [
        'Lie on your back with both legs extended',
        'Bring one knee toward your chest',
        'Grasp behind your thigh with both hands',
        'Gently pull until you feel a stretch',
        'Hold and switch legs'
      ],
      fittPrinciple: {
        frequency: '2-3x daily',
        intensity: 'Low RPE 2-4/10',
        time: '4-6 minutes',
        type: 'Stretching & Mobility'
      },
      bodyParts: ['Hip Flexors', 'Lower Back', 'Glutes'],
      completed: false
    }
  ];

  const toggleExerciseCompletion = (exerciseId: string) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
    
    toast({
      title: completedExercises.includes(exerciseId) ? "Exercise Unmarked" : "Exercise Completed!",
      description: "Great job on your progress!"
    });
  };

  const getCompletionRate = () => {
    return Math.round((completedExercises.length / todaysExercises.length) * 100);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'text-success bg-success/10';
      case 'Moderate': return 'text-warning bg-warning/10';
      case 'High': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Lower Back Pain Relief Program
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Week 2, Day 3 • FITT-based personalized plan
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              Today's Session
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{getCompletionRate()}%</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">12 min</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{completedExercises.length}/{todaysExercises.length}</p>
              <p className="text-sm text-muted-foreground">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">Low</p>
              <p className="text-sm text-muted-foreground">Intensity</p>
            </div>
          </div>
          <Progress value={getCompletionRate()} className="h-2" />
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today's Plan</TabsTrigger>
          <TabsTrigger value="library">Exercise Library</TabsTrigger>
          <TabsTrigger value="fitt">FITT Details</TabsTrigger>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todaysExercises.map((exercise) => (
            <Card key={exercise.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      completedExercises.includes(exercise.id) ? 'bg-success' : 'bg-muted'
                    }`}>
                      {completedExercises.includes(exercise.id) ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {todaysExercises.indexOf(exercise) + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{exercise.category}</p>
                    </div>
                  </div>
                  <Badge className={getIntensityColor(exercise.intensity)}>
                    {exercise.intensity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exercise Details */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{exercise.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span>{exercise.sets} sets × {exercise.reps}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>{exercise.bodyParts.join(', ')}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant={completedExercises.includes(exercise.id) ? "secondary" : "default"}
                    onClick={() => toggleExerciseCompletion(exercise.id)}
                  >
                    {completedExercises.includes(exercise.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Exercise
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Info className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="library">
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Exercise Library</h3>
              <p className="text-muted-foreground mb-4">
                Browse all available exercises organized by category and condition
              </p>
              <Button>Browse Library</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitt" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                FITT Principle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Frequency</h4>
                    <p className="text-sm">2-3 times daily, with rest days as needed</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Intensity</h4>
                    <p className="text-sm">Low to Moderate (RPE 2-4/10), focus on comfort and control</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-accent mb-2">Time</h4>
                    <p className="text-sm">12-15 minutes total session duration</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Type</h4>
                    <p className="text-sm">Mobility, stretching, and gentle core stabilization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Progress Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Upload Your Exercise Video</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Record yourself performing today's exercises for AI analysis and physiotherapist feedback
                </p>
                <Button>
                  <Video className="h-4 w-4 mr-2" />
                  Select Video File
                </Button>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Video Guidelines:</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Record in good lighting with clear view of your movements</li>
                  <li>Keep video under 5 minutes for optimal analysis</li>
                  <li>Include 2-3 repetitions of each exercise</li>
                  <li>Film from the side or front for best assessment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseProgram;