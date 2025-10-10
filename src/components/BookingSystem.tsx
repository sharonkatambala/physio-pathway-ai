import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin,
  User,
  Star,
  Phone,
  MessageSquare,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface Physiotherapist {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  occupation: string;
  phone: string;
}

interface Appointment {
  id: string;
  physiotherapist_id: string;
  appointment_date: string;
  appointment_time: string;
  session_type: 'in-person' | 'video' | 'phone';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  physiotherapist: {
    first_name: string;
    last_name: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  type: 'morning' | 'afternoon' | 'evening';
}

const BookingSystem = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'in-person' | 'video' | 'phone'>('video');
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const timeSlots: TimeSlot[] = [
    { time: '9:00 AM', available: true, type: 'morning' },
    { time: '10:00 AM', available: true, type: 'morning' },
    { time: '11:00 AM', available: true, type: 'morning' },
    { time: '12:00 PM', available: true, type: 'afternoon' },
    { time: '1:00 PM', available: true, type: 'afternoon' },
    { time: '2:00 PM', available: true, type: 'afternoon' },
    { time: '3:00 PM', available: true, type: 'afternoon' },
    { time: '4:00 PM', available: true, type: 'afternoon' },
    { time: '5:00 PM', available: true, type: 'evening' },
    { time: '6:00 PM', available: true, type: 'evening' }
  ];

  useEffect(() => {
    fetchPhysiotherapists();
    fetchAppointments();
  }, []);

  const fetchPhysiotherapists = async () => {
    try {
      // Get all physiotherapist user IDs from user_roles table
      const { data: physioRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'physiotherapist');

      if (roleError) throw roleError;

      const physioUserIds = (physioRoles || []).map(r => r.user_id);

      if (physioUserIds.length === 0) {
        setPhysiotherapists([]);
        return;
      }

      // Then fetch the profiles for those users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', physioUserIds);

      if (error) throw error;
      setPhysiotherapists(data || []);
    } catch (error) {
      console.error('Error fetching physiotherapists:', error);
      toast({
        title: "Error",
        description: "Failed to load physiotherapists.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          physiotherapist:physiotherapist_id(first_name, last_name)
        `)
        .eq('patient_id', profile.id)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments((data || []) as any);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedPhysiotherapist || !selectedDate || !selectedTime || !profile?.id) {
      toast({
        title: "Missing Information",
        description: "Please select a physiotherapist, date, and time.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          physiotherapist_id: selectedPhysiotherapist,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: selectedTime,
          session_type: sessionType,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: `Your ${sessionType} session has been scheduled successfully.`
      });

      // Reset form and refresh appointments
      setSelectedPhysiotherapist('');
      setSelectedTime('');
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const formatAppointmentDate = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (appointmentDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return appointmentDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="book" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="book">Book New Session</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Physiotherapist Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Select Physiotherapist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {physiotherapists.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No physiotherapists available yet.</p>
                  </div>
                ) : (
                  physiotherapists.map((therapist) => (
                    <div 
                      key={therapist.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedPhysiotherapist === therapist.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => setSelectedPhysiotherapist(therapist.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {therapist.first_name} {therapist.last_name}
                            </h4>
                          </div>
                          {therapist.occupation && (
                            <p className="text-sm text-primary">{therapist.occupation}</p>
                          )}
                          {therapist.phone && (
                            <p className="text-xs text-muted-foreground">{therapist.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <div className="space-y-6">
              {/* Session Type */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Session Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {['video', 'phone', 'in-person'].map((type) => (
                      <Button
                        key={type}
                        variant={sessionType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionType(type as any)}
                        className="flex flex-col items-center space-y-1 h-auto py-3"
                      >
                        {getSessionTypeIcon(type)}
                        <span className="capitalize text-xs">{type.replace('-', ' ')}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Available Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className="text-xs"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleBookAppointment} 
                className="w-full"
                disabled={!selectedPhysiotherapist || !selectedDate || !selectedTime}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-medium mb-2">No Upcoming Appointments</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Book your first session to get personalized physiotherapy care
                    </p>
                    <Button onClick={() => (document.querySelector('[value="book"]') as HTMLElement)?.click()}>
                      Book New Session
                    </Button>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            Dr. {appointment.physiotherapist.first_name} {appointment.physiotherapist.last_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>
                              {formatAppointmentDate(appointment.appointment_date)}, {appointment.appointment_time}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getSessionTypeIcon(appointment.session_type)}
                              <span className="ml-1 capitalize">{appointment.session_type.replace('-', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status === 'confirmed' ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {appointment.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        {appointment.session_type === 'video' && (
                          <Button size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingSystem;
