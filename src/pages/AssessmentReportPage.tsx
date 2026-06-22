import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ClinicalReport from '@/components/ClinicalReport';

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
              <div className="text-destructive">{error || 'Report not found'}</div>
              <Button onClick={() => navigate('/programs')} className="mt-4">
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/programs')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>

        <ClinicalReport
          program={report.program || {}}
          createdAt={report.created_at}
          source={report.source}
        />
      </div>
    </div>
  );
};

export default AssessmentReportPage;
