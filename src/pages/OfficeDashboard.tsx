import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { wsZoneColor, wsZoneLabel, wsHighRisk, type WsZone } from '@/lib/workstation';
import {
  ClipboardCheck, ScanLine, Stethoscope, Bell, BellOff, Sparkles, ArrowRight,
  Activity, TrendingDown, Loader2, Dumbbell,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type OfficeProfile = {
  user_id: string;
  desk_hours_per_day: number | null;
  sitting_streak_minutes: number | null;
  pain_areas: string[] | null;
  uses_standing_desk: boolean | null;
  reminder_interval_min: number | null;
  reminders_enabled: boolean | null;
};

type ErgoRow = { id: string; created_at: string; risk_score: number | null; zone: string | null };
type PostureRow = { id: string; created_at: string; overall_score: number | null };

const PAIN_AREAS = [
  { key: 'neck', en: 'Neck', sw: 'Shingo' },
  { key: 'back', en: 'Back', sw: 'Mgongo' },
  { key: 'shoulder', en: 'Shoulders', sw: 'Mabega' },
  { key: 'wrist', en: 'Wrists', sw: 'Vifundo' },
];

const OfficeDashboard = () => {
  const { user, role, profile, loading } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'sw' ? 'sw' : 'en';
  const tr = (en: string, sw: string) => (lang === 'sw' ? sw : en);
  const navigate = useNavigate();

  const [office, setOffice] = useState<OfficeProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [ergo, setErgo] = useState<ErgoRow[]>([]);
  const [posture, setPosture] = useState<PostureRow[]>([]);

  // onboarding form
  const [form, setForm] = useState({ deskHours: '', sitting: '60', pains: [] as string[], standing: false });
  const [savingOnboard, setSavingOnboard] = useState(false);

  const displayName = (profile?.first_name || user?.email?.split('@')[0] || '').trim();

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: op }, { data: ea }, { data: ps }] = await Promise.all([
      supabase.from('office_profiles').select('*').eq('user_id', user.id).limit(1),
      supabase.from('ergonomic_assessments').select('id, created_at, risk_score, zone').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('posture_sessions').select('id, created_at, overall_score').eq('patient_user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setOffice((op?.[0] as OfficeProfile) ?? null);
    setErgo((ea as ErgoRow[]) ?? []);
    setPosture((ps as PostureRow[]) ?? []);
    setLoaded(true);
  }, [user]);

  useEffect(() => { if (user) load(); }, [user, load]);

  // Movement reminders while the page is open.
  useEffect(() => {
    if (!office?.reminders_enabled) return;
    const ms = Math.max(5, office.reminder_interval_min || 45) * 60 * 1000;
    const id = setInterval(() => {
      toast(tr('Time to move', 'Wakati wa kutembea'), {
        description: tr('Stand up, stretch, and look away from your screen for a minute.', 'Simama, nyoosha mwili, na uachane na skrini kwa dakika moja.'),
      });
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ErgoCare+', { body: tr('Time to move - stand and stretch.', 'Wakati wa kutembea - simama na unyooshe.') });
      }
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [office?.reminders_enabled, office?.reminder_interval_min, lang]);

  const saveOffice = useCallback(async (updates: Partial<OfficeProfile>) => {
    if (!user) return;
    const payload = { user_id: user.id, ...office, ...updates, updated_at: new Date().toISOString() } as any;
    delete payload.updated_at; // let DB default handle if column missing
    setOffice((o) => ({ ...(o as OfficeProfile), ...updates }));
    const { error } = await supabase.from('office_profiles').upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
    if (error) toast.error(tr('Could not save', 'Imeshindwa kuhifadhi'), { description: error.message });
  }, [user, office, lang]);

  const completeOnboarding = async () => {
    if (!user) return;
    setSavingOnboard(true);
    const updates = {
      desk_hours_per_day: form.deskHours ? Number(form.deskHours) : null,
      sitting_streak_minutes: form.sitting ? Number(form.sitting) : null,
      pain_areas: form.pains,
      uses_standing_desk: form.standing,
      reminder_interval_min: 45,
      reminders_enabled: true,
    };
    const { error } = await supabase.from('office_profiles').upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
    setSavingOnboard(false);
    if (error) { toast.error(tr('Could not save', 'Imeshindwa kuhifadhi'), { description: error.message }); return; }
    await load();
    toast.success(tr('You are all set', 'Umekamilisha'));
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') toast.success(tr('Reminders on', 'Vikumbusho vimewashwa'));
  };

  const latestErgo = ergo[0];
  const latestPosture = posture[0];
  const ergoTrend = useMemo(
    () => [...ergo].reverse().slice(-10).map((e) => ({ date: new Date(e.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }), risk: e.risk_score ?? 0 })),
    [ergo]
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'physiotherapist') return <Navigate to="/physiotherapist-dashboard" replace />;
  if (!loaded) {
    return <div className="flex min-h-screen items-center justify-center">{tr('Loading...', 'Inapakia...')}</div>;
  }

  const togglePain = (key: string) =>
    setForm((f) => ({ ...f, pains: f.pains.includes(key) ? f.pains.filter((p) => p !== key) : [...f.pains, key] }));

  const StatCard = ({ label, value, hint, color }: { label: string; value: string; hint: string; color?: string }) => (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold" style={{ color: color || 'hsl(var(--foreground))' }}>{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="page-shell py-8 space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{tr('Welcome', 'Karibu')}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{displayName || tr('Office worker', 'Mfanyakazi wa ofisi')}</h1>
          <p className="text-sm text-muted-foreground">{tr('Protect your back, neck and wrists at your desk.', 'Linda mgongo, shingo na vifundo vyako dawatini.')}</p>
        </div>

        {/* First-time onboarding */}
        {!office ? (
          <Card className="border-primary/30 bg-primary/5 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                {tr('Set up your desk profile', 'Weka wasifu wa dawati lako')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tr('A few quick questions so we can tailor your tips and reminders.', 'Maswali machache ili tubinafsishe vidokezo na vikumbusho vyako.')}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deskHours">{tr('Hours at your desk per day', 'Masaa dawatini kwa siku')}</Label>
                  <Input id="deskHours" type="number" min="0" max="16" value={form.deskHours} onChange={(e) => setForm({ ...form, deskHours: e.target.value })} placeholder="8" />
                </div>
                <div className="space-y-1.5">
                  <Label>{tr('Typical sitting before a break', 'Muda wa kukaa kabla ya mapumziko')}</Label>
                  <Select value={form.sitting} onValueChange={(v) => setForm({ ...form, sitting: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{tr('About 30 minutes', 'Kama dakika 30')}</SelectItem>
                      <SelectItem value="60">{tr('About 1 hour', 'Kama saa 1')}</SelectItem>
                      <SelectItem value="120">{tr('2 hours or more', 'Saa 2 au zaidi')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tr('Any discomfort areas? (optional)', 'Maeneo yenye usumbufu? (hiari)')}</Label>
                <div className="flex flex-wrap gap-2">
                  {PAIN_AREAS.map((p) => {
                    const active = form.pains.includes(p.key);
                    return (
                      <button key={p.key} type="button" onClick={() => togglePain(p.key)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                        {lang === 'sw' ? p.sw : p.en}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="standing" checked={form.standing} onCheckedChange={(v) => setForm({ ...form, standing: v })} />
                <Label htmlFor="standing" className="cursor-pointer">{tr('I use a standing desk', 'Natumia dawati la kusimama')}</Label>
              </div>
              <Button onClick={completeOnboarding} disabled={savingOnboard} className="bg-gradient-hero shadow-soft">
                {savingOnboard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {tr('Continue', 'Endelea')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label={tr('Workstation risk', 'Hatari ya eneo la kazi')}
                value={latestErgo?.risk_score != null ? `${latestErgo.risk_score}/10` : tr('Not yet', 'Bado')}
                hint={latestErgo?.zone ? wsZoneLabel(latestErgo.zone as WsZone, lang) : tr('Run a workstation check', 'Fanya ukaguzi')}
                color={latestErgo?.zone ? wsZoneColor(latestErgo.zone as WsZone) : undefined}
              />
              <StatCard
                label={tr('Posture score', 'Alama ya mkao')}
                value={latestPosture?.overall_score != null ? `${latestPosture.overall_score}/100` : tr('Not yet', 'Bado')}
                hint={tr('From your camera check', 'Kutoka ukaguzi wa kamera')}
              />
              <StatCard
                label={tr('Checks done', 'Ukaguzi uliofanyika')}
                value={`${ergo.length + posture.length}`}
                hint={tr('Workstation + posture', 'Eneo la kazi + mkao')}
              />
            </div>

            {/* High risk escalation */}
            {latestErgo && wsHighRisk(latestErgo.risk_score ?? 0) && (
              <Card className="border-destructive/30 bg-destructive/5 shadow-card">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground">
                    {tr('Your last workstation check was high risk. A physiotherapist can review your setup and any pain.', 'Ukaguzi wako wa mwisho ulikuwa hatari kubwa. Physiotherapist anaweza kukagua mpangilio wako na maumivu.')}
                  </p>
                  <Button onClick={() => navigate('/booking')} className="bg-gradient-hero shadow-soft flex-shrink-0">
                    <Stethoscope className="mr-2 h-4 w-4" />{tr('Book a physiotherapist', 'Weka physiotherapist')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: ClipboardCheck, title: tr('Workstation Check', 'Ukaguzi wa Eneo'), desc: tr('Desk ergonomics in a minute', 'Ergonomiki ya dawati'), to: '/workstation' },
                { icon: ScanLine, title: tr('Posture Check', 'Ukaguzi wa Mkao'), desc: tr('Camera posture score', 'Alama ya mkao kwa kamera'), to: '/posture' },
                { icon: Dumbbell, title: tr('Desk Exercises', 'Mazoezi ya Dawati'), desc: tr('Short relief routines', 'Mazoezi mafupi'), to: '/programs' },
                { icon: Stethoscope, title: tr('Talk to a physio', 'Ongea na physio'), desc: tr('Book a session', 'Weka kikao'), to: '/booking' },
              ].map((a) => (
                <button key={a.title} onClick={() => navigate(a.to)}
                  className="rounded-xl border border-border bg-card p-5 text-left transition-shadow hover:shadow-lg">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><a.icon className="h-5 w-5 text-primary" /></span>
                  <p className="mt-3 font-semibold text-foreground">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              {/* Trend */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    {tr('Workstation risk over time', 'Hatari ya eneo la kazi kwa muda')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{tr('Lower is better.', 'Chini ni bora.')}</p>
                </CardHeader>
                <CardContent className="h-56">
                  {ergoTrend.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ergoTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--foreground))' }} />
                        <Line type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                      <Activity className="h-8 w-8 opacity-40" />
                      <p className="text-sm">{tr('No checks yet. Run your first workstation check.', 'Hakuna ukaguzi bado. Fanya wa kwanza.')}</p>
                      <Button size="sm" onClick={() => navigate('/workstation')} className="mt-1 bg-gradient-hero shadow-soft">{tr('Start', 'Anza')}</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reminders */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4 text-primary" />
                    {tr('Movement reminders', 'Vikumbusho vya kutembea')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{tr('Nudges to stand and stretch while this tab is open.', 'Vikumbusho vya kusimama na kunyoosha wakati ukurasa huu uko wazi.')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rem" className="flex items-center gap-2">
                      {office.reminders_enabled ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                      {tr('Reminders', 'Vikumbusho')}
                    </Label>
                    <Switch id="rem" checked={!!office.reminders_enabled} onCheckedChange={(v) => { saveOffice({ reminders_enabled: v }); if (v) requestNotifications(); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{tr('Remind me every', 'Nikumbushe kila')}</Label>
                    <Select value={String(office.reminder_interval_min || 45)} onValueChange={(v) => saveOffice({ reminder_interval_min: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{tr('30 minutes', 'Dakika 30')}</SelectItem>
                        <SelectItem value="45">{tr('45 minutes', 'Dakika 45')}</SelectItem>
                        <SelectItem value="60">{tr('60 minutes', 'Dakika 60')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tr('Tip: digital prompts are proven to cut sitting time, but pair them with the exercises for real relief.', 'Dokezo: vikumbusho hupunguza muda wa kukaa, lakini viunganishe na mazoezi kwa nafuu halisi.')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfficeDashboard;
