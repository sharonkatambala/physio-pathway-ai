import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marathon Runner",
      condition: "Knee Injury Recovery",
      rating: 5,
      text: "FIZIO AI helped me recover from my knee injury faster than I ever expected. The personalized exercise program and AI assessment were incredible. I'm back to running marathons!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b376?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Office Worker",
      condition: "Chronic Back Pain",
      rating: 5,
      text: "As someone who sits all day, my back pain was getting worse. FIZIO AI's ergonomics education and exercise program completely transformed my daily routine. No more pain!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Senior Citizen",
      condition: "Post-Surgery Rehab",
      rating: 5,
      text: "After my hip surgery, FIZIO AI guided me through every step of recovery. The video demonstrations were so helpful, and my physiotherapist could monitor my progress remotely.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Dr. James Wilson",
      role: "Physiotherapist",
      condition: "Professional User",
      rating: 5,
      text: "FIZIO AI has revolutionized how I work with my patients. The AI assessment tools are incredibly accurate, and the platform makes patient monitoring so much more efficient.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Lisa Thompson",
      role: "Athlete",
      condition: "Shoulder Rehabilitation",
      rating: 5,
      text: "The sports injury rehabilitation program was exactly what I needed. The AI understood my specific sport requirements and created a plan that got me back to peak performance.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Robert Davis",
      role: "Construction Worker",
      condition: "Work-Related Injury",
      rating: 5,
      text: "FIZIO AI made physiotherapy accessible for someone like me who couldn't always make it to appointments. The flexibility and quality of care exceeded my expectations.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            What Our Patients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied patients who have transformed their recovery journey with FIZIO AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-2xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary font-medium">{testimonial.condition}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-card rounded-2xl p-8 border border-border max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">10,000+</div>
                <div className="text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Join thousands of patients who have already experienced the future of physiotherapy with FIZIO AI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;