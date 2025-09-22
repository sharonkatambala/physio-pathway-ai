import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Video, Activity, Calendar, MessageSquare, TrendingUp, FileText } from 'lucide-react';

const PhysiotherapistDashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  const quickActions = [
    {
      title: "Patient Overview",
      description: "View all your patients",
      icon: Users,
      href: "/patients",
      color: "bg-gradient-to-br from-primary to-primary-glow"
    },
    {
      title: "Review Videos",
      description: "Analyze patient movement videos",
      icon: Video,
      href: "/video-review",
      color: "bg-gradient-to-br from-accent to-accent/80"
    },
    {
      title: "Exercise Library",
      description: "Manage exercise programs",
      icon: Activity,
      href: "/exercise-library",
      color: "bg-gradient-to-br from-secondary to-secondary/80"
    },
    {
      title: "Schedule",
      description: "Manage appointments",
      icon: Calendar,
      href: "/schedule",
      color: "bg-gradient-to-br from-muted to-muted/80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, Dr. {profile?.first_name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Manage your patients and provide excellent care with FIZIO AI
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card key={action.title} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos to Review</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">2 completed</p>
            </CardContent>
          </Card>

          <Card>
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
          <Card>
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
          <Card>
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
      </div>
    </div>
  );
};

export default PhysiotherapistDashboard;