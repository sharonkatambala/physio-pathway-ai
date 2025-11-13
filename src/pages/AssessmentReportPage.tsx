import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Activity, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AssessmentReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user || loading || !reportId) return;
      setLoadingReport(true);
      setError(null);
      try {
        const { data, error: rErr } = await supabase
          .from('recommendations')
          .select('id, assessment_id, program, created_at, confidence, source')
          .eq('id', reportId)
          .single();

        if (rErr) throw rErr;
        setReport(data);
      } catch (e: any) {
        const msg = String(e?.message || e || 'Unknown error');
        setError(msg);
      } finally {
        setLoadingReport(false);
      }
    };

    load();
  }, [user, loading, reportId]);

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">Loading report...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive">
                {error || 'Report not found'}
              </div>
              <Button onClick={() => navigate('/programs')} className="mt-4">
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const programData = report.program || {};
  const reportData = programData.report || {};
  const exercises = programData.exercises || [];
  const schedule = programData.schedule || {};

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/programs')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>

        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  {programData.title || 'Assessment Report'}
                </CardTitle>
                <CardDescription className="mt-2">
                  {programData.description || 'Your personalized assessment and exercise program'}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                {report.source && (
                  <Badge variant="secondary" className="mt-2">
                    {report.source === 'ai' ? 'AI Generated' : report.source}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Clinical Report Card */}
        {reportData.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <p className="text-foreground leading-relaxed">{reportData.summary}</p>
              </div>

              <Separator />

              {/* Findings */}
              {reportData.findings && reportData.findings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Key Findings
                  </h3>
                  <ul className="space-y-2">
                    {reportData.findings.map((finding: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-foreground leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Recommendations */}
              {reportData.recommendations && reportData.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {reportData.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                        <span className="text-foreground leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exercise Program Card */}
        {exercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exercise Program</CardTitle>
              <CardDescription>
                Your personalized exercise plan tailored to your condition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {exercises.map((exercise: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-lg">{exercise.name}</h4>
                    <div className="flex gap-2">
                      {exercise.phase && (
                        <Badge variant="outline">{exercise.phase}</Badge>
                      )}
                      {exercise.difficulty && (
                        <Badge>{exercise.difficulty}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">{exercise.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {exercise.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {exercise.duration}
                      </div>
                    )}
                    {exercise.frequency && (
                      <div>
                        <span className="font-medium">Frequency:</span> {exercise.frequency}
                      </div>
                    )}
                    {exercise.target_area && (
                      <div>
                        <span className="font-medium">Target Area:</span> {exercise.target_area}
                      </div>
                    )}
                    {exercise.equipment && (
                      <div>
                        <span className="font-medium">Equipment:</span> {exercise.equipment}
                      </div>
                    )}
                  </div>

                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Instructions:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {exercise.instructions.map((inst: string, i: number) => (
                          <li key={i} className="text-muted-foreground">{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {exercise.precautions && exercise.precautions.length > 0 && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <h5 className="font-medium mb-2 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Precautions:
                      </h5>
                      <ul className="space-y-1 text-sm">
                        {exercise.precautions.map((prec: string, i: number) => (
                          <li key={i} className="text-muted-foreground">• {prec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Schedule Card */}
        {(schedule.early || schedule.intermediate || schedule.advanced) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Program Schedule</CardTitle>
              <CardDescription>
                Progressive phases for your rehabilitation journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.early && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Early Phase</Badge>
                  </h4>
                  <p className="text-muted-foreground">{schedule.early.summary}</p>
                </div>
              )}
              {schedule.intermediate && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Intermediate Phase</Badge>
                  </h4>
                  <p className="text-muted-foreground">{schedule.intermediate.summary}</p>
                </div>
              )}
              {schedule.advanced && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Advanced Phase</Badge>
                  </h4>
                  <p className="text-muted-foreground">{schedule.advanced.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {programData.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{programData.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssessmentReportPage;
