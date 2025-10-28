import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const ProgramsPage = () => {
  const { user, loading } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user || loading) return;
      setLoadingPrograms(true);
      setError(null);
      try {
        // First get assessments for this patient
        const { data: assessments, error: aErr } = await supabase
          .from('assessments')
          .select('id, created_at')
          .eq('patient_user_id', user.id);

        if (aErr) throw aErr;

        const assessmentIds = (assessments || []).map((a: any) => a.id);
        if (assessmentIds.length === 0) {
          setPrograms([]);
          setLoadingPrograms(false);
          return;
        }

        const { data: recs, error: rErr } = await supabase
          .from('recommendations')
          .select('id, assessment_id, program, created_at')
          .in('assessment_id', assessmentIds)
          .order('created_at', { ascending: false });

        if (rErr) throw rErr;

        setPrograms(recs || []);
      } catch (e: any) {
        const msg = String(e?.message || e || 'Unknown error');
        setError(msg);
      } finally {
        setLoadingPrograms(false);
      }
    };

    load();
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Exercise Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPrograms && <div>Loading programs...</div>}
            {!loadingPrograms && error && (
              <div className="text-destructive">Error loading programs: {error}</div>
            )}
            {!loadingPrograms && !error && programs.length === 0 && (
              <div className="text-muted-foreground">No exercise programs found for your account.</div>
            )}

            <div className="space-y-4 mt-4">
              {programs.map((p) => (
                <Card key={p.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Program created</div>
                        <div className="font-medium">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(JSON.stringify(p.program, null, 2))}>
                          Copy JSON
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(p.program, null, 2)}</pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramsPage;
