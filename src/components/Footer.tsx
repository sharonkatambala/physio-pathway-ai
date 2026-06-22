import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = ['Home', 'Get Started', 'About Us', 'Services', 'Contact'];
  const services = ['AI Assessment', 'Exercise Programs', 'Progress Monitoring', 'Professional Sessions', 'Pain Management', 'Rehabilitation'];

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
              {quickLinks.map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'Home' ? '/' : '/auth'}
                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
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
            <div className="space-y-2">
              <Input placeholder="Enter your email" className="text-base" />
              <Button className="w-full bg-gradient-hero shadow-soft text-base font-semibold">
                Subscribe
              </Button>
            </div>
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
            {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookies'].map((item) => (
              <Link key={item} to="#" className="hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
