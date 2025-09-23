import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'scale' | 'multiple' | 'boolean';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

interface AIQuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

const AIQuestionnaire = ({ onComplete, onBack }: AIQuestionnaireProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: Question[] = [
    {
      id: 'pain_location',
      question: 'Where is your pain or discomfort primarily located?',
      type: 'multiple',
      options: ['Neck', 'Lower Back', 'Shoulder', 'Knee', 'Hip', 'Ankle', 'Other']
    },
    {
      id: 'pain_intensity',
      question: 'On a scale of 0-10, how would you rate your current pain level?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 10,
      scaleLabels: { min: 'No Pain', max: 'Worst Pain' }
    },
    {
      id: 'pain_duration',
      question: 'How long have you been experiencing this problem?',
      type: 'multiple',
      options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', 'More than 6 months']
    },
    {
      id: 'daily_activities',
      question: 'How much does this problem limit your daily activities?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 10,
      scaleLabels: { min: 'Not at all', max: 'Completely' }
    },
    {
      id: 'previous_treatment',
      question: 'Have you received any treatment for this problem before?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'symptom_pattern',
      question: 'When is your pain typically worse?',
      type: 'multiple',
      options: ['Morning', 'Evening', 'During activity', 'At rest', 'No specific pattern']
    }
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const isAnswered = answers[currentQ.id] !== undefined;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentQ.scaleLabels?.min}</span>
              <span>{currentQ.scaleLabels?.max}</span>
            </div>
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: (currentQ.scaleMax! - currentQ.scaleMin!) + 1 }, (_, i) => {
                const value = currentQ.scaleMin! + i;
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value.toString())}
                    className={`h-12 w-12 rounded-full border-2 transition-colors ${
                      answers[currentQ.id] === value.toString()
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'multiple':
      case 'boolean':
        return (
          <RadioGroup 
            value={answers[currentQ.id]} 
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQ.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-base cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Assessment Questionnaire
          </CardTitle>
          <Badge variant="secondary">
            {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQ.question}
          </h3>
          
          {renderQuestion()}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentQuestion === 0 ? 'Back to Video' : 'Previous'}
          </Button>
          
          <Button 
            onClick={handleNext} 
            disabled={!isAnswered}
          >
            {isLastQuestion ? 'Complete Assessment' : 'Next Question'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIQuestionnaire;