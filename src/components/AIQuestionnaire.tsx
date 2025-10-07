import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'open' | 'scale';
  placeholder?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  note?: string;
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
      question: 'Where is your pain most prominently located?',
      type: 'open',
      placeholder: 'Describe the exact location of your pain (e.g., lower back, right knee, left shoulder, etc.)'
    },
    {
      id: 'pain_duration',
      question: 'How long have you been experiencing this problem?',
      type: 'open',
      placeholder: 'Describe how long you\'ve had this problem (e.g., 2 weeks, 3 months, 1 year)'
    },
    {
      id: 'activity_limitation',
      question: 'How does it limit your activities?',
      type: 'open',
      placeholder: 'Describe how your condition affects your daily activities, work, exercise, or hobbies',
      note: 'Coping questions - This helps us understand your functional limitations'
    },
    {
      id: 'aggravating_activities',
      question: 'What activities make the pain worse?',
      type: 'open',
      placeholder: 'Describe which movements, positions, or activities increase your pain or discomfort'
    },
    {
      id: 'previous_treatments',
      question: 'Have you tried treatments before? What were the results?',
      type: 'open',
      placeholder: 'Describe any previous treatments you\'ve tried (medications, therapy, exercises) and their effectiveness'
    },
    {
      id: 'pain_at_rest',
      question: 'On a scale of 1-10, how would you rate your pain during rest?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: 'Minimal Pain', max: 'Severe Pain' }
    },
    {
      id: 'pain_during_activity',
      question: 'On a scale of 1-10, how would you rate your pain during activity?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: 'Minimal Pain', max: 'Severe Pain' }
    },
    {
      id: 'symptom_pattern',
      question: 'When is your pain typically worse and when does it improve?',
      type: 'open',
      placeholder: 'Describe any patterns you\'ve noticed (e.g., worse in morning, improves with movement, worse after sitting)'
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

  const isAnswered = answers[currentQ.id] !== undefined && answers[currentQ.id].trim() !== '';
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
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: (currentQ.scaleMax! - currentQ.scaleMin!) + 1 }, (_, i) => {
                const value = currentQ.scaleMin! + i;
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value.toString())}
                    type="button"
                    className={`h-12 w-full rounded-lg border-2 transition-all ${
                      answers[currentQ.id] === value.toString()
                        ? 'border-primary bg-primary text-white shadow-md scale-110'
                        : 'border-border hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'open':
        return (
          <div className="space-y-2">
            <Textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={currentQ.placeholder}
              rows={5}
              className="text-base"
            />
            {currentQ.note && (
              <p className="text-sm text-muted-foreground italic">
                {currentQ.note}
              </p>
            )}
          </div>
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
          <div className="space-y-2">
            <Label className="text-lg font-medium leading-relaxed">
              {currentQ.question}
            </Label>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          
          {renderQuestion()}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentQuestion === 0 ? 'Back to Video' : 'Previous'}
          </Button>
          
          <Button 
            onClick={handleNext} 
            disabled={!isAnswered}
            type="button"
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
