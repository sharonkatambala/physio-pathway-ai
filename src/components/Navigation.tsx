import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, Calendar, Users, BookOpen, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    return profile.role === 'patient' ? '/patient-dashboard' : '/physiotherapist-dashboard';
  };

  const getNavigationItems = () => {
    if (!user || !profile) return [];
    
    if (profile.role === 'patient') {
      return [
        { name: 'Assessment', href: '/assessment', icon: Activity },
        { name: 'Exercises', href: '/exercises', icon: BookOpen },
        { name: 'Progress', href: '/dashboard', icon: Users },
        { name: 'Book Session', href: '/booking', icon: Calendar },
      ];
    } else {
      return [
        { name: 'Patients', href: '/physiotherapist-dashboard', icon: Users },
        { name: 'Exercises', href: '/exercises', icon: BookOpen },
        { name: 'Sessions', href: '/booking', icon: Calendar },
      ];
    }
  };

  const navigation = getNavigationItems();

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">FIZIO AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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
              <div className="flex items-center space-x-2 ml-4">
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{profile?.first_name || 'Dashboard'}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-hero shadow-soft">
                    Get Started
                  </Button>
                </Link>
              </div>
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
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-2 px-3 pt-2">
                {user ? (
                  <>
                    <Link to={getDashboardLink()}>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        {profile?.first_name || 'Dashboard'}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;