import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from '@/components/Navigation';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap
} from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    {
      title: "Pain Level",
      value: "3/10",
      change: "-2 from yesterday",
      positive: true,
      icon: Heart,
      color: "text-success"
    },
    {
      title: "Exercises Completed",
      value: "8/10",
      change: "80% completion rate",
      positive: true,
      icon: CheckCircle,
      color: "text-primary"
    },
    {
      title: "Active Days",
      value: "12",
      change: "This month",
      positive: true,
      icon: Calendar,
      color: "text-secondary"
    },
    {
      title: "Total Time",
      value: "2.5h",
      change: "This week",
      positive: true,
      icon: Clock,
      color: "text-accent"
    }
  ];

  const recentActivities = [
    {
      type: "exercise",
      title: "Completed Morning Routine",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "assessment",
      title: "Pain Level Updated",
      time: "4 hours ago",
      status: "info"
    },
    {
      type: "milestone",
      title: "7-Day Streak Achieved!",
      time: "Yesterday",
      status: "success"
    },
    {
      type: "reminder",
      title: "Evening Exercises Due",
      time: "In 2 hours",
      status: "pending"
    }
  ];

  const upcomingTasks = [
    {
      title: "Lower Back Stretches",
      time: "6:00 PM",
      duration: "15 min",
      priority: "high"
    },
    {
      title: "Progress Check-in",
      time: "Tomorrow",
      duration: "5 min",
      priority: "medium"
    },
    {
      title: "Physiotherapist Session",
      time: "Friday 2:00 PM",
      duration: "45 min",
      priority: "high"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress Dashboard</h1>
          <p className="text-muted-foreground">Track your recovery journey and stay motivated</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className={`text-xs ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Exercise Completion</span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pain Reduction</span>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mobility Improvement</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-success' :
                        activity.status === 'success' ? 'bg-success' :
                        activity.status === 'pending' ? 'bg-warning' :
                        'bg-primary'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.status === 'success' && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          <Zap className="h-3 w-3 mr-1" />
                          Milestone
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Goals */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Today's Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm line-through text-muted-foreground">Morning exercises</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-border rounded-full" />
                    <span className="text-sm">Pain level check-in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-border rounded-full" />
                    <span className="text-sm">Evening stretches</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.duration}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{task.time}</span>
                          </div>
                        </div>
                        {task.priority === 'high' && (
                          <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                        )}
                      </div>
                      {index < upcomingTasks.length - 1 && (
                        <div className="border-b border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Update Pain Level
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;