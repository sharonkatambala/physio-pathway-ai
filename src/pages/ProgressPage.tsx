import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProgressPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestReport, setLatestReport] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pain: 5,
    completed: 0,
    energy: 5,
    sleep: 5,
    notes: '',
  });

  useEffect(() => {
    if (!user || authLoading) return;
    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('patient_user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching progress', error);
      } else {
        setEntries(data as any[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;
    const fetchLatestReport = async () => {
      try {
        const { data: assessments, error: aErr } = await supabase
          .from('assessments')
          .select('id, created_at, pain_level, red_flag')
          .eq('patient_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (aErr) throw aErr;
        const latestAssessment = (assessments || [])[0];
        if (!latestAssessment) {
          setLatestReport(null);
          return;
        }

        const { data: recs, error: rErr } = await supabase
          .from('recommendations')
          .select('id, created_at, program')
          .eq('assessment_id', latestAssessment.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (rErr) throw rErr;
        const latestRec = (recs || [])[0] || null;
        setLatestReport({
          assessment: latestAssessment,
          recommendation: latestRec,
        });
      } catch (e) {
        console.error('Error loading latest report', e);
        setLatestReport(null);
      }
    };

    fetchLatestReport();
  }, [user, authLoading]);

  const metrics = useMemo(() => {
    const totalEntries = entries.length;
    const painValues = entries
      .map((e) => (typeof e.pain_level === 'number' ? e.pain_level : null))
      .filter((v) => v !== null) as number[];
    const avgPain = painValues.length
      ? Math.round((painValues.reduce((a, b) => a + b, 0) / painValues.length) * 10) / 10
      : null;
    const totalCompleted = entries.reduce((acc, e) => acc + (e.completed_exercises_count ?? 0), 0);
    const lastEntry = entries.length
      ? new Date(entries[entries.length - 1].created_at)
      : null;
    const last7Days = entries.filter((e) => {
      const created = new Date(e.created_at).getTime();
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return created >= cutoff;
    });
    const adherence = last7Days.length
      ? Math.min(100, Math.round((last7Days.length / 7) * 100))
      : 0;
    const latestEntry = entries.length ? entries[entries.length - 1] : null;

    return {
      totalEntries,
      avgPain,
      totalCompleted,
      lastEntry,
      last7Days,
      adherence,
      latestEntry,
    };
  }, [entries]);

  const chartData = useMemo(() => {
    return entries
      .slice(-14)
      .map((e) => ({
        date: new Date(e.created_at).toLocaleDateString(),
        pain: typeof e.pain_level === 'number' ? e.pain_level : null,
        completed: e.completed_exercises_count ?? 0,
      }));
  }, [entries]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: tr('Not signed in', 'Hujaingia'),
        description: tr('Please sign in to log your progress.', 'Tafadhali ingia ili kurekodi maendeleo.'),
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    const payload = {
      patient_user_id: user.id,
      pain_level: form.pain,
      completed_exercises_count: form.completed,
      notes: form.notes,
      data: {
        energy: form.energy,
        sleep: form.sleep,
      },
    };
    const { error } = editingEntry
      ? await supabase.from('progress_entries').update(payload).eq('id', editingEntry.id)
      : await supabase.from('progress_entries').insert(payload);
    if (error) {
      toast({
        title: tr('Save failed', 'Imeshindikana kuhifadhi'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingEntry ? tr('Progress updated', 'Maendeleo yamesasishwa') : tr('Progress saved', 'Maendeleo yamehifadhiwa'),
        description: tr('Nice work! Keep logging to improve your plan.', 'Kazi nzuri! Endelea kurekodi ili kuboresha mpango.'),
      });
      setOpen(false);
      setEditingEntry(null);
      setForm({ pain: 5, completed: 0, energy: 5, sleep: 5, notes: '' });
      const { data } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('patient_user_id', user.id)
        .order('created_at', { ascending: true });
      setEntries(data || []);
    }
    setSaving(false);
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setForm({ pain: 5, completed: 0, energy: 5, sleep: 5, notes: '' });
    setOpen(true);
  };

  const openEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setForm({
      pain: typeof entry.pain_level === 'number' ? entry.pain_level : 5,
      completed: entry.completed_exercises_count ?? 0,
      energy: entry.data?.energy ?? 5,
      sleep: entry.data?.sleep ?? 5,
      notes: entry.notes ?? '',
    });
    setOpen(true);
  };

  const quickLogToday = async () => {
    if (!user) {
      toast({
        title: tr('Not signed in', 'Hujaingia'),
        description: tr('Please sign in to log your progress.', 'Tafadhali ingia ili kurekodi maendeleo.'),
        variant: 'destructive',
      });
      return;
    }
    const basePain = typeof metrics.latestEntry?.pain_level === 'number' ? metrics.latestEntry.pain_level : 5;
    const baseEnergy = metrics.latestEntry?.data?.energy ?? 5;
    const baseSleep = metrics.latestEntry?.data?.sleep ?? 5;
    const { error } = await supabase.from('progress_entries').insert({
      patient_user_id: user.id,
      pain_level: basePain,
      completed_exercises_count: 0,
      notes: '',
      data: {
        energy: baseEnergy,
        sleep: baseSleep,
      },
    });
    if (error) {
      toast({
        title: tr('Save failed', 'Imeshindikana kuhifadhi'),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: tr('Quick log saved', 'Rekodi ya haraka imehifadhiwa'),
      description: tr('You can edit details any time.', 'Unaweza kuhariri maelezo wakati wowote.'),
    });
    const { data } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('patient_user_id', user.id)
      .order('created_at', { ascending: true });
    setEntries(data || []);
  };

  const reportSummary = latestReport?.recommendation?.program?.report?.summary;
  const reportFindings = latestReport?.recommendation?.program?.report?.findings || [];
  const reportId = latestReport?.recommendation?.id || null;
  const assessmentRisk = latestReport?.assessment?.red_flag
    ? tr('High', 'Juu')
    : tr('Moderate', 'Wastani');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{tr('Progress Dashboard', 'Dashibodi ya Maendeleo')}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {tr(
                'Track how you feel, how consistent you are, and what your next best step should be.',
                'Fuatilia jinsi unavyojisikia, uthabiti wako, na hatua inayofuata bora.'
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/assessment">{tr('Run New Assessment', 'Fanya Tathmini Mpya')}</Link>
            </Button>
            <Button className="bg-gradient-hero" onClick={openNewEntry}>
              {tr('Add Progress Entry', 'Ongeza Taarifa ya Maendeleo')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{tr('Entries Logged', 'Rekodi Zilizowekwa')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.totalEntries}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.lastEntry
                  ? tr('Last update', 'Sasisho la mwisho') + ` - ${metrics.lastEntry.toLocaleDateString()}`
                  : tr('No entries yet', 'Bado hakuna rekodi')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{tr('Average Pain', 'Wastani wa Maumivu')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.avgPain ?? '-'}</div>
              <p className="text-xs text-muted-foreground mt-2">{tr('Scale 0-10', 'Kiwango 0-10')}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{tr('Exercises Completed', 'Mazoezi Yaliyokamilika')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.totalCompleted}</div>
              <p className="text-xs text-muted-foreground mt-2">{tr('All-time count', 'Jumla ya muda wote')}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{tr('Weekly Adherence', 'Ufuatiliaji wa Wiki')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.adherence}%</div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${metrics.adherence}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <Card className="border-border/60 shadow-card">
            <CardHeader>
              <CardTitle>{tr('Assessment Snapshot', 'Muhtasari wa Tathmini')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-foreground/80">
                  {tr('Primary concern', 'Tatizo kuu')}: {reportSummary ? tr('See report', 'Tazama ripoti') : tr('Not available', 'Haipatikani')}
                </span>
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-foreground/80">
                  {tr('Risk level', 'Kiwango cha hatari')}: {assessmentRisk}
                </span>
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-foreground/80">
                  {tr('Focus', 'Lengo')}: {tr('Mobility + stability', 'Uhamaji + uthabiti')}
                </span>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                {reportSummary
                  ? reportSummary
                  : tr(
                      'No AI report found yet. Complete an assessment to generate a personalized report and exercise plan.',
                      'Hakuna ripoti ya AI bado. Maliza tathmini ili kupata ripoti na mpango wa mazoezi.'
                    )}
              </div>
              {reportFindings.length > 0 && (
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {reportFindings.slice(0, 3).map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" disabled={!reportId}>
                  <Link to={reportId ? `/report/${reportId}` : '/programs'}>
                    {tr('View Latest Report', 'Tazama Ripoti ya Mwisho')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/exercises">{tr('Recommended Exercises', 'Mazoezi Yanayopendekezwa')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card">
            <CardHeader>
              <CardTitle>{tr('Quick Check-In', 'Ukaguzi wa Haraka')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{tr('Pain today', 'Maumivu leo')}</span>
                <span className="text-foreground">{metrics.latestEntry?.pain_level ?? tr('Not logged', 'Haijaandikwa')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{tr('Energy', 'Nguvu')}</span>
                <span className="text-foreground">
                  {metrics.latestEntry?.data?.energy ?? tr('Not logged', 'Haijaandikwa')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{tr('Sleep quality', 'Ubora wa usingizi')}</span>
                <span className="text-foreground">
                  {metrics.latestEntry?.data?.sleep ?? tr('Not logged', 'Haijaandikwa')}
                </span>
              </div>
              <Button size="sm" className="bg-gradient-hero w-full" onClick={quickLogToday}>
                {tr('Log Today', 'Rekodi Leo')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <Card className="border-border/60 shadow-card">
            <CardHeader>
              <CardTitle>{tr('Pain Trend (Last 14)', 'Mwenendo wa Maumivu (Siku 14)')}</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {tr('Add entries to see your pain trend.', 'Ongeza rekodi ili kuona mwenendo wa maumivu.')}
                </div>
              ) : (
                <ChartContainer
                  config={{
                    pain: { label: tr('Pain', 'Maumivu'), color: 'hsl(var(--primary))' },
                    completed: { label: tr('Completed', 'Iliyokamilika'), color: 'hsl(var(--accent))' },
                  }}
                  className="h-[260px]"
                >
                  <ComposedChart data={chartData} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="pain"
                      stroke="var(--color-pain)"
                      fill="var(--color-pain)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="completed"
                      fill="var(--color-completed)"
                      radius={[6, 6, 0, 0]}
                      opacity={0.6}
                    />
                  </ComposedChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card">
            <CardHeader>
              <CardTitle>{tr('Progress Timeline', 'Ratiba ya Maendeleo')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>{tr('Loading...', 'Inapakia...')}</div>
              ) : entries.length === 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-lg border border-dashed border-border/60 p-4">
                    {tr(
                      'No progress entries yet. Add your first log to unlock trends, pain insights, and AI recommendations.',
                      'Bado hakuna taarifa za maendeleo. Ongeza rekodi ya kwanza ili kupata mwenendo, maumivu, na mapendekezo ya AI.'
                    )}
                  </div>
                  <div className="rounded-lg border border-dashed border-border/60 p-4">
                    {tr(
                      'Tip: Log after each session. Even short notes help the AI tailor your plan.',
                      'Kidokezo: Rekodi baada ya kila kikao. Hata maelezo mafupi husaidia AI kuboresha mpango.'
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                {entries.slice().reverse().map((e) => (
                  <div key={e.id} className="rounded-lg border border-border/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span>{new Date(e.created_at).toLocaleString()}</span>
                      <Button variant="ghost" size="sm" onClick={() => openEditEntry(e)}>
                        {tr('Edit', 'Hariri')}
                      </Button>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">{tr('Pain', 'Maumivu')}: </span>
                        <span className="text-foreground">{e.pain_level ?? '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Completed', 'Iliyokamilika')}: </span>
                          <span className="text-foreground">{e.completed_exercises_count ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Energy', 'Nguvu')}: </span>
                          <span className="text-foreground">{e.data?.energy ?? '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Sleep', 'Usingizi')}: </span>
                          <span className="text-foreground">{e.data?.sleep ?? '-'}</span>
                        </div>
                      </div>
                      {e.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {tr('Notes', 'Maelezo')}: {e.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{tr('Log Today', 'Rekodi Leo')}</DialogTitle>
              <DialogDescription>
                {tr('Quickly capture how you feel after your session.', 'Rekodi kwa haraka jinsi unavyojisikia baada ya kikao.')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>{tr('Pain level', 'Kiwango cha maumivu')}</span>
                  <span className="font-medium">{form.pain}</span>
                </div>
                <Slider value={[form.pain]} min={0} max={10} step={1} onValueChange={(v) => setForm((f) => ({ ...f, pain: v[0] }))} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>{tr('Energy', 'Nguvu')}</span>
                  <span className="font-medium">{form.energy}</span>
                </div>
                <Slider value={[form.energy]} min={0} max={10} step={1} onValueChange={(v) => setForm((f) => ({ ...f, energy: v[0] }))} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>{tr('Sleep quality', 'Ubora wa usingizi')}</span>
                  <span className="font-medium">{form.sleep}</span>
                </div>
                <Slider value={[form.sleep]} min={0} max={10} step={1} onValueChange={(v) => setForm((f) => ({ ...f, sleep: v[0] }))} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">{tr('Exercises completed', 'Mazoezi yaliyokamilika')}</label>
                <Input
                  type="number"
                  min={0}
                  value={form.completed}
                  onChange={(e) => setForm((f) => ({ ...f, completed: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">{tr('Notes', 'Maelezo')}</label>
                <Textarea
                  placeholder={tr('Any pain triggers, wins, or notes...', 'Maumivu, mafanikio, au maelezo...')}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                {tr('Cancel', 'Ghairi')}
              </Button>
              <Button className="bg-gradient-hero" onClick={handleSave} disabled={saving}>
                {saving ? tr('Saving...', 'Inahifadhi...') : editingEntry ? tr('Update Entry', 'Sasisha') : tr('Save Entry', 'Hifadhi')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProgressPage;
