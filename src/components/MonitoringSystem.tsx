import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Activity, Heart, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);

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
      title: tr("Assessment Recorded", "Tathmini Imehifadhiwa"),
      description: tr("Your pain and fatigue levels have been updated.", "Viwango vyako vya maumivu na uchovu vimesasishwa.")
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
    const en = [
      'No exertion', 'Very light', 'Light', 'Moderate', 'Somewhat hard',
      'Hard', 'Very hard', 'Very hard', 'Very hard', 'Extremely hard', 'Maximum exertion'
    ];
    const sw = [
      'Hakuna juhudi', 'Nyepesi sana', 'Nyepesi', 'Wastani', 'Kiasi ngumu',
      'Ngumu', 'Ngumu sana', 'Ngumu sana', 'Ngumu sana', 'Ngumu kupita kiasi', 'Juhudi ya juu kabisa'
    ];
    const arr = language === 'sw' ? sw : en;
    return arr[level] || arr[arr.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tr('Current Pain', 'Maumivu ya Sasa')}</p>
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
                <p className="text-sm text-muted-foreground">{tr('Fatigue (BPE)', 'Uchovu (BPE)')}</p>
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
                <p className="text-sm text-muted-foreground">{tr('Last Updated', 'Ilisasishwa')}</p>
                <p className="text-lg font-semibold">{tr('2 hours ago', 'Saa 2 zilizopita')}</p>
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
            {tr('Pain & Fatigue Assessment', 'Tathmini ya Maumivu na Uchovu')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pain Level (VAS Scale) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {tr('Pain Level (VAS Scale)', 'Kiwango cha Maumivu (VAS)')}: <span className={`${getPainLevelColor(painLevel[0])}`}>{painLevel[0]}/10</span>
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
                <span>{tr('No Pain', 'Hakuna Maumivu')}</span>
                <span>{tr('Moderate', 'Wastani')}</span>
                <span>{tr('Severe Pain', 'Maumivu Makali')}</span>
              </div>
            </div>
          </div>

          {/* Fatigue Level (BPE Scale) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {tr('Fatigue Level (Borg Scale)', 'Kiwango cha Uchovu (Borg)')}: <span className="text-primary">{fatigueLevel[0]}/10</span>
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
                <span>{tr('No exertion', 'Hakuna juhudi')}</span>
                <span>{tr('Moderate', 'Wastani')}</span>
                <span>{tr('Max exertion', 'Juhudi ya juu')}</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {tr('Current', 'Sasa')}: <span className="font-medium">{getFatigueLevelDescription(fatigueLevel[0])}</span>
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold">{tr('Additional Notes', 'Maelezo ya Ziada')}</Label>
            <Textarea
              id="notes"
              placeholder={tr('How are you feeling today?', 'Unajisikiaje leo?')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmitAssessment} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            {tr('Record Assessment', 'Hifadhi Tathmini')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{tr('Recent Assessments', 'Tathmini za Hivi Karibuni')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: tr('Today, 2:00 PM', 'Leo, 2:00 PM'), pain: 4, fatigue: 5, trend: 'down' },
              { date: tr('Yesterday, 6:00 PM', 'Jana, 6:00 PM'), pain: 6, fatigue: 7, trend: 'down' },
              { date: tr('2 days ago, 1:00 PM', 'Siku 2 zilizopita, 1:00 PM'), pain: 7, fatigue: 8, trend: 'up' }
            ].map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium">{assessment.date}</p>
                    <div className="flex space-x-4 text-muted-foreground">
                      <span>{tr('Pain', 'Maumivu')}: {assessment.pain}/10</span>
                      <span>{tr('Fatigue', 'Uchovu')}: {assessment.fatigue}/10</span>
                    </div>
                  </div>
                </div>
                <Badge variant={assessment.trend === 'down' ? 'default' : 'secondary'}>
                  {assessment.trend === 'down' ? tr('Improving', 'Inaboreka') : tr('Monitor', 'Fuatilia')}
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