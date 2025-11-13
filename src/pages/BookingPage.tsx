import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from '@/components/Navigation';
import { Calendar, Clock, MapPin, Star, Users, Award, CheckCircle } from 'lucide-react';

const BookingPage = () => {
  const [selectedPhysio, setSelectedPhysio] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const physiotherapists = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Sports Physiotherapy',
      rating: 4.9,
      reviews: 156,
      experience: '8 years',
      location: 'Downtown Clinic',
      nextAvailable: 'Today',
      image: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedic Rehabilitation',
      rating: 4.8,
      reviews: 203,
      experience: '12 years',
      location: 'Medical Center',
      nextAvailable: 'Tomorrow',
      image: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Neurological Physiotherapy',
      rating: 4.9,
      reviews: 98,
      experience: '6 years',
      location: 'Wellness Hub',
      nextAvailable: 'Today',
      image: '/placeholder.svg'
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book a Session</h1>
          <p className="text-muted-foreground">Schedule an appointment with a licensed physiotherapist</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Physiotherapist Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Choose Your Physiotherapist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {physiotherapists.map((physio) => (
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
                            <AvatarImage src={physio.image} alt={physio.name} />
                            <AvatarFallback>{physio.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{physio.name}</h3>
                                <p className="text-primary font-medium">{physio.specialty}</p>
                              </div>
                              {selectedPhysio === physio.id && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-current" />
                                <span className="text-sm font-medium">{physio.rating}</span>
                                <span className="text-sm text-muted-foreground">({physio.reviews} reviews)</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {physio.experience}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{physio.location}</span>
                              </div>
                              <Badge 
                                variant={physio.nextAvailable === 'Today' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                Next: {physio.nextAvailable}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            {selectedPhysio && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Choose Date</Label>
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
                      <Label className="text-sm font-medium mb-3 block">Available Times</Label>
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
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPhysio ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Physiotherapist</p>
                      <p className="font-medium">
                        {physiotherapists.find(p => p.id === selectedPhysio)?.name}
                      </p>
                    </div>
                    
                    {selectedDate && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {nextWeekDates.find(d => d.date === selectedDate)?.display}
                        </p>
                      </div>
                    )}
                    
                    {selectedTime && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Session Duration</p>
                        <p className="font-medium">45 minutes</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="font-medium">$120</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Select a physiotherapist to continue</p>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            {selectedPhysio && selectedDate && selectedTime && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="session-type">Session Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">Initial Assessment</SelectItem>
                        <SelectItem value="followup">Follow-up Session</SelectItem>
                        <SelectItem value="maintenance">Maintenance Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Any specific concerns or requests..."
                      className="min-h-20"
                    />
                  </div>

                  <Button className="w-full bg-gradient-hero shadow-glow">
                    Confirm Booking - $120
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    You can cancel or reschedule up to 24 hours before your appointment
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