import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { KeyRound, Loader2 } from 'lucide-react';

/**
 * Landing page for the Supabase password-recovery email link.
 * The link signs the user in with a temporary recovery session;
 * this page lets them set a new password.
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(tr('Password must be at least 6 characters.', 'Nenosiri lazima liwe na herufi 6 au zaidi.'));
      return;
    }
    if (password !== confirm) {
      toast.error(tr('Passwords do not match.', 'Manenosiri hayalingani.'));
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(tr('Could not update password', 'Imeshindwa kusasisha nenosiri'), { description: error.message });
      return;
    }
    toast.success(tr('Password updated', 'Nenosiri limesasishwa'), {
      description: tr('You are signed in with your new password.', 'Umeingia kwa nenosiri lako jipya.'),
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{tr('Set a new password', 'Weka nenosiri jipya')}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSession === false ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {tr(
                  'This reset link is invalid or has expired. Request a new one from the sign-in page.',
                  'Kiungo hiki cha kubadilisha nenosiri si sahihi au kimeisha muda. Omba kipya kwenye ukurasa wa kuingia.'
                )}
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-hero shadow-soft">
                {tr('Back to sign in', 'Rudi kuingia')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">{tr('New password', 'Nenosiri jipya')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">{tr('Confirm new password', 'Thibitisha nenosiri jipya')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={saving || hasSession === null} className="w-full bg-gradient-hero shadow-soft">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? tr('Saving...', 'Inahifadhi...') : tr('Update password', 'Sasisha nenosiri')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
