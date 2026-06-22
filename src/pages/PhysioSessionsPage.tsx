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
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); return; }
    const labels: Record<string, string> = { confirmed: 'Session confirmed', cancelled: 'Session cancelled', completed: 'Session marked complete' };
    toast({ title: labels[status] ?? 'Updated' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const patientName = (a: Appt) => `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`.trim() || 'Patient';
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
              <Clock className="h-3 w-3" />{a.appointment_date} · {a.appointment_time?.slice(0, 5)}
              <span className="mx-0.5">•</span>
              <Icon className="h-3 w-3" /><span className="capitalize">{a.session_type === 'in-person' ? 'Clinic' : a.session_type}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{a.status}</Badge>
          {a.status === 'pending' && (
            <>
              <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => updateStatus(a.id, 'confirmed')}><Check className="h-4 w-4 mr-1.5" />Confirm</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}><X className="h-4 w-4 mr-1.5" />Decline</Button>
            </>
          )}
          {canCall && (
            <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => joinTelehealth(a.id)}><Video className="h-4 w-4 mr-1.5" />Start</Button>
          )}
          {a.status === 'confirmed' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'completed')}><CheckCircle2 className="h-4 w-4 mr-1.5" />Complete</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setNotesAppt(a)}><FileText className="h-4 w-4 mr-1.5" />Notes</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/messages?with=${a.patient_id}`)}><MessageSquare className="h-4 w-4 mr-1.5" />Message</Button>
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
            <h1 className="text-3xl font-bold">Sessions &amp; Schedule</h1>
            <p className="text-muted-foreground">Confirm requests, launch telehealth calls, and track session notes.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Today */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today&apos;s Sessions</CardTitle>
                <Badge variant="outline" className="text-xs">{todays.length} scheduled</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingAppts ? <p className="text-sm text-muted-foreground">Loading sessions...</p>
                  : todays.length === 0 ? <p className="text-sm text-muted-foreground">No sessions scheduled for today.</p>
                  : todays.map((a) => <SessionRow key={a.id} a={a} />)}
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming</CardTitle>
                <Badge variant="outline" className="text-xs">{upcoming.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingAppts ? <p className="text-sm text-muted-foreground">Loading...</p>
                  : upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
                  : upcoming.map((a) => <SessionRow key={a.id} a={a} />)}
              </CardContent>
            </Card>

            {/* Past / history */}
            {past.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>History</CardTitle>
                  <Badge variant="outline" className="text-xs">{past.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {past.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-3 border border-border/60 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{patientName(a)}</p>
                          <p className="text-xs text-muted-foreground capitalize">{a.appointment_date} · {a.session_type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize flex-shrink-0">{a.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ['Pending requests', appts.filter((a) => a.status === 'pending').length],
                  ['Confirmed', appts.filter((a) => a.status === 'confirmed').length],
                  ['Completed', appts.filter((a) => a.status === 'completed').length],
                  ['Cancelled', appts.filter((a) => a.status === 'cancelled').length],
                ].map(([label, n]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <span className="text-muted-foreground">{label}</span>
                    <Badge variant="outline">{n as number}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle>Session Types</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><Video className="h-4 w-4" />Video</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'video').length}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><Phone className="h-4 w-4" />Phone</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'phone').length}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground inline-flex items-center gap-2"><MapPin className="h-4 w-4" />In-person</span><span className="font-semibold">{appts.filter((a) => a.session_type === 'in-person').length}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notes dialog */}
      <Dialog open={!!notesAppt} onOpenChange={(o) => !o && setNotesAppt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session notes</DialogTitle>
            <DialogDescription>
              {notesAppt ? `${patientName(notesAppt)} · ${notesAppt.appointment_date} · ${notesAppt.appointment_time?.slice(0,5)}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm whitespace-pre-wrap min-h-24">
            {notesAppt?.notes?.trim() ? notesAppt.notes : <span className="text-muted-foreground">The patient did not add any notes for this session.</span>}
          </div>
          {notesAppt && (
            <Button variant="outline" className="w-full" onClick={() => { navigate(`/messages?with=${notesAppt.patient_id}`); setNotesAppt(null); }}>
              <MessageSquare className="h-4 w-4 mr-2" />Message patient
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhysioSessionsPage;
