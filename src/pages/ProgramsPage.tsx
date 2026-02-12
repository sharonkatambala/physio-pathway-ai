import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProgramsPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const navigate = useNavigate();
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
            <CardTitle>{tr('My Exercise Programs', 'Mipango Yangu ya Mazoezi')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPrograms && <div>{tr('Loading programs...', 'Inapakia programu...')}</div>}
            {!loadingPrograms && error && (
              <div className="text-destructive">{tr('Error loading programs', 'Hitilafu wakati wa kupakia programu')}: {error}</div>
            )}
            {!loadingPrograms && !error && programs.length === 0 && (
              <div className="text-muted-foreground">{tr('No exercise programs found for your account.', 'Hakuna programu za mazoezi zilizopatikana kwa akaunti yako.')}</div>
            )}

            <div className="space-y-4 mt-4">
              {programs.map((p) => (
                <Card key={p.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">{tr('Program created', 'Programu imeundwa')}</div>
                        <div className="font-medium">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/report/${p.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {tr('View Full Report', 'Tazama Ripoti Kamili')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(JSON.stringify(p.program, null, 2))}>
                          {tr('Copy JSON', 'Nakili JSON')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {p.program?.report && (
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">{tr('Report', 'Ripoti')}</div>
                        <div className="mt-1">
                          <div className="font-medium">{p.program.report.summary}</div>
                          <ul className="list-disc pl-5 mt-2 text-sm">
                            {(p.program.report.findings || []).map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground">{tr('Exercises', 'Mazoezi')}</div>
                      <ul className="mt-2 space-y-2">
                        {(p.program.exercises || []).map((ex: any, i: number) => (
                          <li key={i} className="p-3 rounded-md border border-border/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{ex.name}</div>
                                <div className="text-xs text-muted-foreground">{ex.target_area ? ex.target_area + ' - ' : ''}{ex.difficulty || ex.phase}</div>
                              </div>
                              <div className="text-xs text-muted-foreground">{ex.frequency} - {ex.duration}</div>
                            </div>
                            {Array.isArray(ex.instructions) && (
                              <ul className="list-disc pl-5 mt-2 text-sm">
                                {ex.instructions.map((s: string, j: number) => <li key={j}>{s}</li>)}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
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
