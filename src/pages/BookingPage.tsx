import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from '@/components/Navigation';
import { Calendar, Clock, MapPin, Mail, Phone, Users, Award, CheckCircle, Loader2 } from 'lucide-react';
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
};

const BookingPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const { user, profile, role, loading } = useAuth();
  const { toast } = useToast();
  const [selectedPhysio, setSelectedPhysio] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [isLoadingPhysios, setIsLoadingPhysios] = useState(true);
  const [physioError, setPhysioError] = useState<string | null>(null);

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
          .select('*')
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

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    };
  });

  const to24Hour = (value: string) => {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return value;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  };

  const confirmBooking = async () => {
    if (!profile?.id || !user) {
      toast({
        title: tr('Please sign in', 'Tafadhali ingia'),
        description: tr('You need to be logged in to book a session.', 'Unahitaji kuingia ili kuweka kikao.'),
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPhysio || !selectedDate || !selectedTime) {
      toast({
        title: tr('Missing details', 'Taarifa hazijakamilika'),
        description: tr('Select a physiotherapist, date, and time.', 'Chagua physiotherapist, tarehe, na muda.'),
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const appointmentTime = to24Hour(selectedTime);
      const { error: apptError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          physiotherapist_id: selectedPhysio,
          appointment_date: selectedDate,
          appointment_time: appointmentTime,
          session_type: sessionType,
          status: 'pending',
          notes: notes || null
        });

      if (apptError) throw apptError;

      const { error: assignError } = await supabase
        .from('physio_patient_assignments')
        .upsert(
          { physio_id: selectedPhysio, patient_id: profile.id, status: 'active' },
          { onConflict: 'physio_id,patient_id' }
        );

      if (assignError) {
        console.warn('Assignment insert blocked:', assignError.message);
      }

      toast({
        title: tr('Booking requested', 'Ombi la kikao limewasilishwa'),
        description: tr('Your appointment request was sent to the physiotherapist.', 'Ombi lako limetumwa kwa physiotherapist.'),
      });
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error: any) {
      toast({
        title: tr('Booking failed', 'Kuweka kikao kumeshindikana'),
        description: String(error?.message || error || 'Unknown error'),
        variant: 'destructive'
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{tr('Book a Session', 'Weka Kikao')}</h1>
          <p className="text-muted-foreground">{tr('Schedule an appointment with a licensed physiotherapist', 'Panga miadi na physiotherapist aliyeidhinishwa')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Physiotherapist Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {tr('Choose Your Physiotherapist', 'Chagua Physiotherapist')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingPhysios ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : physiotherapists.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium mb-1">{tr('No physiotherapists registered yet', 'Hakuna physiotherapist aliyesajiliwa bado')}</p>
                      <p className="text-sm">{tr('Please check back later.', 'Tafadhali rudi baadaye.')}</p>
                      {physioError ? (
                        <p className="text-xs text-destructive mt-2">{physioError}</p>
                      ) : null}
                    </div>
                  ) : (
                    physiotherapists.map((physio) => {
                      const fullName = `${physio.first_name ?? ''} ${physio.last_name ?? ''}`.trim();
                      const displayName = fullName || tr('Physiotherapist', 'Physiotherapist');
                      return (
                        <Card 
                          key={physio.id} 
                          className={`cursor-pointer transition-colors border ${
                            selectedPhysio === physio.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedPhysio(physio.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src="/placeholder.svg" alt={displayName} />
                                <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold">{displayName}</h3>
                                    {physio.occupation ? (
                                      <p className="text-primary font-medium">{physio.occupation}</p>
                                    ) : null}
                                  </div>
                                  {selectedPhysio === physio.id && (
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                  {physio.phone ? (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      <span>{physio.phone}</span>
                                    </div>
                                  ) : null}
                                  {physio.email ? (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      <span>{physio.email}</span>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="mt-3">
                                  <Badge variant="secondary" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {tr('Verified', 'Imethibitishwa')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            {selectedPhysio && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    {tr('Select Date & Time', 'Chagua Tarehe na Muda')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">{tr('Choose Date', 'Chagua Tarehe')}</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {nextWeekDates.map((date) => (
                        <Button
                          key={date.date}
                          variant={selectedDate === date.date ? "default" : "outline"}
                          className="h-auto py-3 px-2 flex flex-col items-center"
                          onClick={() => setSelectedDate(date.date)}
                        >
                          <span className="text-xs">{date.display}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">{tr('Available Times', 'Muda Uliopo')}</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className="text-sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{tr('Booking Summary', 'Muhtasari wa Kikao')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPhysio ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{tr('Physiotherapist', 'Physiotherapist')}</p>
                      <p className="font-medium">
                        {(() => {
                          const match = physiotherapists.find(p => p.id === selectedPhysio);
                          if (!match) return '';
                          const fullName = `${match.first_name ?? ''} ${match.last_name ?? ''}`.trim();
                          return fullName || tr('Physiotherapist', 'Physiotherapist');
                        })()}
                      </p>
                    </div>
                    
                    {selectedDate && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{tr('Date', 'Tarehe')}</p>
                        <p className="font-medium">
                          {nextWeekDates.find(d => d.date === selectedDate)?.display}
                        </p>
                      </div>
                    )}
                    
                    {selectedTime && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{tr('Time', 'Muda')}</p>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{tr('Session Duration', 'Muda wa Kikao')}</p>
                        <p className="font-medium">{tr('45 minutes', 'Dakika 45')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{tr('Cost', 'Gharama')}</p>
                        <p className="font-medium">$120</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">{tr('Select a physiotherapist to continue', 'Chagua physiotherapist kuendelea')}</p>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            {selectedPhysio && selectedDate && selectedTime && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{tr('Additional Information', 'Taarifa za Ziada')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="session-type">{tr('Session Type', 'Aina ya Kikao')}</Label>
                    <Select value={sessionType} onValueChange={(value: 'video' | 'phone' | 'in-person') => setSessionType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={tr('Select session type', 'Chagua aina ya kikao')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">{tr('Video Session', 'Kikao cha Video')}</SelectItem>
                        <SelectItem value="phone">{tr('Phone Session', 'Kikao cha Simu')}</SelectItem>
                        <SelectItem value="in-person">{tr('In-person Session', 'Kikao cha Ana kwa Ana')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">{tr('Special Notes (Optional)', 'Maelezo Maalum (Hiari)')}</Label>
                    <Textarea 
                      id="notes" 
                      placeholder={tr('Any specific concerns or requests...', 'Masuala au maombi yoyote maalum...')}
                      className="min-h-20"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button className="w-full bg-gradient-hero shadow-glow" onClick={confirmBooking} disabled={submitting}>
                    {submitting ? tr('Submitting...', 'Inawasilisha...') : tr('Confirm Booking', 'Thibitisha Kuweka Kikao')} - $120
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    {tr('You can cancel or reschedule up to 24 hours before your appointment', 'Unaweza kughairi au kubadilisha hadi saa 24 kabla ya miadi')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
