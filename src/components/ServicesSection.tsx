import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Video, Brain, Calendar, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const services = [
    {
      icon: Brain,
      title: "AI Assessment",
      description: "Advanced AI-powered assessment tools that analyze your condition and create personalized treatment plans.",
      features: ["Video Analysis", "Questionnaire", "Progress Tracking"],
      badge: "AI-Powered"
    },
    {
      icon: Video,
      title: "Exercise Programs",
      description: "Personalized exercise programs with demonstration videos based on FITT principles.",
      features: ["Video Demonstrations", "Progress Monitoring", "Pain Tracking"],
      badge: "Personalized"
    },
    {
      icon: Calendar,
      title: "Professional Sessions",
      description: "Book sessions with certified physiotherapists for hands-on treatment and guidance.",
      features: ["Certified Professionals", "Flexible Scheduling", "Direct Communication"],
      badge: "Expert Care"
    },
    {
      icon: TrendingUp,
      title: "Progress Monitoring",
      description: "Comprehensive tracking of your recovery journey with detailed analytics and insights.",
      features: ["Visual Charts", "Pain Assessment", "Exercise Compliance"],
      badge: "Data-Driven"
    },
    {
      icon: Users,
      title: "Patient-Physiotherapist Portal",
      description: "Seamless communication platform connecting patients with their physiotherapists.",
      features: ["Real-time Chat", "Report Sharing", "Appointment Management"],
      badge: "Connected Care"
    },
    {
      icon: Activity,
      title: "Wearable Integration",
      description: "Connect with wearable devices for continuous monitoring of movement and progress.",
      features: ["Device Sync", "Movement Analysis", "Real-time Feedback"],
      badge: "Smart Tech"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Comprehensive Physiotherapy Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From AI-powered assessments to professional consultations, we provide everything you need for your recovery journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:shadow-card transition-all duration-300 group">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-hero shadow-glow">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;