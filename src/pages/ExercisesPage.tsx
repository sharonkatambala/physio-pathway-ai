import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from '@/components/Navigation';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Target,
  Activity,
  Heart,
  Scale,
  Zap,
  User,
  Award
} from 'lucide-react';
import { exerciseCategories } from '@/data/exerciseCategories';

type Phase = 'acute' | 'intermediate' | 'advanced';

const ExercisesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('acute');

  const phaseInfo = {
    acute: {
      name: 'Early / Acute Phase',
      description: 'Focus on gentle mobility and pain management',
      frequency: 'Daily short sessions',
      badge: 'Beginner',
      color: 'text-blue-500'
    },
    intermediate: {
      name: 'Intermediate / Building Phase',
      description: 'Introduce strength, balance, and light endurance work',
      frequency: '2-3 times per week',
      badge: 'Intermediate',
      color: 'text-yellow-500'
    },
    advanced: {
      name: 'Advanced / Maintenance Phase',
      description: 'Increase complexity, focusing on functional movement and long-term independence',
      frequency: '3-4 times per week',
      badge: 'Advanced',
      color: 'text-green-500'
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, any> = {
      'pain-mobility': Activity,
      'post-surgery': Heart,
      'neurological': Zap,
      'geriatric': User,
      'sports-injury': Award,
      'chronic-conditions': Heart,
      'wellness-prevention': Target
    };
    return icons[categoryId] || Activity;
  };

  if (selectedCategory) {
    const category = exerciseCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    // Filter exercises by difficulty based on current phase
    const filteredExercises = category.exercises.filter(ex => {
      if (currentPhase === 'acute') return ex.difficulty === 'Beginner';
      if (currentPhase === 'intermediate') return ex.difficulty === 'Intermediate' || ex.difficulty === 'Beginner';
      return true; // Advanced phase shows all
    });

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCategory(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>

          {/* Phase Selection */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Select Your Training Phase</CardTitle>
              <CardDescription>Choose the appropriate phase based on your recovery stage and physiotherapist guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(phaseInfo) as Phase[]).map((phase) => (
                  <Card 
                    key={phase}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentPhase === phase ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                    onClick={() => setCurrentPhase(phase)}
                  >
                    <CardContent className="p-4">
                      <Badge className="mb-2">{phaseInfo[phase].badge}</Badge>
                      <h3 className={`font-semibold mb-2 ${phaseInfo[phase].color}`}>
                        {phaseInfo[phase].name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {phaseInfo[phase].description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {phaseInfo[phase].frequency}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Always include rest and recovery days between high-intensity sessions. 
                  Consult your physiotherapist before progressing to the next phase.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          {/* Exercises Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredExercises.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No exercises available for this phase. Please consult your physiotherapist.</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => (
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
                    
                    {/* FITT Principle */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        FITT Principle
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <p className="font-medium">{exercise.fittPrinciple.frequency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intensity:</span>
                          <p className="font-medium">{exercise.fittPrinciple.intensity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <p className="font-medium">{exercise.fittPrinciple.time}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{exercise.fittPrinciple.type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Body Parts */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Target Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.bodyPart.map((part) => (
                          <Badge key={part} variant="outline" className="text-xs capitalize">
                            {part.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Instructions:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 pl-4">
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index} className="list-decimal">{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Watch Demo
                      </Button>
                      <Button size="sm" className="flex-1">Add to My Plan</Button>
                    </div>

                    {/* Safety Disclaimer */}
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Safety:</strong> Stop if pain increases. This AI guidance is for physiotherapy support and education. 
                        It does not replace professional medical advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Category Selection View
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Exercise Program</h1>
          <p className="text-muted-foreground">
            Select a category below to view exercises based on WHO and leading physiotherapy standards. 
            Each category contains exercise videos and instructions tailored to your rehabilitation needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseCategories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            return (
              <Card 
                key={category.id}
                className="shadow-card hover:shadow-soft transition-all cursor-pointer hover:border-primary"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {category.exercises.length} Exercises
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View Exercises →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Medical Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  This AI guidance is for physiotherapy support and education. It does not replace professional medical advice, 
                  diagnosis, or treatment. Always consult with your physiotherapist or healthcare provider before starting any 
                  new exercise program, especially if you have any medical conditions or concerns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExercisesPage;
