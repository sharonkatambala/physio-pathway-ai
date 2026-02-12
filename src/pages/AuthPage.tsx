import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, profile, role } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const doRedirect = async () => {
      if (!user || !role) return;

      if (role === 'physiotherapist') {
        navigate('/physiotherapist-dashboard', { replace: true });
        return;
      }

      // role === 'patient'
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

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as 'patient' | 'physiotherapist',
    phone: '',
    age: '',
    sex: '',
    occupation: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast({
        title: t('auth.loginError'),
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    } else {
      toast({
        title: t('auth.success'),
        description: t('auth.loginSuccess')
      });
      // Redirect will happen via useEffect when profile loads
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.passwordMismatch'),
        variant: "destructive"
      });
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
      occupation: signupData.occupation || null
    };

    const { error } = await signUp(signupData.email, signupData.password, userData);
    
    if (error) {
      toast({
        title: t('auth.signupError'),
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: t('auth.success'),
        description: t('auth.signupSuccess')
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('auth.backHome')}
        </Button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('auth.welcomeTitle')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('auth.welcomeSubtitle')}
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.loginTab')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signupTab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t('auth.loginTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>{t('auth.signupTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                        <Input
                          id="firstName"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">{t('auth.roleLabel')}</Label>
                      <Select value={signupData.role} onValueChange={(value: 'patient' | 'physiotherapist') => setSignupData({...signupData, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">{t('auth.rolePatient')}</SelectItem>
                          <SelectItem value="physiotherapist">{t('auth.rolePhysio')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>

                    {signupData.role === 'patient' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="age">{t('auth.age')}</Label>
                            <Input
                              id="age"
                              type="number"
                              value={signupData.age}
                              onChange={(e) => setSignupData({...signupData, age: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sex">{t('auth.sex')}</Label>
                            <Select value={signupData.sex} onValueChange={(value) => setSignupData({...signupData, sex: value})}>
                              <SelectTrigger>
                              <SelectValue placeholder={t('auth.sexSelect')} />
                              </SelectTrigger>
                              <SelectContent>
                              <SelectItem value="male">{t('auth.sexMale')}</SelectItem>
                              <SelectItem value="female">{t('auth.sexFemale')}</SelectItem>
                              <SelectItem value="other">{t('auth.sexOther')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="occupation">{t('auth.occupation')}</Label>
                          <Input
                            id="occupation"
                            value={signupData.occupation}
                            onChange={(e) => setSignupData({...signupData, occupation: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
