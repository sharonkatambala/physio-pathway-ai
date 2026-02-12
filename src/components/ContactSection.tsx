import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ContactSection = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("contact-message", {
        body: { name, email, message, company },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to send message.");
      }

      setStatus("success");
      setStatusMessage("Message sent. We will get back to you soon.");
      setShowSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setCompany("");
    } catch (err) {
      setStatus("error");
      setStatusMessage((err as Error).message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="section-pad bg-background">
      <div className="page-shell">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('contact.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground">{t('contact.info')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{t('footer.email')}</div>
                    <div className="text-muted-foreground">info@ergocare.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{t('footer.phone')}</div>
                    <div className="text-muted-foreground">+255748566062</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{t('contact.address')}</div>
                    <div className="text-muted-foreground">Muhimbili, Upanga Magharibi 65001</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Support Hours</div>
                    <div className="text-muted-foreground">24/7 AI Support - Mon-Fri 9AM-6PM Human Support</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-card rounded-2xl p-8 border border-border">
              <h4 className="text-lg font-semibold text-foreground mb-4">Why Choose ErgoCare+?</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>HIPAA compliant and secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Evidence-based treatment plans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>24/7 AI-powered support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Certified physiotherapist network</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
            <h3 className="text-2xl font-semibold text-foreground mb-6">{t('contact.send')}</h3>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('contact.name')}</label>
                  <Input
                    placeholder={t('contact.name')}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('contact.email')}</label>
                  <Input
                    type="email"
                    placeholder={t('contact.email')}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <label className="text-sm font-medium text-foreground">Company</label>
                <Input
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="Company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('contact.message')}</label>
                <Textarea 
                  placeholder={t('contact.message')}
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </div>
              
              <Button className="w-full bg-gradient-hero shadow-glow" size="lg" disabled={submitting}>
                {submitting ? "Sending..." : t('contact.send')}
              </Button>

              {status !== "idle" ? (
                <div
                  className={`text-sm ${
                    status === "success" ? "text-success" : "text-destructive"
                  }`}
                  role="status"
                >
                  {statusMessage}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thanks for reaching out</DialogTitle>
            <DialogDescription>
              We received your message and will reply as soon as possible.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ContactSection;
