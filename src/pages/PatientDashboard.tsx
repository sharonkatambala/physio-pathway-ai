import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Activity, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

const PatientDashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'patient') {
    return <Navigate to="/physiotherapist-dashboard" replace />;
  }

  const quickActions = [
    {
      title: "Start Assessment",
      description: "Begin your health assessment",
      icon: FileText,
      href: "/assessment",
      color: "bg-gradient-to-br from-primary to-primary-glow"
    },
    {
      title: "Upload Video",
      description: "Upload movement videos for analysis",
      icon: Video,
      href: "/video-upload",
      color: "bg-gradient-to-br from-accent to-accent/80"
    },
    {
      title: "Exercise Program",
      description: "View your personalized exercises",
      icon: Activity,
      href: "/exercises",
      color: "bg-gradient-to-br from-secondary to-secondary/80"
    },
    {
      title: "Book Session",
      description: "Schedule with a physiotherapist",
      icon: Calendar,
      href: "/booking",
      color: "bg-gradient-to-br from-muted to-muted/80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.first_name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Continue your physiotherapy journey with FIZIO AI
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
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exercises Completed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12/15</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pain Level</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/10</div>
              <p className="text-xs text-muted-foreground">Improving</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Completed shoulder mobility exercises</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="bg-accent/10 p-2 rounded-full">
                  <Video className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Uploaded progress video</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="bg-secondary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Upcoming session with Dr. Smith</p>
                  <p className="text-sm text-muted-foreground">Tomorrow at 2:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;