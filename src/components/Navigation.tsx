import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, Calendar, Users, BookOpen, User, LogOut, Languages, Target } from 'lucide-react';
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
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!role) return '/';
    return role === 'patient' ? '/patient-dashboard' : '/physiotherapist-dashboard';
  };

  const getNavigationItems = () => {
    if (!user || !role) return [];
    
    if (role === 'patient') {
      return [
        { name: t('nav.assessment'), href: '/assessment', icon: Activity },
        { name: t('nav.exercises'), href: '/exercises', icon: BookOpen },
        { name: t('nav.progress'), href: '/progress', icon: Users },
        { name: t('nav.programs') || 'Programs', href: '/programs', icon: Target },
        { name: t('nav.bookSession'), href: '/booking', icon: Calendar },
      ];
    } else {
      return [
        { name: t('nav.patients'), href: '/physiotherapist-dashboard', icon: Users },
        { name: t('nav.exercises'), href: '/exercises', icon: BookOpen },
        { name: t('nav.sessions'), href: '/booking', icon: Calendar },
      ];
    }
  };

  const navigation = getNavigationItems();
  const isHome = location.pathname === '/';

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Ergo<span className="text-blue-500">Care</span><span className="text-green-500">+</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isHome ? (
              // Homepage behavior: if user is logged in, show Dashboard CTA and Sign Out; otherwise show public anchors
              user ? (
                <div className="flex items-center space-x-2">
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{profile?.first_name || t('nav.dashboard')}</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </Button>
                </div>
              ) : (
                // For visitors: Sign In + Get Started only
                <div className="flex items-center space-x-2">
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
                    <Link to={getDashboardLink()}>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{profile?.first_name || t('nav.dashboard')}</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>{t('nav.signOut')}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
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
                    <Link to={getDashboardLink()}>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        {profile?.first_name || t('nav.dashboard')}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  </div>
                ) : (
                  // For visitors: Sign In + Get Started only
                  <div className="flex flex-col space-y-2 px-3 pt-2">
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
                        <Link to={getDashboardLink()}>
                          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            {profile?.first_name || t('nav.dashboard')}
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('nav.signOut')}
                        </Button>
                      </>
                    ) : (
                      <>
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