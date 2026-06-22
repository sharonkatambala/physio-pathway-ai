import { useEffect, useState, type MouseEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, Users, LogOut, Target, Video, LayoutDashboard, FileText, Settings, MessageSquare, UserRound } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Logo returns to the hero / top of the home page in one click.
  const handleLogoClick = (e: MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if (location.hash) navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getNavigationItems = () => {
    if (!user || !role) return [];
    if (role === 'patient') {
      return [
        { name: t('nav.dashboard'), href: '/patient-dashboard', icon: LayoutDashboard },
        { name: t('nav.progress'), href: '/progress', icon: Target },
        { name: t('nav.myPrograms'), href: '/programs', icon: FileText },
        { name: t('nav.bookSession'), href: '/booking', icon: Calendar },
        { name: t('nav.messages'), href: '/messages', icon: MessageSquare },
      ];
    } else {
      return [
        { name: t('nav.dashboard'), href: '/physiotherapist-dashboard', icon: LayoutDashboard },
        { name: t('nav.patients'), href: '/physio-patients', icon: Users },
        { name: t('nav.sessions'), href: '/physio-sessions', icon: Calendar },
        { name: t('nav.messages'), href: '/messages', icon: MessageSquare },
        { name: t('nav.videos'), href: '/physio-videos', icon: Video },
        { name: t('nav.profile'), href: '/physio-profile', icon: UserRound },
      ];
    }
  };

  const navigation = getNavigationItems();
  const isHome = location.pathname === '/';

  // Public links available to everyone (no login required).
  // `to` = a real route; `hash` = a section on the home page.
  const publicNav: { name: string; to?: string; hash?: string }[] = [
    { name: t('nav.services'), hash: 'services' },
    { name: t('nav.howItWorks'), hash: 'how-it-works' },
    { name: t('nav.about'), hash: 'about' },
    { name: t('nav.exercises'), to: '/exercises' },
    { name: t('nav.contact'), hash: 'contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Settings entry point — theme, text size & language now live on /settings ── */
  const settingsLink = (
    <Link
      to="/settings"
      title={t('nav.settings')}
      aria-label={t('nav.settings')}
      className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-colors ${
        location.pathname === '/settings'
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-muted/60 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <Settings className="h-4 w-4" />
    </Link>
  );

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
    <nav className={`relative bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl transition-all duration-200 ${scrolled ? 'shadow-[0_8px_32px_-6px_hsl(140_15%_13%/0.15),0_2px_8px_hsl(140_15%_13%/0.06)]' : 'shadow-card'}`}>
      <div className="page-shell">
        <div className="flex justify-between items-center h-[68px]">

          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex-shrink-0 flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-soft group-hover:shadow-glow transition-shadow duration-200">
              <img
                src="/logo.png"
                alt="ErgoCare+ logo"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/ergocare-favicon.svg';
                }}
              />
            </div>
            <span className="text-[1.125rem] font-bold tracking-[-0.03em] text-foreground">
              Ergo<span className="text-primary">Care</span><span className="text-primary">+</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              isHome ? (
                <div className="flex items-center gap-4">
                  <Link to={role === 'patient' ? '/patient-dashboard' : '/physiotherapist-dashboard'} className="text-[15px] font-medium text-foreground/70 hover:text-foreground transition-colors">
                    {t('nav.dashboard')}
                  </Link>
                  {settingsLink}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <>
                  {/* App nav links */}
                  <div className="flex items-center gap-1 mr-3">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    {settingsLink}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </>
              )
            ) : (
              /* Logged out — public links available to everyone, on every page */
              <>
                <div className="flex items-center gap-1 mr-3">
                  {publicNav.map((item) => {
                    const isActive = item.to ? location.pathname === item.to : false;
                    return (
                      <Link
                        key={item.name}
                        to={item.to ?? `/#${item.hash}`}
                        className={`px-3.5 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4">
                  {settingsLink}
                  <Link to="/auth">
                    <Button className="bg-gradient-hero shadow-soft text-[14px] font-semibold px-5 h-[40px] rounded-full">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-card/98 backdrop-blur-md border border-border/60 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/settings'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </>
              ) : (
                <>
                  {publicNav.map((item) => {
                    const isActive = item.to ? location.pathname === item.to : false;
                    return (
                      <Link
                        key={item.name}
                        to={item.to ?? `/#${item.hash}`}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/settings'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-hero mt-2">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </div>
  );
};

export default Navigation;
