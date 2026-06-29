import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Calendar, Clock, Video, Phone, MapPin, Stethoscope, Check, X, MessageSquare,
  FileText, User, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { joinTelehealth } from '@/lib/telehealth';
import { useLanguage } from '@/contexts/LanguageContext';

type Appt = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  session_type: 'video' | 'phone' | 'in-person';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  patient?: { first_name: string | null; last_name: string | null } | null;
};

const sessionIcon = (t: string) => (t === 'phone' ? Phone : t === 'in-person' ? MapPin : Video);

const PhysioSessionsPage = () => {
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const sessionLabel = (t: string) => (t === 'phone' ? tr('Phone', 'Simu') : t === 'in-person' ? tr('Clinic', 'Kliniki') : tr('Video', 'Video'));
  const statusLabel = (s: string) => (s === 'confirmed' ? tr('Confirmed', 'Imethibitishwa') : s === 'completed' ? tr('Completed', 'Imekamilika') : s === 'cancelled' ? tr('Cancelled', 'Imeghairiwa') : tr('Pending', 'Inasubiri'));
  const navigate = useNavigate();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [notesAppt, setNotesAppt] = useState<Appt | null>(null);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadingAppts(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (!profile?.id) { setAppts([]); return; }
      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_id, appointment_date, appointment_time, session_type, status, notes, patient:patient_id (first_name, last_name)')
        .eq('physiotherapist_id', profile.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      if (error) throw error;
      setAppts((data as unknown as Appt[]) ?? []);
    } catch (err) {
      console.error('Failed to load appointments', err);
      setAppts([]);
    } finally {
      setLoadingAppts(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: Appt['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast({ title: tr('Update failed', 'Kusasisha kumeshindwa'), description: error.message, variant: 'destructive' }); return; }
    const labels: Record<string, string> = { confirmed: tr('Session confirmed', 'Kikao kimethibitishwa'), cancelled: tr('Session cancelled', 'Kikao kimeghairiwa'), completed: tr('Session marked complete', 'Kikao kimewekwa kuwa kimekamilika') };
    toast({ title: labels[status] ?? tr('Updated', 'Imesasishwa') });
    load();
  };

  const handleStart = (id: string) => {
    if (joinTelehealth(id)) {
      toast({ title: tr('Opening telehealth room', 'Inafungua chumba cha telehealth'), description: tr('The video call is opening in a new tab.', 'Simu ya video inafunguka kwenye kichupo kipya.') });
    } else {
      toast({ title: tr('Could not open the call', 'Imeshindwa kufungua simu'), description: tr('Please allow pop-ups for this site and try again.', 'Tafadhali ruhusu pop-ups kwa tovuti hii kisha jaribu tena.'), variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const patientName = (a: Appt) => `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`.trim() || tr('Patient', 'Mgonjwa');
  const active = appts.filter((a) => a.status !== 'cancelled');
  const todays = active.filter((a) => a.appointment_date === todayISO);
  const upcoming = active.filter((a) => a.appointment_date > todayISO && a.status !== 'completed');
  const past = appts.filter((a) => a.appointment_date < todayISO || a.status === 'completed' || a.status === 'cancelled');

  const SessionRow = ({ a }: { a: Appt }) => {
    const Icon = sessionIcon(a.session_type);
    const canCall = a.status === 'confirmed' && a.session_type !== 'in-person';
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border/60 rounded-lg">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{patientName(a)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
              <Clock className="h-3 w-3" />{a.appointment_date}, {a.appointment_time?.slice(0, 5)}
              <span className="mx-0.5">•</span>
              <Icon className="h-3 w-3" /><span>{sessionLabel(a.session_type)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{statusLabel(a.status)}</Badge>
          {a.status === 'pending' && (
            <>
              <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => updateStatus(a.id, 'confirmed')}><Check className="h-4 w-4 mr-1.5" />{tr('Confirm', 'Thibitisha')}</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}><X className="h-4 w-4 mr-1.5" />{tr('Decline', 'Kataa')}</Button>
            </>
          )}
          {canCall && (
            <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => handleStart(a.id)}><Video className="h-4 w-4 mr-1.5" />{tr('Start', 'Anza')}</Button>
          )}
          {a.status === 'confirmed' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'completed')}><CheckCircle2 className="h-4 w-4 mr-1.5" />{tr('Complete', 'Kamilisha')}</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setNotesAppt(a)}><FileText className="h-4 w-4 mr-1.5" />{tr('Notes', 'Maelezo')}</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/messages?with=${a.patient_id}`)}><MessageSquare className="h-4 w-4 mr-1.5" />{tr('Message', 'Ujumbe')}</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{tr('Sessions & Schedule', 'Vikao na Ratiba')}</h1>
            <p className="text-muted-foreground">{tr('Confirm requests, launch telehealth calls, and track session notes.', 'Thibitisha maombi, anzisha simu za telehealth, na fuatilia maelezo ya vikao.')}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Today */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{tr("Today's Sessions", 'Vikao vya Leo')}</CardTitle>
                <Badge variant="outline" className="text-xs">{todays.length} {tr('scheduled', 'vimepangwa')}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingAppts ? <p className="text-sm text-muted-foreground">{tr('Loading sessions...', 'Inapakia vikao...')}</p>
                  : todays.length === 0 ? <p className="text-sm text-muted-foreground">{tr('No sessions scheduled for today.', 'Hakuna vikao vilivyopangwa leo.')}</p>
                  : todays.map((a) => <SessionRow key={a.id} a={a} />)}
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{tr('Upcoming', 'Vijavyo')}</CardTitle>
                <Badge variant="outline" className="text-xs">{upcoming.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingAppts ? <p className="text-sm text-muted-foreground">{tr('Loading...', 'Inapakia...')}</p>
                  : upcoming.length === 0 ? <p className="text-sm text-muted-foreground">{tr('No upcoming sessions.', 'Hakuna vikao vijavyo.')}</p>
                  : upcoming.map((a) => <SessionRow key={a.id} a={a} />)}
              </CardContent>
            </Card>

            {/* Past / history */}
            {past.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{tr('History', 'Historia')}</CardTitle>
                  <Badge variant="outline" className="text-xs">{past.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {past.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-3 border border-border/60 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{patientName(a)}</p>
                          <p className="text-xs text-muted-foreground">{a.appointment_date}, {sessionLabel(a.session_type)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">{statusLabel(a.status)}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle>{tr('Overview', 'Muhtasari')}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  [tr('Pending requests', 'Maombi yanayosubiri'), appts.filter((a) => a.status === 'pending').length],
                  [tr('Confirmed', 'Yaliyothibitishwa'), appts.filter((a) => a.status === 'confirmed').length],
                  [tr('Completed', 'Yaliyokamilika'), appts.filter((a) => a.status === 'completed').length],
                  [tr('Cancelled', 'Yaliyoghairiwa'), appts.filter((a) => a.status === 'cancelled').length],
                ].map(([label, n]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <span className="text-muted-foreground">{label}</span>
                    <Badge variant="outline">{n as number}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle>{tr('Session Types', 'Aina za Vikao')}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><Video className="h-4 w-4" />{tr('Video', 'Video')}</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'video').length}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><Phone className="h-4 w-4" />{tr('Phone', 'Simu')}</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'phone').length}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{tr('In-person', 'Ana kwa ana')}</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'in-person').length}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notes dialog */}
      <Dialog open={!!notesAppt} onOpenChange={(o) => !o && setNotesAppt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr('Session notes', 'Maelezo ya kikao')}</DialogTitle>
            <DialogDescription>
              {notesAppt ? `${patientName(notesAppt)}, ${notesAppt.appointment_date}, ${notesAppt.appointment_time?.slice(0,5)}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm whitespace-pre-wrap min-h-24">
            {notesAppt?.notes?.trim() ? notesAppt.notes : <span className="text-muted-foreground">{tr('The patient did not add any notes for this session.', 'Mgonjwa hakuongeza maelezo yoyote kwa kikao hiki.')}</span>}
          </div>
          {notesAppt && (
            <Button variant="outline" className="w-full" onClick={() => { navigate(`/messages?with=${notesAppt.patient_id}`); setNotesAppt(null); }}>
              <MessageSquare className="h-4 w-4 mr-2" />{tr('Message patient', 'Tuma ujumbe kwa mgonjwa')}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhysioSessionsPage;
