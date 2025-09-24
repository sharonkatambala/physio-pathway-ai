import { useState } from 'react';
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
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Physiotherapist {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  availability: string[];
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  bio: string;
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
  const { toast } = useToast();

  const physiotherapists: Physiotherapist[] = [
    {
      id: '1',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Back Pain & Posture Specialist',
      experience: '8 years',
      rating: 4.9,
      reviewCount: 127,
      avatar: '',
      availability: ['Monday', 'Wednesday', 'Friday'],
      sessionTypes: ['in-person', 'video', 'phone'],
      bio: 'Specializes in lower back pain, postural correction, and workplace ergonomics.'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Sports Injury & Rehabilitation',
      experience: '12 years',
      rating: 4.8,
      reviewCount: 203,
      avatar: '',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      sessionTypes: ['in-person', 'video'],
      bio: 'Expert in sports medicine, ACL rehabilitation, and return-to-play protocols.'
    },
    {
      id: '3',
      name: 'Dr. Sarah Johnson',
      specialization: 'Geriatric & Neurological Rehab',
      experience: '15 years',
      rating: 4.9,
      reviewCount: 89,
      avatar: '',
      availability: ['Monday', 'Tuesday', 'Thursday'],
      sessionTypes: ['in-person', 'video', 'phone'],
      bio: 'Specializes in elderly care, stroke recovery, and Parkinson\'s disease management.'
    }
  ];

  const timeSlots: TimeSlot[] = [
    { time: '9:00 AM', available: true, type: 'morning' },
    { time: '10:00 AM', available: false, type: 'morning' },
    { time: '11:00 AM', available: true, type: 'morning' },
    { time: '12:00 PM', available: true, type: 'afternoon' },
    { time: '1:00 PM', available: false, type: 'afternoon' },
    { time: '2:00 PM', available: true, type: 'afternoon' },
    { time: '3:00 PM', available: true, type: 'afternoon' },
    { time: '4:00 PM', available: true, type: 'afternoon' },
    { time: '5:00 PM', available: false, type: 'evening' },
    { time: '6:00 PM', available: true, type: 'evening' }
  ];

  const upcomingAppointments = [
    {
      id: '1',
      physiotherapist: 'Dr. Emily Rodriguez',
      date: 'Today',
      time: '2:00 PM',
      type: 'video',
      status: 'confirmed'
    },
    {
      id: '2',
      physiotherapist: 'Dr. Michael Chen',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'in-person',
      status: 'pending'
    }
  ];

  const handleBookAppointment = () => {
    if (!selectedPhysiotherapist || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a physiotherapist, date, and time.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Appointment Booked!",
      description: `Your ${sessionType} session has been scheduled successfully.`
    });

    // Reset form
    setSelectedPhysiotherapist('');
    setSelectedTime('');
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

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
                {physiotherapists.map((therapist) => (
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
                        <AvatarImage src={therapist.avatar} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{therapist.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{therapist.rating}</span>
                            <span className="text-xs text-muted-foreground">({therapist.reviewCount})</span>
                          </div>
                        </div>
                        <p className="text-sm text-primary">{therapist.specialization}</p>
                        <p className="text-xs text-muted-foreground mb-2">{therapist.experience} experience</p>
                        <p className="text-sm text-muted-foreground">{therapist.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {therapist.sessionTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {getSessionTypeIcon(type)}
                              <span className="ml-1 capitalize">{type.replace('-', ' ')}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.physiotherapist}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{appointment.date}, {appointment.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {getSessionTypeIcon(appointment.type)}
                            <span className="ml-1 capitalize">{appointment.type.replace('-', ' ')}</span>
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
                      {appointment.type === 'video' && (
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {upcomingAppointments.length === 0 && (
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