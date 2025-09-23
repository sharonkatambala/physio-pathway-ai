import { Shield, Users, Award, Heart } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                About FIZIO AI
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Revolutionizing physiotherapy through artificial intelligence, connecting patients with expert care and personalized treatment plans.
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Founded by a team of physiotherapy professionals and AI experts, FIZIO AI bridges the gap between traditional physiotherapy and modern technology. Our platform provides comprehensive assessment tools, personalized exercise programs, and continuous monitoring to ensure optimal recovery outcomes.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                With over 10,000 patients successfully treated and a network of certified physiotherapists, we're committed to making quality physiotherapy accessible to everyone, anywhere.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-card rounded-xl border border-border">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">10k+</div>
                <div className="text-sm text-muted-foreground">Patients Treated</div>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border">
                <Award className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Our Mission</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Evidence-Based Care</h4>
                    <p className="text-sm text-muted-foreground">All treatment plans are based on clinical research and best practices.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Patient-Centered</h4>
                    <p className="text-sm text-muted-foreground">Every program is tailored to individual needs and goals.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Accessible Care</h4>
                    <p className="text-sm text-muted-foreground">Making quality physiotherapy accessible to everyone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;