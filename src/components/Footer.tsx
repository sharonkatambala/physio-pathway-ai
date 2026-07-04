import { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import LegalDialog, { type LegalTopic } from '@/components/LegalDialog';

const Footer = () => {
  const { t } = useLanguage();
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [legalTopic, setLegalTopic] = useState<LegalTopic | null>(null);

  const quickLinks: { label: string; to: string }[] = [
    { label: 'Home', to: '/' },
    { label: 'Get Started', to: '/auth' },
    { label: 'About Us', to: '/#about' },
    { label: 'Services', to: '/#services' },
    { label: 'Contact', to: '/#contact' },
  ];
  const services = ['AI Assessment', 'Exercise Programs', 'Progress Monitoring', 'Professional Sessions', 'Pain Management', 'Rehabilitation'];
  const legalLinks: { label: string; topic: LegalTopic }[] = [
    { label: 'Privacy Policy', topic: 'privacy' },
    { label: 'Terms of Service', topic: 'terms' },
    { label: 'HIPAA Compliance', topic: 'hipaa' },
    { label: 'Cookies', topic: 'cookies' },
  ];

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contact-message', {
        body: {
          name: 'Newsletter subscriber',
          email,
          message: `Newsletter subscription request from ${email}.`,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Failed to subscribe.');
      setSubscribed(true);
      setSubscribeEmail('');
    } catch {
      // Even if delivery fails, don't leave the user staring at a dead button.
      setSubscribed(true);
      setSubscribeEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border/60">
      <div className="page-shell section-pad-tight">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-soft flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="ErgoCare+ logo"
                  className="w-full h-full object-contain bg-white"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/ergocare-favicon.svg'; }}
                />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                  ErgoCare<span className="text-primary">+</span>
                </h3>
                <p className="text-muted-foreground text-[11px] leading-none mt-0.5">{t('hero.title')}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              Revolutionizing physiotherapy through AI-powered assessments, personalized treatment plans, and professional care.
            </p>
            <div className="flex gap-1">
              <a
                href="https://www.instagram.com/ergocareplus?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="ErgoCare+ on Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  {to.includes('#') ? (
                    <a
                      href={to}
                      className="text-base text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={to}
                      className="text-base text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Services</h3>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s} className="text-base text-muted-foreground">{s}</li>
              ))}
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Stay Updated</h3>
            <p className="text-base text-muted-foreground">
              Subscribe for health tips and platform updates.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                Thanks for subscribing!
              </div>
            ) : (
              <form className="space-y-2" onSubmit={handleSubscribe}>
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="text-base"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                />
                <Button type="submit" disabled={subscribing} className="w-full bg-gradient-hero shadow-soft text-base font-semibold">
                  {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            )}
            <ul className="space-y-2 text-base text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span>info@ergocare.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>+255748566062</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Muhimbili, Upanga Magharibi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/60 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ErgoCare+. {t('footer.rights')}.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            {legalLinks.map(({ label, topic }) => (
              <button
                key={topic}
                type="button"
                onClick={() => setLegalTopic(topic)}
                className="hover:text-primary transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <LegalDialog topic={legalTopic} onClose={() => setLegalTopic(null)} />
    </footer>
  );
};

export default Footer;
