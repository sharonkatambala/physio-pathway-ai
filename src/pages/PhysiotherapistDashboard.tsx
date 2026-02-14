import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PatientManagement from '@/components/PatientManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, TrendingUp, FileText, Settings, Book, ClipboardCheck, Stethoscope, Sparkles, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PhysiotherapistDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const [activePatients, setActivePatients] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [todaysSessions, setTodaysSessions] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  const displayName = useMemo(() => {
    const metaFirst = (user?.user_metadata?.first_name as string | undefined) ?? '';
    const metaLast = (user?.user_metadata?.last_name as string | undefined) ?? '';
    const first = profile?.first_name?.trim() || metaFirst.trim();
    const last = profile?.last_name?.trim() || metaLast.trim();
    const full = `${first} ${last}`.trim();
    return full || 'Doctor';
  }, [profile?.first_name, profile?.last_name, user?.user_metadata]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!profile?.id) return;
      setDataLoading(true);
      try {
        const { data: assignments, error: assignError } = await supabase
          .from('physio_patient_assignments')
          .select('patient_id')
          .eq('physio_id', profile.id)
          .eq('status', 'active');

        if (assignError) throw assignError;
        setActivePatients(assignments?.length ?? 0);

        const today = new Date();
        const todayISO = today.toISOString().slice(0, 10);

        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, session_type, status, created_at, patient:patient_id (first_name, last_name)')
          .eq('physiotherapist_id', profile.id)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (apptError) throw apptError;

        const appts = appointments ?? [];
        const upcoming = appts.filter((a) => a.status !== 'cancelled' && a.appointment_date >= todayISO);
        setUpcomingAppointments(upcoming.slice(0, 5));

        const pending = appts.filter((a) => a.status === 'pending');
        setPendingRequests(pending.length);

        const todays = appts.filter((a) => a.status !== 'cancelled' && a.appointment_date === todayISO);
        setTodaysSessions(todays.length);

        const last30 = appts.filter((a) => {
          const date = new Date(a.appointment_date);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          return date >= cutoff;
        });
        const completed = last30.filter((a) => a.status === 'completed').length;
        const total = last30.length;
        setCompletionRate(total === 0 ? 0 : Math.round((completed / total) * 100));

        const recent = [...appts].sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return bTime - aTime;
        });
        setRecentBookings(recent.slice(0, 5));
      } catch (error) {
        console.error('Failed to load physio dashboard data', error);
        setActivePatients(0);
        setPendingRequests(0);
        setTodaysSessions(0);
        setCompletionRate(0);
        setUpcomingAppointments([]);
        setRecentBookings([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboard();
  }, [profile?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="page-shell py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome, Dr. {displayName}!
              </h1>
              <p className="text-muted-foreground">
                Coordinate care, review AI insights, and keep patients moving forward.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Review Alerts
            </Button>
            <Button className="bg-gradient-hero shadow-soft">
              <Video className="h-4 w-4 mr-2" />
              Start Telehealth
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePatients}</div>
                <p className="text-xs text-muted-foreground">Currently assigned</p>
              </CardContent>
            </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Appointments awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysSessions}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="queue">Review Queue</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Badge variant="outline">{upcomingAppointments.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataLoading ? (
                    <div className="text-sm text-muted-foreground">Loading appointments...</div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No upcoming appointments yet.
                    </div>
                  ) : (
                    upcomingAppointments.map((item) => {
                      const patientName = `${item.patient?.first_name ?? ''} ${item.patient?.last_name ?? ''}`.trim() || 'Patient';
                      const time = item.appointment_time?.slice(0, 5);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
                          <div>
                            <p className="font-medium">{patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.appointment_date} • {time} • {item.session_type}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">{item.status}</Badge>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Badge variant="outline">{recentBookings.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataLoading ? (
                    <div className="text-sm text-muted-foreground">Loading bookings...</div>
                  ) : recentBookings.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No bookings yet. Patients will appear here after scheduling.
                    </div>
                  ) : (
                    recentBookings.map((item) => {
                      const patientName = `${item.patient?.first_name ?? ''} ${item.patient?.last_name ?? ''}`.trim() || 'Patient';
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
                          <div>
                            <p className="font-medium">{patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.appointment_date} • {item.session_type}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">{item.status}</Badge>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="queue">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Pending Appointment Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataLoading ? (
                    <div className="text-sm text-muted-foreground">Loading requests...</div>
                  ) : pendingRequests === 0 ? (
                    <div className="text-sm text-muted-foreground">No pending requests.</div>
                  ) : (
                    upcomingAppointments
                      .filter((a) => a.status === 'pending')
                      .map((item) => {
                        const patientName = `${item.patient?.first_name ?? ''} ${item.patient?.last_name ?? ''}`.trim() || 'Patient';
                        return (
                          <div key={item.id} className="p-4 border border-border/60 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{patientName}</div>
                              <Badge variant="outline" className="capitalize">{item.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.appointment_date} • {item.appointment_time?.slice(0, 5)} • {item.session_type}
                            </div>
                            <Button size="sm" variant="outline">Review Request</Button>
                          </div>
                        );
                      })
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Next Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border/60 rounded-lg space-y-2">
                    <div className="font-semibold">Confirm pending requests</div>
                    <div className="text-sm text-muted-foreground">
                      Review new bookings and accept sessions.
                    </div>
                  </div>
                  <div className="p-4 border border-border/60 rounded-lg space-y-2">
                    <div className="font-semibold">Review new assessments</div>
                    <div className="text-sm text-muted-foreground">
                      Check for red flags and update care plans.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="library">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="shadow-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Exercise Packs</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No exercise packs created yet. Use the Resources page to build and save your protocols.
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Create New Protocol
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Patient Handout
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Practice Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure notification rules, availability, and AI triage preferences.
                </p>
                <Button>Manage Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhysiotherapistDashboard;
