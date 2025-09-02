import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";  
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navigation from '@/components/Navigation';
import { User, FileText, Video, Target, ArrowRight, Upload } from 'lucide-react';

const AssessmentPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    occupation: '',
    diagnosis: '',
    symptoms: '',
    hasVideo: false
  });

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Problem Description", icon: FileText },
    { id: 3, title: "Video Assessment", icon: Video },
    { id: 4, title: "Results", icon: Target }
  ];

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive ? 'bg-primary border-primary text-primary-foreground' :
                      isCompleted ? 'bg-success border-success text-white' :
                      'border-border text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-full h-0.5 mx-4 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps.find(s => s.id === currentStep)?.icon && 
                (() => {
                  const Icon = steps.find(s => s.id === currentStep)!.icon;
                  return <Icon className="h-6 w-6 text-primary" />;
                })()
              }
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input 
                      id="occupation" 
                      placeholder="Your occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Problem Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="problem-type">Do you have an existing diagnosis?</Label>
                  <RadioGroup className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diagnosis" id="has-diagnosis" />
                      <Label htmlFor="has-diagnosis">Yes, I have a medical diagnosis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="symptoms" id="has-symptoms" />
                      <Label htmlFor="has-symptoms">No, I want to describe my symptoms</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis (if applicable)</Label>
                  <Input 
                    id="diagnosis" 
                    placeholder="e.g., Lower back pain, Shoulder impingement"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Describe your symptoms and problem</Label>
                  <Textarea 
                    id="symptoms" 
                    placeholder="Describe your pain, limitations, when it started, what makes it better or worse..."
                    className="min-h-32"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Video Assessment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Video Movement Assessment</h3>
                  <p className="text-muted-foreground">
                    Upload a video showing your movement or problem area for AI analysis (optional but recommended)
                  </p>
                </div>

                <Card className="border-dashed border-2 border-border bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Drag and drop your video here, or click to browse</p>
                    <Button variant="outline" className="mb-2">
                      Choose Video File
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports MP4, MOV files up to 50MB
                    </p>
                  </CardContent>
                </Card>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Video Guidelines:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Record in good lighting</li>
                    <li>• Show the affected area clearly</li>
                    <li>• Demonstrate movements that cause pain or limitation</li>
                    <li>• Keep video under 2 minutes</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Assessment Complete!</h3>
                  <p className="text-muted-foreground">
                    AI is analyzing your information to create a personalized treatment plan
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-success/20 bg-success/5">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2 text-success">Preliminary Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on your input, you may be experiencing muscle strain or postural issues. 
                        A personalized exercise program has been created for you.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2 text-primary">Next Steps</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Start with gentle exercises</li>
                        <li>• Track your progress daily</li>
                        <li>• Book a session if needed</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button size="lg" className="bg-gradient-hero shadow-glow">
                    View My Exercise Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="bg-gradient-hero">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="bg-gradient-hero">
                  Complete Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentPage;