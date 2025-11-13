import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Activity, Heart, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface MonitoringData {
  painLevel: number;
  fatigueLevel: number;
  notes: string;
  date: string;
}

const MonitoringSystem = () => {
  const [painLevel, setPainLevel] = useState([5]);
  const [fatigueLevel, setFatigueLevel] = useState([6]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSubmitAssessment = () => {
    const data: MonitoringData = {
      painLevel: painLevel[0],
      fatigueLevel: fatigueLevel[0],
      notes,
      date: new Date().toISOString()
    };
    
    // Here you would typically save to database
    console.log('Monitoring data:', data);
    
    toast({
      title: "Assessment Recorded",
      description: "Your pain and fatigue levels have been updated."
    });
    
    // Reset form
    setPainLevel([5]);
    setFatigueLevel([6]);
    setNotes('');
  };

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'text-success';
    if (level <= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getFatigueLevelDescription = (level: number) => {
    const descriptions = [
      'No exertion', 'Very light', 'Light', 'Moderate', 'Somewhat hard',
      'Hard', 'Very hard', 'Very hard', 'Very hard', 'Extremely hard', 'Maximum exertion'
    ];
    return descriptions[level] || 'Maximum exertion';
  };

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Pain</p>
                <p className={`text-2xl font-bold ${getPainLevelColor(painLevel[0])}`}>
                  {painLevel[0]}/10
                </p>
              </div>
              <Activity className={`h-8 w-8 ${getPainLevelColor(painLevel[0])}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fatigue (BPE)</p>
                <p className="text-2xl font-bold text-primary">{fatigueLevel[0]}/10</p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-lg font-semibold">2 hours ago</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Pain & Fatigue Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pain Level (VAS Scale) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Pain Level (VAS Scale): <span className={`${getPainLevelColor(painLevel[0])}`}>{painLevel[0]}/10</span>
            </Label>
            <div className="space-y-2">
              <Slider
                value={painLevel}
                onValueChange={setPainLevel}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No Pain</span>
                <span>Moderate</span>
                <span>Severe Pain</span>
              </div>
            </div>
          </div>

          {/* Fatigue Level (BPE Scale) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Fatigue Level (Borg Scale): <span className="text-primary">{fatigueLevel[0]}/10</span>
            </Label>
            <div className="space-y-2">
              <Slider
                value={fatigueLevel}
                onValueChange={setFatigueLevel}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No exertion</span>
                <span>Moderate</span>
                <span>Max exertion</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Current: <span className="font-medium">{getFatigueLevelDescription(fatigueLevel[0])}</span>
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="How are you feeling today? Any specific areas of concern?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmitAssessment} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Record Assessment
          </Button>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Today, 2:00 PM', pain: 4, fatigue: 5, trend: 'down' },
              { date: 'Yesterday, 6:00 PM', pain: 6, fatigue: 7, trend: 'down' },
              { date: '2 days ago, 1:00 PM', pain: 7, fatigue: 8, trend: 'up' }
            ].map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium">{assessment.date}</p>
                    <div className="flex space-x-4 text-muted-foreground">
                      <span>Pain: {assessment.pain}/10</span>
                      <span>Fatigue: {assessment.fatigue}/10</span>
                    </div>
                  </div>
                </div>
                <Badge variant={assessment.trend === 'down' ? 'default' : 'secondary'}>
                  {assessment.trend === 'down' ? 'Improving' : 'Monitor'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringSystem;