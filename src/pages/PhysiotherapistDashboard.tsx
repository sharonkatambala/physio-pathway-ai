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
  const navigate = useNavigate();

  const [appts, setAppts] = useState<Appt[]>([]);
  const [activePatients, setActivePatients] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  const displayName = useMemo(() => {
    const metaFirst = (user?.user_metadata?.first_name as string | undefined) ?? '';
    const metaLast = (user?.user_metadata?.last_name as string | undefined) ?? '';
    const first = profile?.first_name?.trim() || metaFirst.trim();
    const last = profile?.last_name?.trim() || metaLast.trim();
    return `${first} ${last}`.trim() || 'Doctor';
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
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    const label = status === 'confirmed' ? 'Appointment confirmed' : status === 'completed' ? 'Marked as completed' : 'Appointment declined';
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

  const patientName = (a: Appt) => `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`.trim() || 'Patient';

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const stats = [
    { label: 'Active Patients', value: activePatients, hint: 'Currently assigned', icon: Users, onClick: () => navigate('/physio-patients') },
    { label: 'Pending Requests', value: pending.length, hint: 'Awaiting your confirmation', icon: ClipboardCheck },
    { label: "Today's Sessions", value: todays.length, hint: 'Scheduled for today', icon: Calendar, onClick: () => navigate('/physio-sessions') },
    { label: 'Completion Rate', value: `${completionRate}%`, hint: 'Last 30 days', icon: TrendingUp },
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
            <h1 className="text-3xl font-bold mb-1">Welcome, Dr. {displayName}</h1>
            <p className="text-muted-foreground">Coordinate care, confirm sessions, and keep patients moving forward.</p>
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
              <CardTitle>Pending Requests</CardTitle>
              <Badge variant="outline">{pending.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests. New bookings will appear here.</p>
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
                              <Icon className="h-3 w-3" />{a.appointment_date}, {a.appointment_time?.slice(0, 5)}, <span className="capitalize">{a.session_type}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => updateStatus(a.id, 'confirmed')}>
                          <Check className="h-4 w-4 mr-1.5" />Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}>
                          <X className="h-4 w-4 mr-1.5" />Decline
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/messages?with=${a.patient_id}`)}>
                          <MessageSquare className="h-4 w-4 mr-1.5" />Message
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
              <CardTitle>Upcoming Sessions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/physio-sessions')}>
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
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
                        <Badge variant="outline" className="capitalize hidden sm:inline-flex">{a.status}</Badge>
                        {canCall && (
                          <Button size="sm" className="bg-gradient-hero shadow-soft" onClick={() => joinTelehealth(a.id)}>
                            <Video className="h-4 w-4 mr-1.5" />Start
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
            <CardTitle>Recent Bookings</CardTitle>
            <Badge variant="outline">{recent.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet. Patients will appear here after scheduling.</p>
            ) : (
              recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 border border-border/60 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{patientName(a)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{a.appointment_date}, {a.session_type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize flex-shrink-0">{a.status}</Badge>
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
