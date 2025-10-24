import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Download,
  Share,
  Award
} from 'lucide-react';

const ProgressTracker = () => {
  const weeklyProgress = [
    { day: 'Mon', exercises: 5, completed: 5, pain: 3 },
    { day: 'Tue', exercises: 4, completed: 4, pain: 4 },
    { day: 'Wed', exercises: 6, completed: 4, pain: 2 },
    { day: 'Thu', exercises: 5, completed: 5, pain: 3 },
    { day: 'Fri', exercises: 4, completed: 4, pain: 2 },
    { day: 'Sat', exercises: 3, completed: 2, pain: 4 },
    { day: 'Sun', exercises: 4, completed: 0, pain: null }
  ];

  const milestones = [
    { title: 'First Week Complete', achieved: true, date: '5 days ago' },
    { title: '7-Day Exercise Streak', achieved: true, date: '3 days ago' },
    { title: 'Pain Level Below 3', achieved: true, date: '2 days ago' },
    { title: '50% Mobility Improvement', achieved: false, target: '2 weeks' },
    { title: 'Return to Normal Activities', achieved: false, target: '1 month' }
  ];

  const getCompletionRate = () => {
    const totalExercises = weeklyProgress.reduce((acc, day) => acc + day.exercises, 0);
    const completedExercises = weeklyProgress.reduce((acc, day) => acc + day.completed, 0);
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const getAveragePain = () => {
    const painLevels = weeklyProgress.filter(day => day.pain !== null).map(day => day.pain!);
    return (painLevels.reduce((acc, pain) => acc + pain, 0) / painLevels.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Completion</p>
                <p className="text-2xl font-bold text-primary">{getCompletionRate()}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Pain</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-success">{getAveragePain()}/10</p>
                  <TrendingDown className="h-4 w-4 text-success" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exercise Streak</p>
                <p className="text-2xl font-bold text-secondary">7 days</p>
              </div>
              <Award className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Program Week</p>
                <p className="text-2xl font-bold text-accent">Week 2</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Activity Overview</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div className="text-sm text-muted-foreground">
                      {day.completed}/{day.exercises} exercises
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {day.pain !== null && (
                      <div className="text-sm">
                        Pain: <span className={`font-medium ${
                          day.pain <= 3 ? 'text-success' : day.pain <= 6 ? 'text-warning' : 'text-destructive'
                        }`}>{day.pain}/10</span>
                      </div>
                    )}
                    <Badge variant={day.completed === day.exercises ? 'default' : 'secondary'}>
                      {day.completed === day.exercises ? 'Complete' : 'Partial'}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(day.completed / day.exercises) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones & Goals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Milestones & Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    milestone.achieved ? 'bg-success' : 'bg-muted border-2 border-primary'
                  }`}>
                    {milestone.achieved && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.achieved ? `Achieved ${milestone.date}` : `Target: ${milestone.target}`}
                    </p>
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge variant="default">Completed</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>AI Recovery Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-success/5 rounded-lg border-l-4 border-success">
              <h4 className="font-semibold text-success mb-2">Positive Trend</h4>
              <p className="text-sm">Your pain levels have decreased by 40% over the past week. Keep up the excellent work with your exercise routine!</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold text-primary mb-2">Recommendation</h4>
              <p className="text-sm">Consider increasing exercise intensity by 10% next week. Your consistent performance shows you're ready for the next level.</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2">Focus Area</h4>
              <p className="text-sm">Your weekend exercise compliance could improve. Try setting reminders for Saturday and Sunday sessions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;