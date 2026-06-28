import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users, Calendar, TrendingUp, ClipboardCheck, Stethoscope, Video, Phone, MapPin,
  Check, X, MessageSquare, ArrowRight, Clock, User,
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
  created_at: string;
  patient?: { first_name: string | null; last_name: string | null } | null;
};

const sessionIcon = (t: string) => (t === 'phone' ? Phone : t === 'in-person' ? MapPin : Video);

const PhysiotherapistDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const sessionLabel = (t: string) => (t === 'phone' ? tr('Phone', 'Simu') : t === 'in-person' ? tr('In person', 'Ana kwa ana') : tr('Video', 'Video'));
  const statusLabel = (s: string) => (s === 'confirmed' ? tr('Confirmed', 'Imethibitishwa') : s === 'completed' ? tr('Completed', 'Imekamilika') : s === 'cancelled' ? tr('Cancelled', 'Imeghairiwa') : tr('Pending', 'Inasubiri'));
  const navigate = useNavigate();

  const [appts, setAppts] = useState<Appt[]>([]);
  const [activePatients, setActivePatients] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  const displayName = useMemo(() => {
    const metaFirst = (user?.user_metadata?.first_name as string | undefined) ?? '';
    const metaLast = (user?.user_metadata?.last_name as string | undefined) ?? '';
    const first = profile?.first_name?.trim() || metaFirst.trim();
    const last = profile?.last_name?.trim() || metaLast.trim();
    return `${first} ${last}`.trim() || tr('Doctor', 'Daktari');
  }, [profile?.first_name, profile?.last_name, user?.user_metadata]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadDashboard = useCallback(async () => {
    if (!profile?.id) return;
    setDataLoading(true);
    try {
      const { data: assignments } = await supabase
        .from('physio_patient_assignments')
        .select('patient_id')
        .eq('physio_id', profile.id)
        .eq('status', 'active');
      setActivePatients(assignments?.length ?? 0);

      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_id, appointment_date, appointment_time, session_type, status, created_at, patient:patient_id (first_name, last_name)')
        .eq('physiotherapist_id', profile.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      if (error) throw error;
      setAppts((data as unknown as Appt[]) ?? []);
    } catch (error) {
      console.error('Failed to load physio dashboard data', error);
      setAppts([]);
      setActivePatients(0);
    } finally {
      setDataLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) {
      toast({ title: tr('Update failed', 'Kusasisha kumeshindwa'), description: error.message, variant: 'destructive' });
      return;
    }
    const label = status === 'confirmed' ? tr('Appointment confirmed', 'Miadi imethibitishwa') : status === 'completed' ? tr('Marked as completed', 'Imewekwa kama imekamilika') : tr('Appointment declined', 'Miadi imekataliwa');
    toast({ title: label });
    loadDashboard();
  };

  const pending = appts.filter((a) => a.status === 'pending');
  const upcoming = appts.filter((a) => a.status !== 'cancelled' && a.status !== 'completed' && a.appointment_date >= todayISO);
  const todays = appts.filter((a) => a.status !== 'cancelled' && a.appointment_date === todayISO);
  const last30 = appts.filter((a) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    return new Date(a.appointment_date) >= cutoff;
  });
  const completionRate = last30.length === 0 ? 0 : Math.round((last30.filter((a) => a.status === 'completed').length / last30.length) * 100);
  const recent = [...appts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const patientName = (a: Appt) => `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`.trim() || tr('Patient', 'Mgonjwa');

  if (loading) return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const stats = [
    { label: tr('Active Patients', 'Wagonjwa Hai'), value: activePatients, hint: tr('Currently assigned', 'Waliopangwa sasa'), icon: Users, onClick: () => navigate('/physio-patients') },
    { label: tr('Pending Requests', 'Maombi Yanayosubiri'), value: pending.length, hint: tr('Awaiting your confirmation', 'Yanasubiri uthibitisho wako'), icon: ClipboardCheck },
    { label: tr("Today's Sessions", 'Vikao vya Leo'), value: todays.length, hint: tr('Scheduled for today', 'Vilivyopangwa leo'), icon: Calendar, onClick: () => navigate('/physio-sessions') },
    { label: tr('Completion Rate', 'Kiwango cha Ukamilishaji'), value: `${completionRate}%`, hint: tr('Last 30 days', 'Siku 30 zilizopita'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="page-shell py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{tr('Welcome, Dr.', 'Karibu, Dkt.')} {displayName}</h1>
            <p className="text-muted-foreground">{tr('Coordinate care, confirm sessions, and keep patients moving forward.', 'Ratibu huduma, thibitisha vikao, na uwasaidie wagonjwa kuendelea mbele.')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className={`shadow-card ${s.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                onClick={s.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{s.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <p className="text-sm text-muted-foreground">{s.hint}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Pending requests */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{tr('Pending Requests', 'Maombi Yanayosubiri')}</CardTitle>
              <Badge variant="outline">{pending.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataLoading ? (
                <p className="text-sm text-muted-foreground">{tr('Loading...', 'Inapakia...')}</p>
              ) : pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr('No pending requests. New bookings will appear here.', 'Hakuna maombi yanayosubiri. Miadi mipya itaonekana hapa.')}</p>
              ) : (
                pending.map((a) => {
                  const Icon = sessionIcon(a.session_type);
                  return (
                    <div key={a.id} className="p-4 border border-border/60 rounded-lg space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{patientName(a)}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Icon className="h-3 w-3" />{a.appointment_date}, {a.appointment_time?.slice(0, 5)}, <span>{sessionLabel(a.session_type)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => updateStatus(a.id, 'confirmed')}>
                          <Check className="h-4 w-4 mr-1.5" />{tr('Confirm', 'Thibitisha')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}>
                          <X className="h-4 w-4 mr-1.5" />{tr('Decline', 'Kataa')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/messages?with=${a.patient_id}`)}>
                          <MessageSquare className="h-4 w-4 mr-1.5" />{tr('Message', 'Ujumbe')}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{tr('Upcoming Sessions', 'Vikao Vijavyo')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/physio-sessions')}>
                {tr('View all', 'Ona vyote')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataLoading ? (
                <p className="text-sm text-muted-foreground">{tr('Loading...', 'Inapakia...')}</p>
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr('No upcoming sessions.', 'Hakuna vikao vijavyo.')}</p>
              ) : (
                upcoming.slice(0, 5).map((a) => {
                  const Icon = sessionIcon(a.session_type);
                  const canCall = a.status === 'confirmed' && a.session_type !== 'in-person';
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-4 border border-border/60 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{patientName(a)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.appointment_date}, {a.appointment_time?.slice(0, 5)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="hidden sm:inline-flex">{statusLabel(a.status)}</Badge>
                        {canCall && (
                          <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => joinTelehealth(a.id)}>
                            <Video className="h-4 w-4 mr-1.5" />{tr('Start', 'Anza')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent bookings */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{tr('Recent Bookings', 'Miadi ya Hivi Karibuni')}</CardTitle>
            <Badge variant="outline">{recent.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataLoading ? (
              <p className="text-sm text-muted-foreground">{tr('Loading...', 'Inapakia...')}</p>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">{tr('No bookings yet. Patients will appear here after scheduling.', 'Hakuna miadi bado. Wagonjwa wataonekana hapa baada ya kupanga.')}</p>
            ) : (
              recent.map((a) => (
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysiotherapistDashboard;
