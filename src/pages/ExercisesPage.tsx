import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from '@/components/Navigation';
import { Play, Clock, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const ExercisesPage = () => {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const exercises = [
    {
      id: '1',
      name: 'Neck Stretches',
      duration: '5 minutes',
      difficulty: 'Beginner',
      category: 'Mobility',
      description: 'Gentle neck stretches to improve range of motion and reduce tension.',
      instructions: [
        'Sit comfortably with your back straight',
        'Slowly tilt your head to the right, hold for 15 seconds',
        'Return to center and repeat on the left side',
        'Repeat 3 times each direction'
      ]
    },
    {
      id: '2',
      name: 'Shoulder Blade Squeezes',
      duration: '3 minutes',
      difficulty: 'Beginner',
      category: 'Strengthening',
      description: 'Strengthen upper back muscles and improve posture.',
      instructions: [
        'Stand with arms at your sides',
        'Squeeze your shoulder blades together',
        'Hold for 5 seconds',
        'Repeat 10-15 times'
      ]
    },
    {
      id: '3',
      name: 'Cat-Cow Stretch',
      duration: '4 minutes',
      difficulty: 'Beginner',
      category: 'Mobility',
      description: 'Improve spinal flexibility and reduce lower back tension.',
      instructions: [
        'Start on hands and knees',
        'Arch your back (cow), then round it (cat)',
        'Move slowly and breathe deeply',
        'Repeat 10-15 times'
      ]
    },
    {
      id: '4',
      name: 'Wall Push-ups',
      duration: '6 minutes',
      difficulty: 'Intermediate',
      category: 'Strengthening',
      description: 'Build upper body strength with modified push-ups.',
      instructions: [
        'Stand arm\'s length from a wall',
        'Place palms flat against the wall',
        'Push away from wall and return',
        'Start with 2 sets of 10'
      ]
    }
  ];

  const todayProgram = exercises.filter((_, index) => index < 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">My Exercise Program</h1>
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              Week 1, Day 3
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Target className="h-4 w-4 mr-1" />
              Lower Back Focus
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              15 min total
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Program</TabsTrigger>
            <TabsTrigger value="library">Exercise Library</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Today's Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayProgram.map((exercise) => (
                    <Card key={exercise.id} className={`border transition-colors ${
                      completedExercises.includes(exercise.id) 
                        ? 'border-success/50 bg-success/5' 
                        : 'border-border hover:border-primary/50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{exercise.name}</h3>
                              <Badge 
                                variant={exercise.difficulty === 'Beginner' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {exercise.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.category}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {exercise.duration}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </Button>
                            <Button
                              size="sm"
                              variant={completedExercises.includes(exercise.id) ? "secondary" : "default"}
                              onClick={() => toggleExercise(exercise.id)}
                              className={completedExercises.includes(exercise.id) ? "bg-success hover:bg-success/80" : ""}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {completedExercises.includes(exercise.id) ? 'Completed' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="shadow-card hover:shadow-soft transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{exercise.difficulty}</Badge>
                          <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{exercise.duration}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{exercise.description}</p>
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Instructions:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 pl-4">
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index} className="list-decimal">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Watch Demo
                      </Button>
                      <Button size="sm" className="flex-1">Add to Program</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Exercises Completed</p>
                      <p className="text-2xl font-bold text-primary">{completedExercises.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Streak</p>
                      <p className="text-2xl font-bold text-secondary">3 days</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Time</p>
                      <p className="text-2xl font-bold text-accent">45 min</p>
                    </div>
                    <Clock className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monday</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tuesday</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="w-4 h-4 bg-border rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="w-4 h-4 bg-border rounded-full"></div>
                      <div className="w-4 h-4 bg-border rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExercisesPage;