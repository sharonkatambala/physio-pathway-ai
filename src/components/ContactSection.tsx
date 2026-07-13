import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
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

  const contactItems = [
    { icon: Mail, label: t('footer.email'), value: 'info@ergocare.com' },
    { icon: Phone, label: t('footer.phone'), value: '+255748566062' },
    { icon: MapPin, label: t('contact.address'), value: 'Muhimbili, Upanga Magharibi 65001' },
    { icon: Clock, label: 'Support Hours', value: '24/7 AI, Mon-Fri 9AM-6PM EAT Human' },
  ];

  const reasons = [
    'Data protected under Tanzania\'s PDPA',
    'Evidence-based treatment plans',
    '24/7 AI-powered support',
    'Certified physiotherapist network',
  ];

  return (
    <section id="contact" className="section-pad bg-card/70">
      <div className="page-shell">
        <div className="text-center mb-14">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] mb-3">Contact</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{t('contact.title')}</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: info */}
          <div className="space-y-6">
            <h3 className="text-foreground">{t('contact.info')}</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card rounded-xl border border-border/60 p-4 flex items-start gap-3 shadow-xs">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-base font-medium text-foreground mt-0.5 leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-xs">
              <h4 className="text-base font-bold text-foreground mb-4">Why Choose ErgoCare+?</h4>
              <ul className="space-y-2.5">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-center gap-2.5 text-base text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-card rounded-2xl border border-border/60 p-7 shadow-card">
            <h3 className="text-foreground mb-6">{t('contact.send')}</h3>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-base font-semibold text-foreground">{t('contact.name')}</label>
                  <Input
                    placeholder={t('contact.name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base font-semibold text-foreground">{t('contact.email')}</label>
                  <Input
                    type="email"
                    placeholder={t('contact.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <Input
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">{t('contact.message')}</label>
                <Textarea
                  placeholder={t('contact.message')}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full bg-gradient-hero shadow-soft font-bold gap-2" size="lg" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : t('contact.send')}
              </Button>

              {status !== "idle" && (
                <p className={`text-sm text-center ${status === "success" ? "text-success" : "text-destructive"}`} role="status">
                  {statusMessage}
                </p>
              )}
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
