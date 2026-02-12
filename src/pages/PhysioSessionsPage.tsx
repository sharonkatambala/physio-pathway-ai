import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, Stethoscope, ClipboardList, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PhysioSessionsPage = () => {
  const { user, role, loading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoadingAppointments(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.id) {
          setAppointments([]);
          return;
        }

        const { data, error } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, session_type, status, notes, patient:patient_id (first_name, last_name)')
          .eq('physiotherapist_id', profile.id)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (error) throw error;
        setAppointments(data ?? []);
      } catch (err) {
        console.error('Failed to load appointments', err);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sessions & Schedule</h1>
                <p className="text-muted-foreground">
                  Organize your day, launch telehealth calls, and track patient preparation.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ClipboardList className="h-4 w-4 mr-2" />
              Export Daily Plan
            </Button>
            <Button className="bg-gradient-hero shadow-soft">
              <Video className="h-4 w-4 mr-2" />
              Start Telehealth Room
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
            <Card className="shadow-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today&apos;s Sessions</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {appointments.filter((a) => a.appointment_date === todayISO && a.status !== 'cancelled').length} scheduled
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
              {loadingAppointments ? (
                <div className="text-sm text-muted-foreground">Loading sessions...</div>
              ) : appointments.filter((a) => a.appointment_date === todayISO && a.status !== 'cancelled').length === 0 ? (
                <div className="text-sm text-muted-foreground">No sessions scheduled for today.</div>
              ) : (
                appointments
                  .filter((a) => a.appointment_date === todayISO && a.status !== 'cancelled')
                  .map((item) => {
                    const patientName = `${item.patient?.first_name ?? ''} ${item.patient?.last_name ?? ''}`.trim() || 'Patient';
                    const time = item.appointment_time?.slice(0, 5);
                    return (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border/60 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{patientName}</div>
                            <div className="text-sm text-muted-foreground capitalize">{item.session_type}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {time}
                              <span className="mx-1">•</span>
                              <MapPin className="h-3 w-3" />
                              {item.session_type === 'in-person' ? 'Clinic' : 'Telehealth'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={item.status === 'confirmed' ? 'bg-success text-white' : 'bg-muted text-foreground'}>{item.status}</Badge>
                          <Button size="sm" variant="outline">
                            View Notes
                          </Button>
                          <Button size="sm" className="bg-gradient-hero shadow-soft">
                            Start
                          </Button>
                        </div>
                      </div>
                    );
                  })
              )}
              </CardContent>
            </Card>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Prep Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <span>Pending requests</span>
                  <Badge variant="outline">{appointments.filter((a) => a.status === 'pending').length}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <span>Sessions confirmed</span>
                  <Badge variant="outline">{appointments.filter((a) => a.status === 'confirmed').length}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <span>Completed sessions</span>
                  <Badge variant="outline">{appointments.filter((a) => a.status === 'completed').length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Session Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Telehealth sessions</span>
                  <span className="font-semibold text-foreground">
                    {appointments.filter((a) => a.session_type === 'video' || a.session_type === 'phone').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>In-person sessions</span>
                  <span className="font-semibold text-foreground">
                    {appointments.filter((a) => a.session_type === 'in-person').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cancelled</span>
                  <span className="font-semibold text-foreground">
                    {appointments.filter((a) => a.status === 'cancelled').length}
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Adjust Availability
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysioSessionsPage;
