import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from '@/components/Navigation';
import {
  Calendar, Clock, Phone, Users, Award, CheckCircle, User,
  Video, MapPin, Loader2, CalendarCheck, Stethoscope
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Physiotherapist = {
  id: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type Appointment = {
  id: string;
  physiotherapist_id: string;
  appointment_date: string;
  appointment_time: string;
  session_type: 'video' | 'phone' | 'in-person';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};

type SessionType = 'video' | 'phone' | 'in-person';

const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const BookingPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const { user, profile, role, loading } = useAuth();
  const { toast } = useToast();

  const [selectedPhysio, setSelectedPhysio] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<SessionType>('video');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [isLoadingPhysios, setIsLoadingPhysios] = useState(true);
  const [physioError, setPhysioError] = useState<string | null>(null);

  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [justBooked, setJustBooked] = useState<null | { physio: string; date: string; time: string; type: SessionType }>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  // Which completed step the user reopened via its "Change" button.
  const [editingStep, setEditingStep] = useState<1 | 2 | null>(null);
  // Times already taken for the selected physio + date ("HH:MM").
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const physioName = useCallback((p?: Physiotherapist | null) => {
    if (!p) return tr('Physiotherapist', 'Physiotherapist');
    return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || tr('Physiotherapist', 'Physiotherapist');
  }, [language]);

  const nextDates = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    };
  }), []);

  const formatTime12 = (t: string) => {
    const [hStr, m] = t.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12; else if (h > 12) h -= 12;
    return `${h}:${m} ${period}`;
  };

  const formatDateLong = (iso: string) => {
    const [y, mo, d] = iso.split('-').map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const sessionTypeMeta: Record<SessionType, { label: string; icon: typeof Video; hint: string }> = {
    video: { label: tr('Video call', 'Simu ya video'), icon: Video, hint: tr('Secure telehealth', 'Telehealth salama') },
    phone: { label: tr('Phone call', 'Simu ya sauti'), icon: Phone, hint: tr('Voice consult', 'Mazungumzo ya sauti') },
    'in-person': { label: tr('In-person', 'Ana kwa ana'), icon: MapPin, hint: tr('Visit the clinic', 'Tembelea kliniki') },
  };

  // ── Load physiotherapists ──
  useEffect(() => {
    const fetchPhysiotherapists = async () => {
      if (loading) return;
      setIsLoadingPhysios(true);
      setPhysioError(null);
      try {
        const { data: roleRows, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'physiotherapist');
        if (roleError) throw roleError;

        const userIds = (roleRows ?? []).map((row) => row.user_id);
        if (userIds.length === 0) {
          setPhysiotherapists([]);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, occupation, phone, email, avatar_url')
          .in('user_id', userIds);
        if (error) throw error;
        setPhysiotherapists((data as Physiotherapist[]) ?? []);
      } catch (error: any) {
        console.error('Error fetching physiotherapists:', error);
        setPhysioError(String(error?.message || error || 'Unknown error'));
        setPhysiotherapists([]);
      } finally {
        setIsLoadingPhysios(false);
      }
    };
    fetchPhysiotherapists();
  }, [user, loading]);

  // ── Load the patient's own upcoming appointments ──
  const loadMyAppointments = useCallback(async () => {
    if (!profile?.id) return;
    const todayISO = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('appointments')
      .select('id, physiotherapist_id, appointment_date, appointment_time, session_type, status')
      .eq('patient_id', profile.id)
      .gte('appointment_date', todayISO)
      .neq('status', 'cancelled')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    if (!error) setMyAppointments((data as Appointment[]) ?? []);
  }, [profile?.id]);

  useEffect(() => { loadMyAppointments(); }, [loadMyAppointments]);

  // Load taken slots whenever physio + date are chosen, so those times can be
  // disabled. Falls back to "all free" if the RPC is missing (migration not
  // applied yet) - the unique index still blocks true double-bookings.
  useEffect(() => {
    let cancelled = false;
    const loadBookedSlots = async () => {
      if (!selectedPhysio || !selectedDate) { setBookedTimes([]); return; }
      const { data, error } = await supabase.rpc('get_booked_slots' as any, {
        p_physio: selectedPhysio,
        p_date: selectedDate,
      });
      if (cancelled) return;
      if (error || !Array.isArray(data)) { setBookedTimes([]); return; }
      setBookedTimes((data as string[]).map((t) => String(t).slice(0, 5)));
    };
    loadBookedSlots();
    return () => { cancelled = true; };
  }, [selectedPhysio, selectedDate]);

  const cancelAppointment = async (id: string) => {
    setCancellingId(id);
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setCancellingId(null);
    if (error) {
      toast({
        title: tr('Could not cancel', 'Imeshindwa kughairi'),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: tr('Session cancelled', 'Kikao kimeghairiwa'),
      description: tr('It has been removed from your upcoming sessions.', 'Kimeondolewa kwenye vikao vyako vijavyo.'),
    });
    await loadMyAppointments();
  };

  const selectedPhysioObj = physiotherapists.find((p) => p.id === selectedPhysio) ?? null;
  const canConfirm = Boolean(selectedPhysio && selectedDate && selectedTime && !submitting);

  const confirmBooking = async () => {
    if (!profile?.id || !user) {
      toast({ title: tr('Please sign in', 'Tafadhali ingia'), variant: 'destructive' });
      return;
    }
    if (!selectedPhysio || !selectedDate || !selectedTime) {
      toast({
        title: tr('Missing details', 'Taarifa hazijakamilika'),
        description: tr('Select a physiotherapist, date, and time.', 'Chagua physiotherapist, tarehe, na muda.'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error: apptError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          physiotherapist_id: selectedPhysio,
          appointment_date: selectedDate,
          appointment_time: `${selectedTime}:00`,
          session_type: sessionType,
          status: 'pending',
          notes: notes || null,
        });
      if (apptError) throw apptError;

      // Link patient ↔ physiotherapist. ignoreDuplicates avoids the UPDATE path
      // (which RLS reserves for physiotherapists) when the link already exists.
      const { error: assignError } = await supabase
        .from('physio_patient_assignments')
        .upsert(
          { physio_id: selectedPhysio, patient_id: profile.id, status: 'active' },
          { onConflict: 'physio_id,patient_id', ignoreDuplicates: true }
        );
      if (assignError) console.warn('Assignment link skipped:', assignError.message);

      setJustBooked({ physio: physioName(selectedPhysioObj), date: selectedDate, time: selectedTime, type: sessionType });
      toast({
        title: tr('Session requested', 'Ombi la kikao limewasilishwa'),
        description: tr('Your physiotherapist will confirm shortly.', 'Physiotherapist atathibitisha hivi karibuni.'),
      });
      // Reset the wizard back to step 1 so another session can be booked.
      setSelectedPhysio(null);
      setSelectedDate('');
      setSelectedTime('');
      setSessionType('video');
      setNotes('');
      setEditingStep(null);
      await loadMyAppointments();
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      const isSlotTaken = String(error?.code) === '23505' || String(error?.message ?? '').includes('uniq_active_appointment_slot');
      toast({
        title: tr('Booking failed', 'Kuweka kikao kumeshindikana'),
        description: isSlotTaken
          ? tr('That time was just booked by someone else. Please pick another slot.', 'Muda huo umeshachukuliwa na mtu mwingine sasa hivi. Tafadhali chagua muda mwingine.')
          : String(error?.message || error || 'Unknown error'),
        variant: 'destructive',
      });
      if (isSlotTaken) {
        setSelectedTime('');
        setBookedTimes((prev) => [...new Set([...prev, selectedTime])]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (role === 'physiotherapist') {
    return <Navigate to="/physiotherapist-dashboard" replace />;
  }

  const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
    const map: Record<Appointment['status'], string> = {
      pending: 'bg-warning/10 text-foreground border-warning/40',
      confirmed: 'bg-success/10 text-success border-success/30',
      completed: 'bg-muted text-muted-foreground border-border',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    const labels: Record<Appointment['status'], string> = {
      pending: tr('Pending', 'Inasubiri'),
      confirmed: tr('Confirmed', 'Imethibitishwa'),
      completed: tr('Completed', 'Imekamilika'),
      cancelled: tr('Cancelled', 'Imeghairiwa'),
    };
    return <Badge variant="outline" className={`capitalize ${map[status]}`}>{labels[status]}</Badge>;
  };

  const stepDefs = [
    {
      n: 1,
      title: tr('Therapist', 'Mtaalamu'),
      caption: tr('Pick who you want to see', 'Chagua unayemtaka'),
      done: !!selectedPhysio,
    },
    {
      n: 2,
      title: tr('Schedule', 'Ratiba'),
      caption: tr('Choose date and time', 'Chagua tarehe na muda'),
      done: !!(selectedDate && selectedTime),
    },
    {
      n: 3,
      title: tr('Confirm', 'Thibitisha'),
      caption: tr('Review and submit', 'Kagua na wasilisha'),
      done: false,
    },
  ];
  // The wizard shows one step at a time: the first incomplete step, or the
  // one the user reopened with "Change".
  const currentStep = editingStep ?? (stepDefs.find((s) => !s.done)?.n ?? 3);
  const activeStep = currentStep;

  const CompletedSummary = ({ n, onChange, children }: { n: number; onChange: () => void; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 shadow-xs">
      <div className="flex min-w-0 items-center gap-3">
        <StepChip n={n} />
        {children}
      </div>
      <Button variant="outline" size="sm" className="flex-shrink-0" onClick={onChange}>
        {tr('Change', 'Badilisha')}
      </Button>
    </div>
  );

  const Stepper = () => (
    <div className="mb-8 rounded-2xl border border-border/60 bg-card px-5 py-5 shadow-card sm:px-8">
      <div className="flex items-start">
        {stepDefs.map((step, i) => {
          const isActive = step.n === activeStep;
          const isDone = step.done;
          return (
            <div key={step.n} className="flex flex-1 items-start last:flex-initial">
              <div className="flex flex-col items-center text-center sm:min-w-[92px]">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                    isDone
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : isActive
                      ? 'border-2 border-primary bg-primary/10 text-primary ring-4 ring-primary/10'
                      : 'border border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? <CheckCircle className="h-5 w-5" /> : step.n}
                </div>
                <p className={`mt-2 text-sm font-semibold ${isDone || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{step.caption}</p>
              </div>
              {i < stepDefs.length - 1 && (
                <div className="mx-2 mt-5 h-1 flex-1 overflow-hidden rounded-full bg-muted sm:mx-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: step.done ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const StepChip = ({ n }: { n: number }) => (
    <span
      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        stepDefs[n - 1].done ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
      }`}
    >
      {stepDefs[n - 1].done ? <CheckCircle className="h-3.5 w-3.5" /> : n}
    </span>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="page-shell py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr('Book Session', 'Weka Kikao')}</h1>
            <p className="text-sm text-muted-foreground">{tr('Schedule an appointment with a licensed physiotherapist.', 'Panga miadi na physiotherapist aliyeidhinishwa.')}</p>
          </div>
        </div>

        {/* Success banner */}
        {justBooked && (
          <Card className="mb-6 border-success/30 bg-success/5 shadow-card">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{tr('Session requested!', 'Ombi la kikao limewasilishwa!')}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr('Your request with', 'Ombi lako kwa')} <span className="font-medium text-foreground">{justBooked.physio}</span> {tr('for', 'kwa')}{' '}
                  <span className="font-medium text-foreground">{formatDateLong(justBooked.date)}, {formatTime12(justBooked.time)}</span> {tr('was sent. You will be notified once it is confirmed.', 'limetumwa. Utaarifiwa litakapothibitishwa.')}
                </p>
              </div>
              <Button variant="outline" onClick={() => setJustBooked(null)}>{tr('Book another', 'Weka kingine')}</Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming sessions */}
        {myAppointments.length > 0 && (
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="h-5 w-5 text-primary" />
                {tr('Your Upcoming Sessions', 'Vikao Vyako Vijavyo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAppointments.map((appt) => {
                const physio = physiotherapists.find((p) => p.id === appt.physiotherapist_id);
                const meta = sessionTypeMeta[appt.session_type];
                const Icon = meta?.icon ?? Video;
                return (
                  <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{physioName(physio)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateLong(appt.appointment_date)}, {formatTime12(appt.appointment_time.slice(0, 5))}, {meta?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={appt.status} />
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={cancellingId === appt.id}
                          onClick={() => cancelAppointment(appt.id)}
                        >
                          {cancellingId === appt.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : tr('Cancel', 'Ghairi')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step indicator */}
        <Stepper />

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: physiotherapist — full picker while choosing, compact summary after */}
            {currentStep !== 1 && selectedPhysioObj && (
              <CompletedSummary n={1} onChange={() => setEditingStep(1)}>
                <Avatar className="h-10 w-10 ring-2 ring-primary/15">
                  <AvatarImage src={selectedPhysioObj.avatar_url || undefined} alt={physioName(selectedPhysioObj)} />
                  <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{physioName(selectedPhysioObj)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedPhysioObj.occupation || tr('Physiotherapist', 'Physiotherapist')}
                  </p>
                </div>
              </CompletedSummary>
            )}
            {currentStep === 1 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <StepChip n={1} />
                  {tr('Choose Your Physiotherapist', 'Chagua Physiotherapist')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {isLoadingPhysios ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-border/60 rounded-xl">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    ))
                  ) : physiotherapists.length === 0 ? (
                    <div className="sm:col-span-2 text-center py-10 text-muted-foreground">
                      <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-60" />
                      <p className="font-medium mb-1">{tr('No physiotherapists available yet', 'Hakuna physiotherapist aliyepatikana bado')}</p>
                      <p className="text-sm">{tr('Please check back later.', 'Tafadhali rudi baadaye.')}</p>
                      {physioError ? <p className="text-xs text-destructive mt-2">{physioError}</p> : null}
                    </div>
                  ) : (
                    physiotherapists.map((physio) => {
                      const selected = selectedPhysio === physio.id;
                      return (
                        <button
                          type="button"
                          key={physio.id}
                          onClick={() => { setSelectedPhysio(physio.id); setEditingStep(null); }}
                          className={`text-left rounded-xl border p-4 transition-all ${
                            selected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-16 w-16 ring-2 ring-primary/15">
                              <AvatarImage src={physio.avatar_url || undefined} alt={physioName(physio)} />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                <User className="h-7 w-7" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold leading-tight truncate">{physioName(physio)}</h3>
                                {selected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                              </div>
                              {physio.occupation ? (
                                <p className="text-xs uppercase tracking-wide text-primary/80 mt-0.5 truncate">{physio.occupation}</p>
                              ) : (
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mt-0.5">{tr('Physiotherapist', 'Physiotherapist')}</p>
                              )}
                              <Badge variant="secondary" className="text-[11px] mt-2">
                                <Award className="h-3 w-3 mr-1" />
                                {tr('Verified', 'Imethibitishwa')}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Step 2: schedule — picker while choosing, compact summary after */}
            {currentStep === 3 && selectedDate && selectedTime && (
              <CompletedSummary n={2} onChange={() => setEditingStep(2)}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{formatDateLong(selectedDate)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime12(selectedTime)}</p>
                </div>
              </CompletedSummary>
            )}
            {currentStep === 2 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    <StepChip n={2} />
                    {tr('Select Date & Time', 'Chagua Tarehe na Muda')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">{tr('Choose a date', 'Chagua tarehe')}</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                      {nextDates.map((d) => {
                        const active = selectedDate === d.iso;
                        return (
                          <button
                            type="button"
                            key={d.iso}
                            onClick={() => { setSelectedDate(d.iso); setSelectedTime(''); }}
                            className={`flex-shrink-0 w-16 rounded-xl border py-2.5 flex flex-col items-center transition-colors ${
                              active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                          >
                            <span className="text-[11px] uppercase tracking-wide opacity-80">{d.isToday ? tr('Today', 'Leo') : d.weekday}</span>
                            <span className="text-lg font-bold leading-tight">{d.day}</span>
                            <span className="text-[11px] opacity-80">{d.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">{tr('Available times', 'Muda uliopo')}</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {AVAILABLE_TIMES.map((time) => {
                          const active = selectedTime === time;
                          const taken = bookedTimes.includes(time);
                          return (
                            <button
                              type="button"
                              key={time}
                              disabled={taken}
                              onClick={() => { setSelectedTime(time); setEditingStep(null); }}
                              title={taken ? tr('Already booked', 'Tayari imeshachukuliwa') : undefined}
                              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                                taken
                                  ? 'cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground/50 line-through'
                                  : active
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/40'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime12(time)}
                            </button>
                          );
                        })}
                      </div>
                      {bookedTimes.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tr('Crossed-out times are already booked for this physiotherapist.', 'Muda uliokatwa mstari tayari umeshachukuliwa kwa physiotherapist huyu.')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: session type & notes */}
            {currentStep === 3 && selectedPhysio && selectedDate && selectedTime && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    <StepChip n={3} />
                    {tr('Session Details', 'Maelezo ya Kikao')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">{tr('Session type', 'Aina ya kikao')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(sessionTypeMeta) as SessionType[]).map((type) => {
                        const meta = sessionTypeMeta[type];
                        const Icon = meta.icon;
                        const active = sessionType === type;
                        return (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setSessionType(type)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                              active ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">{meta.label}</span>
                            <span className="text-[11px] text-muted-foreground">{meta.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">{tr('Notes for your physiotherapist (optional)', 'Maelezo kwa physiotherapist (hiari)')}</Label>
                    <Textarea
                      id="notes"
                      placeholder={tr('Symptoms or goals (optional)', 'Dalili au malengo (hiari)')}
                      className="min-h-24 mt-2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sticky summary */}
          <div className="lg:sticky lg:top-24">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{tr('Booking Summary', 'Muhtasari wa Kikao')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPhysioObj ? (
                  <>
                    <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/15">
                        <AvatarImage src={selectedPhysioObj.avatar_url || undefined} alt={physioName(selectedPhysioObj)} />
                        <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{physioName(selectedPhysioObj)}</p>
                        {selectedPhysioObj.occupation && <p className="text-xs text-muted-foreground truncate">{selectedPhysioObj.occupation}</p>}
                      </div>
                    </div>

                    <SummaryRow label={tr('Date', 'Tarehe')} value={selectedDate ? formatDateLong(selectedDate) : tr('Not selected', 'Haijachaguliwa')} />
                    <SummaryRow label={tr('Time', 'Muda')} value={selectedTime ? formatTime12(selectedTime) : tr('Not selected', 'Haijachaguliwa')} />
                    <SummaryRow label={tr('Type', 'Aina')} value={sessionTypeMeta[sessionType].label} />
                    <SummaryRow label={tr('Duration', 'Muda')} value={tr('45 minutes', 'Dakika 45')} />

                    <Button
                      className="w-full bg-gradient-hero shadow-glow font-semibold"
                      onClick={confirmBooking}
                      disabled={!canConfirm}
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{tr('Submitting...', 'Inawasilisha...')}</>
                      ) : (
                        tr('Confirm Booking', 'Thibitisha Kikao')
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {tr('You can cancel or reschedule up to 24 hours before your appointment.', 'Unaweza kughairi au kubadilisha hadi saa 24 kabla ya miadi.')}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-9 w-9 mx-auto mb-3 opacity-60" />
                    <p className="text-sm">{tr('Select a physiotherapist to get started.', 'Chagua physiotherapist kuanza.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

export default BookingPage;
