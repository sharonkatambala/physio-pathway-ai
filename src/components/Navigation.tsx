import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, Calendar, Users, BookOpen, LogOut, Languages, Target, Moon, Sun, Video, LayoutDashboard, FileText, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('ergocare-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [fontScale, setFontScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 100;
    const saved = window.localStorage.getItem('ergocare-font-scale');
    const parsed = saved ? Number(saved) : 100;
    return Number.isFinite(parsed) ? Math.min(125, Math.max(90, parsed)) : 100;
  });
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getNavigationItems = () => {
    if (!user || !role) return [];
    
    if (role === 'patient') {
      return [
        { name: t('nav.assessment'), href: '/assessment', icon: Activity },
        { name: t('nav.exercises'), href: '/exercises', icon: BookOpen },
        { name: t('nav.progress'), href: '/progress', icon: Users },
        { name: t('nav.myPrograms'), href: '/programs', icon: Target },
        { name: t('nav.bookSession'), href: '/booking', icon: Calendar },
      ];
    } else {
      return [
        { name: t('nav.dashboard'), href: '/physiotherapist-dashboard', icon: LayoutDashboard },
        { name: t('nav.patients'), href: '/physio-patients', icon: Users },
        { name: t('nav.sessions'), href: '/physio-sessions', icon: Calendar },
        { name: t('nav.videos'), href: '/physio-videos', icon: Video },
        { name: t('nav.resources'), href: '/physio-resources', icon: FileText },
        { name: t('nav.settings'), href: '/physio-settings', icon: Settings },
      ];
    }
  };

  const navigation = getNavigationItems();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem('ergocare-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const base = Math.round(16 * (fontScale / 100));
    root.style.setProperty('--base-font-size', `${base}px`);
    window.localStorage.setItem('ergocare-font-scale', String(fontScale));
  }, [fontScale]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const increaseFont = () => setFontScale((v) => Math.min(125, v + 5));
  const decreaseFont = () => setFontScale((v) => Math.max(90, v - 5));

  const LanguageToggle = (
    <div className="flex items-center rounded-full border border-border bg-card/70 p-1 shadow-soft">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
          language === 'en'
            ? 'bg-gradient-hero text-primary-foreground shadow-soft'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('sw')}
        aria-pressed={language === 'sw'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
          language === 'sw'
            ? 'bg-gradient-hero text-primary-foreground shadow-soft'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        SW
      </button>
    </div>
  );

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="page-shell">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Ergo<span className="text-primary">Care</span><span className="text-primary">+</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isHome ? (
              user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/assessment">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <span>{t('nav.assessment')}</span>
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={decreaseFont} className="flex items-center" title="Decrease text size">
                      A-
                    </Button>
                    <Button variant="ghost" size="sm" onClick={increaseFont} className="flex items-center" title="Increase text size">
                      A+
                    </Button>
                  </div>
                  {LanguageToggle}
                  <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex items-center">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={decreaseFont} className="flex items-center" title="Decrease text size">
                      A-
                    </Button>
                    <Button variant="ghost" size="sm" onClick={increaseFont} className="flex items-center" title="Increase text size">
                      A+
                    </Button>
                  </div>
                  {LanguageToggle}
                  <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex items-center">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-gradient-hero shadow-soft">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              // Regular app nav (user-specific links)
              <>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Auth Buttons */}
                {user ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={decreaseFont} className="flex items-center" title="Decrease text size">
                        A-
                      </Button>
                      <Button variant="ghost" size="sm" onClick={increaseFont} className="flex items-center" title="Increase text size">
                        A+
                      </Button>
                    </div>
                    {LanguageToggle}
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex items-center">
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>{t('nav.signOut')}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={decreaseFont} className="flex items-center" title="Decrease text size">
                        A-
                      </Button>
                      <Button variant="ghost" size="sm" onClick={increaseFont} className="flex items-center" title="Increase text size">
                        A+
                      </Button>
                    </div>
                    {LanguageToggle}
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex items-center">
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Link to="/auth">
                      <Button variant="outline" size="sm">
                        {t('nav.signIn')}
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-hero shadow-soft">
                        {t('nav.getStarted')}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              {isHome ? (
                user ? (
                  <div className="flex flex-col space-y-2 px-3 pt-2">
                    <Link to="/assessment">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                        {t('nav.assessment')}
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2 px-1">
                      <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { decreaseFont(); setIsOpen(false); }}>
                        A-
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { increaseFont(); setIsOpen(false); }}>
                        A+
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
                      {LanguageToggle}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                      {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      Theme
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 px-3 pt-2">
                    <div className="flex items-center gap-2 px-1">
                      <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { decreaseFont(); setIsOpen(false); }}>
                        A-
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { increaseFont(); setIsOpen(false); }}>
                        A+
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
                      {LanguageToggle}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                      {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      Theme
                    </Button>
                    <Link to="/auth">
                      <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                        {t('nav.signIn')}
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => setIsOpen(false)}>
                        {t('nav.getStarted')}
                      </Button>
                    </Link>
                  </div>
                )
              ) : (
                <>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`block px-3 py-2 rounded-md text-base transition-all duration-200 flex items-center space-x-2 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  <div className="flex flex-col space-y-2 px-3 pt-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-1">
                          <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { decreaseFont(); setIsOpen(false); }}>
                            A-
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { increaseFont(); setIsOpen(false); }}>
                            A+
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
                          {LanguageToggle}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                          {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                          Theme
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('nav.signOut')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-1">
                          <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { decreaseFont(); setIsOpen(false); }}>
                            A-
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { increaseFont(); setIsOpen(false); }}>
                            A+
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
                          {LanguageToggle}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                          {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                          Theme
                        </Button>
                        <Link to="/auth">
                          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                            {t('nav.signIn')}
                          </Button>
                        </Link>
                        <Link to="/auth">
                          <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => setIsOpen(false)}>
                            {t('nav.getStarted')}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
