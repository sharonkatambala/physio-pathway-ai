import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Video, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssessmentFlow = () => {
  const navigate = useNavigate();
  const steps = [
    {
      icon: User,
      title: "Patient Information",
      description: "Tell us about your age, occupation, medical history, and current symptoms",
      badge: "2 minutes"
    },
    {
      icon: FileText,
      title: "Symptom Analysis",
      description: "Describe your problem or upload existing diagnosis. Our AI will analyze your condition",
      badge: "5 minutes"
    },
    {
      icon: Video,
      title: "Movement Assessment",
      description: "Upload videos showing your movement limitations or affected areas for AI analysis",
      badge: "Optional"
    },
    {
      icon: Target,
      title: "Personalized Plan",
      description: "Receive your customized exercise program based on FITT principles and your condition",
      badge: "Instant"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with your personalized physiotherapy assessment in just a few simple steps
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="border-border/50 shadow-card bg-gradient-card h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{step.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-hero shadow-glow text-lg h-14 px-8" onClick={() => navigate('/assessment')}>
            Start Your Assessment Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            Free assessment • No credit card required • HIPAA compliant
          </p>
        </div>
      </div>
    </section>
  );
};

export default AssessmentFlow;