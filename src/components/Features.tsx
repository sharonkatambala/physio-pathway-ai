import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Calendar, 
  Shield,
  Brain,
  Activity
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Assessment",
      description: "Advanced AI analyzes your symptoms, movement patterns, and medical history to provide accurate condition assessment."
    },
    {
      icon: Video,
      title: "Video Analysis",
      description: "Upload movement videos for AI-powered posture and movement analysis with personalized feedback."
    },
    {
      icon: Target,
      title: "Personalized Exercises",
      description: "FITT-based exercise programs tailored to your condition, progress level, and daily limitations."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor pain levels, mobility improvements, and exercise adherence with detailed analytics."
    },
    {
      icon: MessageSquare,
      title: "24/7 AI Support",
      description: "Get instant answers to your questions and guidance from our AI physiotherapist anytime."
    },
    {
      icon: Calendar,
      title: "Book Real Physiotherapists",
      description: "Schedule sessions with licensed physiotherapists when you need human expertise."
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track your daily activities, exercise completion, and recovery metrics automatically."
    },
    {
      icon: Shield,
      title: "Medical Grade Security",
      description: "HIPAA-compliant platform ensuring your health data is protected and confidential."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Complete Physiotherapy Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for effective physiotherapy care in one intelligent platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;