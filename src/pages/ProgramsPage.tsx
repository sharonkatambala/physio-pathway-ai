import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Dumbbell, Repeat, Stethoscope, Copy, Check, ClipboardList, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProgramsPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || loading) return;
      setLoadingPrograms(true);
      setError(null);
      try {
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
          .select('id, assessment_id, program, created_at, confidence, source')
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

  const copyJson = (p: any) => {
    navigator.clipboard?.writeText(JSON.stringify(p.program, null, 2));
    setCopiedId(p.id);
    setTimeout(() => setCopiedId((id) => (id === p.id ? null : id)), 2000);
  };

  const deleteReport = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    // .select() confirms a row was actually removed; RLS silently deletes
    // nothing when the user lacks permission, and that must surface as an error.
    const { data, error: delError } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', confirmDelete.id)
      .select('id');
    setDeleting(false);
    if (delError || !data?.length) {
      toast.error(tr('Could not delete report', 'Imeshindwa kufuta ripoti'), {
        description: delError?.message ?? tr('The report was not deleted. Please try again.', 'Ripoti haikufutwa. Tafadhali jaribu tena.'),
      });
      return;
    }
    setPrograms((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    setConfirmDelete(null);
    toast.success(tr('Report deleted', 'Ripoti imefutwa'));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr('My Exercise Programs', 'Mipango Yangu ya Mazoezi')}</h1>
            <p className="text-sm text-muted-foreground">
              {tr('Personalized programs generated from your assessments.', 'Mipango binafsi iliyotokana na tathmini zako.')}
            </p>
          </div>
        </div>

        {loadingPrograms && <p className="text-sm text-muted-foreground">{tr('Loading programs...', 'Inapakia programu...')}</p>}

        {!loadingPrograms && error && (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-destructive">
              {tr('Error loading programs', 'Hitilafu wakati wa kupakia programu')}: {error}
            </CardContent>
          </Card>
        )}

        {!loadingPrograms && !error && programs.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <p className="font-medium text-foreground">{tr('No programs yet', 'Bado hakuna programu')}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {tr('Complete an assessment to generate your first personalized exercise program.', 'Kamilisha tathmini ili kuunda programu yako ya kwanza ya mazoezi.')}
              </p>
              <Button onClick={() => navigate('/assessment')} className="mt-1 bg-gradient-hero shadow-soft">
                {tr('Start Assessment', 'Anza Tathmini')}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {programs.map((p) => {
            const program = p.program || {};
            const report = program.report || {};
            const exercises = Array.isArray(program.exercises) ? program.exercises : [];
            const phase = program.phase || program?.schedule?.current_phase;
            return (
              <Card key={p.id} className="shadow-card transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">
                        {program.title || tr('Personalized Exercise Program', 'Programu Binafsi ya Mazoezi')}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {tr('Created', 'Imeundwa')} {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate(`/report/${p.id}`)} className="bg-gradient-hero shadow-soft">
                        <FileText className="mr-2 h-4 w-4" />
                        {tr('View Full Report', 'Tazama Ripoti Kamili')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyJson(p)}>
                        {copiedId === p.id ? <Check className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copiedId === p.id ? tr('Copied', 'Imenakiliwa') : tr('Copy JSON', 'Nakili JSON')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirmDelete(p)}
                        title={tr('Delete report', 'Futa ripoti')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.summary && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {phase && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {tr('Phase', 'Awamu')}: {phase}
                      </Badge>
                    )}
                    {program.weekly_target && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Repeat className="h-3.5 w-3.5" />
                        {program.weekly_target} {tr('sessions/week', 'vikao/wiki')}
                      </Badge>
                    )}
                    {exercises.length > 0 && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {exercises.length} {tr('exercises', 'mazoezi')}
                      </Badge>
                    )}
                    {p.confidence != null && (
                      <Badge
                        variant="secondary"
                        className={`gap-1.5 ${p.source === 'fallback' ? 'bg-warning/10 text-warning hover:bg-warning/10' : 'bg-primary/10 text-primary hover:bg-primary/10'}`}
                        title={tr(
                          'How much the AI trusted this program, based on how much detail your assessment provided.',
                          'Ni kiasi gani AI iliamini programu hii, kulingana na undani wa tathmini yako.'
                        )}
                      >
                        {p.source === 'fallback'
                          ? tr('Basic plan', 'Mpango wa msingi')
                          : tr(`AI confidence: ${Math.round(p.confidence * 100)}%`, `Uhakika wa AI: ${Math.round(p.confidence * 100)}%`)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr('Delete this report?', 'Futa ripoti hii?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr(
                'This permanently removes the report and its exercise program from your account. This cannot be undone.',
                'Hii itaondoa kabisa ripoti na programu yake ya mazoezi kutoka kwenye akaunti yako. Haiwezi kurejeshwa.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{tr('Cancel', 'Ghairi')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteReport(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deleting ? tr('Deleting...', 'Inafuta...') : tr('Delete report', 'Futa ripoti')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProgramsPage;
