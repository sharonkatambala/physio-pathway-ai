import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Shield, CheckCircle2, Brain, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LegalDialog, { type LegalTopic } from '@/components/LegalDialog';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, profile, role } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const doRedirect = async () => {
      if (!user || !role) return;
      if (role === 'physiotherapist') {
        navigate('/physiotherapist-dashboard', { replace: true });
        return;
      }
      if (role === 'office_worker') {
        navigate('/office-dashboard', { replace: true });
        return;
      }
      try {
        const { data } = await (await import('@/integrations/supabase/client')).supabase
          .from('assessments')
          .select('id')
          .eq('patient_user_id', user.id)
          .limit(1);
        if (!data || data.length === 0) {
          navigate('/assessment', { replace: true });
        } else {
          navigate('/patient-dashboard', { replace: true });
        }
      } catch (e) {
        console.error('Error checking assessments', e);
        navigate('/patient-dashboard', { replace: true });
      }
    };
    doRedirect();
  }, [user, role, navigate]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as 'patient' | 'physiotherapist' | 'office_worker',
    phone: '',
    age: '',
    sex: '',
    occupation: ''
  });
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [legalTopic, setLegalTopic] = useState<LegalTopic | null>(null);

  const inputClass =
    'bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 focus-visible:border-primary/60';

  const [resetSending, setResetSending] = useState(false);

  const handleForgotPassword = async () => {
    const email = loginData.email.trim();
    if (!email) {
      toast({
        title: t('auth.error'),
        description: 'Enter your email above first, then click "Forgot password?".',
        variant: 'destructive',
      });
      return;
    }
    setResetSending(true);
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSending(false);
    if (error) {
      toast({ title: t('auth.error'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Check your email',
      description: `We sent a password reset link to ${email}.`,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: t('auth.loginError'), description: error.message, variant: 'destructive' });
      setLoading(false);
    } else {
      toast({ title: t('auth.success'), description: t('auth.loginSuccess') });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: t('auth.error'), description: t('auth.passwordMismatch'), variant: 'destructive' });
      return;
    }
    if (signupData.role === 'physiotherapist' && !signupData.phone.trim()) {
      toast({ title: t('auth.error'), description: 'Phone number is required for physiotherapists.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const userData = {
      first_name: signupData.firstName,
      last_name: signupData.lastName,
      role: signupData.role,
      phone: signupData.phone || null,
      age: signupData.age ? parseInt(signupData.age) : null,
      sex: signupData.sex || null,
      occupation: signupData.occupation || null,
      email: signupData.email
    };
    const { error } = await signUp(signupData.email, signupData.password, userData);
    if (error) {
      toast({ title: t('auth.signupError'), description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: t('auth.success'),
        description: signupData.role === 'physiotherapist'
          ? 'Account created. You can upload a profile photo later in settings.'
          : t('auth.signupSuccess')
      });
    }
    setLoading(false);
  };

  const features = [
    { icon: Brain, text: 'AI-powered personalised assessment' },
    { icon: CheckCircle2, text: 'Evidence-based exercise programs' },
    { icon: TrendingUp, text: 'Real-time progress monitoring' },
    { icon: Shield, text: 'Certified physiotherapist network' },
  ];

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Brand panel (desktop only) ── */}
      <div className="hidden lg:flex w-[440px] flex-shrink-0 flex-col justify-between p-10 bg-gradient-hero relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3 blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 mb-14 opacity-90 hover:opacity-100 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-soft">
              <img
                src="/logo.png"
                alt="ErgoCare+ logo"
                className="w-full h-full object-contain bg-white"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/ergocare-favicon.svg'; }}
              />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">ErgoCare+</span>
          </button>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white leading-snug mb-3">
            Professional physiotherapy,<br />powered by AI.
          </h1>
          <p className="text-white/75 text-lg leading-relaxed mb-10">
            Get personalised exercise programs, connect with certified physiotherapists, and track your full recovery.
          </p>

          {/* Features */}
          <ul className="space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-white/90 text-base font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom trust strip */}
        <div className="relative z-10 flex gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/15 rounded-lg px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[12px] text-white/80 font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/15 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[12px] text-white/80 font-medium">Secure & Private</span>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-border">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-xs">
              <img
                src="/logo.png"
                alt="ErgoCare+ logo"
                className="w-full h-full object-contain bg-white"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/ergocare-favicon.svg'; }}
              />
            </div>
            <span className="font-extrabold text-foreground tracking-tight">ErgoCare+</span>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-[400px]">

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-7">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAuthTab(tab)}
                  className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-150 ${
                    authTab === tab
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            {/* ── Login form ── */}
            {authTab === 'login' && (
              <div>
                <h2 className="text-[22px] font-bold text-foreground mb-1">Welcome back</h2>
                <p className="text-muted-foreground text-sm mb-6">Sign in to your ErgoCare+ account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={resetSending}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors disabled:opacity-60"
                      >
                        {resetSending ? 'Sending...' : 'Forgot password?'}
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className={inputClass}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-hero shadow-soft text-[15px] font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? t('auth.signingIn') : t('auth.signIn')}
                  </Button>
                </form>
              </div>
            )}

            {/* ── Sign-up form ── */}
            {authTab === 'signup' && (
              <div>
                <h2 className="text-[22px] font-bold text-foreground mb-1">Create your account</h2>
                <p className="text-muted-foreground text-sm mb-6">Join ErgoCare+ and start your recovery journey</p>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role">{t('auth.roleLabel')}</Label>
                    <Select value={signupData.role} onValueChange={(value: 'patient' | 'physiotherapist' | 'office_worker') => setSignupData({ ...signupData, role: value })}>
                      <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">{t('auth.rolePatient')}</SelectItem>
                        <SelectItem value="office_worker">{t('auth.roleOffice')}</SelectItem>
                        <SelectItem value="physiotherapist">{t('auth.rolePhysio')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {signupData.role === 'patient' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="age">{t('auth.age')}</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="25"
                            value={signupData.age}
                            onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="sex">{t('auth.sex')}</Label>
                          <Select value={signupData.sex} onValueChange={(value) => setSignupData({ ...signupData, sex: value })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder={t('auth.sexSelect')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t('auth.sexMale')}</SelectItem>
                              <SelectItem value="female">{t('auth.sexFemale')}</SelectItem>
                              <SelectItem value="other">{t('auth.sexOther')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="occupation">{t('auth.occupation')}</Label>
                        <Input
                          id="occupation"
                          placeholder="Software Engineer"
                          value={signupData.occupation}
                          onChange={(e) => setSignupData({ ...signupData, occupation: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">
                      {t('auth.phone')}
                      {signupData.role !== 'physiotherapist' && (
                        <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                      )}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+255 700 000 000"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required={signupData.role === 'physiotherapist'}
                      className={inputClass}
                    />
                  </div>

                  {signupData.role === 'physiotherapist' && (
                    <p className="text-xs text-muted-foreground">
                      You can add a profile photo from your profile page after signing up.
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-hero shadow-soft text-[15px] font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                  </Button>
                </form>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to ErgoCare+'s{' '}
              <button type="button" onClick={() => setLegalTopic('terms')} className="underline hover:text-foreground transition-colors">Terms</button>
              {' '}and{' '}
              <button type="button" onClick={() => setLegalTopic('privacy')} className="underline hover:text-foreground transition-colors">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>

      <LegalDialog topic={legalTopic} onClose={() => setLegalTopic(null)} />
    </div>
  );
};

export default AuthPage;
