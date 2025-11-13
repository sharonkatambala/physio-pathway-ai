import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PatientManagement from '@/components/PatientManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Video, Activity, Calendar, MessageSquare, TrendingUp, FileText, Settings, Book } from 'lucide-react';

const PhysiotherapistDashboard = () => {
  const { user, profile, role, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, Dr. {profile?.first_name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Manage your patients and provide excellent care with FIZIO AI
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 new this week</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos to Review</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Pending review</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-muted-foreground">2 completed</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8/5</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Patient Activity */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Patient Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Video className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Sarah Johnson uploaded progress video</p>
                        <p className="text-sm text-muted-foreground">30 minutes ago</p>
                      </div>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-accent/10 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Mike Chen completed exercises</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-secondary/10 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Emma Davis sent a message</p>
                        <p className="text-sm text-muted-foreground">4 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm">Reply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">John Smith</p>
                          <p className="text-sm text-muted-foreground">2:00 PM - Follow-up session</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Join</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-accent/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">Lisa Martinez</p>
                          <p className="text-sm text-muted-foreground">3:30 PM - Initial assessment</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Prepare</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-secondary/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">Robert Wilson</p>
                          <p className="text-sm text-muted-foreground">4:45 PM - Progress review</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Notes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="videos">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Patient Videos Review</h3>
                <p className="text-muted-foreground mb-4">
                  Review and analyze patient exercise videos with AI-assisted feedback
                </p>
                <Button>Review Videos</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Exercise Library Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create, modify, and assign personalized exercise programs
                </p>
                <Button>Manage Exercises</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Educational Materials</h3>
                <p className="text-muted-foreground mb-4">
                  Provide patients with educational resources on ergonomics and prevention
                </p>
                <Button>Manage Resources</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Practice Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your practice preferences and notification settings
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