import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground">
              Important Medical Disclaimer
            </h2>
          </div>

          <Alert className="border-warning/20 bg-warning/5">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertDescription className="text-foreground">
              <strong className="block mb-2">This platform is for educational and supportive purposes only.</strong>
              PhysiotherapyAI does not replace professional medical advice, diagnosis, or treatment from licensed healthcare providers. 
              Always consult with qualified physiotherapists, doctors, or healthcare professionals for medical concerns.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <Alert className="border-border/20">
              <Shield className="h-5 w-5 text-success" />
              <AlertDescription>
                <strong className="block mb-1">What We Provide:</strong>
                Educational content, exercise guidance, progress tracking, and supportive AI-powered insights based on physiotherapy principles.
              </AlertDescription>
            </Alert>

            <Alert className="border-border/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <AlertDescription>
                <strong className="block mb-1">When to Seek Professional Help:</strong>
                Severe pain, emergency situations, worsening symptoms, or when you need official medical diagnosis and treatment.
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center text-muted-foreground text-sm space-y-2">
            <p>
              By using PhysiotherapyAI, you acknowledge that you understand this disclaimer and agree to use the platform responsibly.
            </p>
            <p>
              <strong>In case of emergency, contact emergency services immediately.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Disclaimer;