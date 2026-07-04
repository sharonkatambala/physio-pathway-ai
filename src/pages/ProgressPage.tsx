import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Activity, Calendar, Flame, HeartPulse, Plus, LineChart as LineChartIcon, ChevronDown, ChevronLeft, ChevronRight, Trash2, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface ProgressEntry {
  id: string;
  created_at: string;
  pain_level: number | null;
  energy_level: number | null;
  adherence: number | null;
  notes: string | null;
}

interface RecommendationSummary {
  id: string;
  created_at: string | null;
  program: any;
  source?: string | null;
  confidence?: number | null;
}

const COLORS = {
  pain: "hsl(var(--warning))",
  energy: "hsl(var(--primary))",
  adherence: "hsl(var(--primary))",
  axis: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
};

const INITIAL_VISIBLE = 4;
const PAGE_SIZE = 5;

type ChartRange = "30d" | "90d" | "all";

const painColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v <= 3
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v <= 6
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const energyColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v >= 7
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 4
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const adherenceColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v >= 7
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 4
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const ProgressPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === "sw" ? sw : en);

  const phaseLabel = (phase: string) => {
    const map: Record<string, [string, string]> = {
      early: ["Early", "Mapema"],
      intermediate: ["Intermediate", "Kati"],
      advanced: ["Advanced", "Ya hali ya juu"],
    };
    const [en, sw] = map[phase?.toLowerCase()] ?? [phase, phase];
    return tr(en, sw);
  };

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [latestRecommendation, setLatestRecommendation] = useState<RecommendationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [timelinePage, setTimelinePage] = useState(0);
  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  const [form, setForm] = useState({ pain_level: "", energy_level: "", adherence: "", notes: "" });

  const latestEntry = entries[0];

  // Everything the charts and the stat cards show comes from this one
  // filtered set, so the numbers above the graph always match the graph.
  const chartEntries = useMemo(() => {
    if (chartRange === "all") return entries;
    const days = chartRange === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter((e) => new Date(e.created_at) >= cutoff);
  }, [entries, chartRange]);

  const hasData = chartEntries.length > 0;

  const averageOf = (values: (number | null)[]) => {
    const nums = values.filter((v): v is number => v !== null);
    if (!nums.length) return null;
    return Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10;
  };

  const averagePain = useMemo(() => averageOf(chartEntries.map((e) => e.pain_level)), [chartEntries]);
  const averageEnergy = useMemo(() => averageOf(chartEntries.map((e) => e.energy_level)), [chartEntries]);
  const adherenceScore = useMemo(() => averageOf(chartEntries.map((e) => e.adherence)), [chartEntries]);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!user) { setLoading(false); return; }
      try {
        const { data: recData } = await supabase
          .from("recommendations")
          .select("id, created_at, program, source, confidence, assessments!inner(patient_user_id)")
          .eq("assessments.patient_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setLatestRecommendation(recData ?? null);

        const { data: progressData, error } = await supabase
          .from("progress_entries")
          .select("id, created_at, pain_level, energy_level, adherence, notes")
          .eq("patient_user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setEntries(progressData ?? []);
      } catch (error: any) {
        toast({
          title: tr("Unable to load progress", "Imeshindwa kupakia maendeleo"),
          description: error?.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast, user, authLoading]);

  const handleCreateEntry = async () => {
    if (!user) return;
    const payload = {
      patient_user_id: user.id,
      pain_level: form.pain_level ? Number(form.pain_level) : null,
      energy_level: form.energy_level ? Number(form.energy_level) : null,
      adherence: form.adherence ? Number(form.adherence) : null,
      notes: form.notes.trim() || null,
    };
    setSaving(true);
    const { error, data } = await supabase
      .from("progress_entries")
      .insert(payload)
      .select("id, created_at, pain_level, energy_level, adherence, notes")
      .single();
    setSaving(false);
    if (error) {
      toast({ title: tr("Could not save entry", "Imeshindwa kuhifadhi"), description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => [data, ...prev]);
    setForm({ pain_level: "", energy_level: "", adherence: "", notes: "" });
    setDialogOpen(false);
    toast({ title: tr("Progress entry added", "Rekodi imeongezwa"), description: tr("Saved.", "Imehifadhiwa.") });
  };

  const handleDeleteEntry = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("progress_entries").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: tr("Could not delete entry", "Imeshindwa kufuta rekodi"), description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRegenerateReport = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      // Fetch the latest assessment to use as the source for regeneration
      const { data: assessmentRow, error: aErr } = await supabase
        .from("assessments")
        .select("*")
        .eq("patient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (aErr || !assessmentRow) throw new Error(tr("No assessment found to regenerate from.", "Hakuna tathmini iliyopatikana kwa kuzalisha upya."));

      const payload = {
        assessmentData: { healthData: assessmentRow, questionnaireAnswers: assessmentRow, hasVideo: false, language },
        assessmentId: assessmentRow.id,
      };
      const { error: fnErr } = await supabase.functions.invoke("generate-exercise-program", { body: payload });
      if (fnErr) throw fnErr;

      // Reload the latest recommendation
      const { data: recData } = await supabase
        .from("recommendations")
        .select("id, created_at, program, source, confidence, assessments!inner(patient_user_id)")
        .eq("assessments.patient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatestRecommendation(recData ?? null);
      toast({ title: tr("Report regenerated", "Ripoti imezaliwa upya"), description: tr("Your report is now in the current language.", "Ripoti yako ipo sasa katika lugha ya sasa.") });
    } catch (err: any) {
      toast({ title: tr("Regeneration failed", "Kuzalisha upya kumeshindwa"), description: err?.message, variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  };

  // Build a continuous day-by-day series across the whole selected range so
  // the x-axis shows every date, not just the days with check-ins. Days
  // without data stay null (the line bridges them, dots mark real entries).
  const trendData = useMemo(() => {
    if (!chartEntries.length) return [];
    const locale = language === "sw" ? "sw-KE" : "en-GB";
    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const avg = (nums: number[]) =>
      nums.length ? Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10 : null;

    // Average multiple check-ins on the same day.
    const buckets = new Map<string, { pain: number[]; energy: number[] }>();
    chartEntries.forEach((e) => {
      const k = dayKey(new Date(e.created_at));
      const b = buckets.get(k) ?? { pain: [], energy: [] };
      if (e.pain_level !== null) b.pain.push(e.pain_level);
      if (e.energy_level !== null) b.energy.push(e.energy_level);
      buckets.set(k, b);
    });

    const start = new Date();
    if (chartRange === "all") {
      start.setTime(new Date(chartEntries[chartEntries.length - 1].created_at).getTime());
    } else {
      start.setDate(start.getDate() - (chartRange === "30d" ? 30 : 90));
    }
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const days: Record<string, string | number | null>[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const b = buckets.get(dayKey(d));
      days.push({
        date: d.toLocaleDateString(locale, { month: "short", day: "numeric" }),
        [tr("Pain", "Maumivu")]: b ? avg(b.pain) : null,
        [tr("Energy", "Nguvu")]: b ? avg(b.energy) : null,
      });
    }
    return days;
  }, [chartEntries, language, chartRange]);

  const adherenceData = useMemo(
    () =>
      [...chartEntries].reverse().map((e) => ({
        label: new Date(e.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB", { month: "short", day: "numeric" }),
        value: e.adherence ?? 0,
      })),
    [chartEntries, language]
  );

  const programData = latestRecommendation?.program || {};
  const reportData = programData.report || {};
  const reportFindings: string[] = Array.isArray(reportData.findings) ? reportData.findings : [];
  const reportRecs: string[] = Array.isArray(reportData.recommendations) ? reportData.recommendations : [];

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    fontSize: 12,
  };

  const ChartEmpty = ({ icon: Icon }: { icon: typeof LineChartIcon }) => (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-30" />
      <p className="text-sm">
        {entries.length > 0
          ? tr("No check-ins in this period — try a longer range.", "Hakuna rekodi katika kipindi hiki — jaribu kipindi kirefu zaidi.")
          : tr("No data yet — add a check-in to see your trend.", "Hakuna data bado — ongeza rekodi kuona mwelekeo wako.")}
      </p>
    </div>
  );

  const painKey = tr("Pain", "Maumivu");
  const energyKey = tr("Energy", "Nguvu");

  const rangeLabel =
    chartRange === "30d" ? tr("last 30 days", "siku 30 zilizopita")
    : chartRange === "90d" ? tr("last 90 days", "siku 90 zilizopita")
    : tr("all time", "muda wote");

  const rangeOptions: { value: ChartRange; label: string }[] = [
    { value: "30d", label: tr("30 days", "Siku 30") },
    { value: "90d", label: tr("90 days", "Siku 90") },
    { value: "all", label: tr("All", "Zote") },
  ];

  const rangeSelector = (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      {rangeOptions.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setChartRange(value)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
            chartRange === value
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // Timeline: newest 4 first; "Show more" switches to 5-per-page browsing
  // with arrows to move toward older entries. Page is clamped so deletions
  // never leave the user on an empty page.
  const maxTimelinePage = Math.max(0, Math.ceil(Math.max(0, entries.length - INITIAL_VISIBLE) / PAGE_SIZE) - 1);
  const effectivePage = Math.min(timelinePage, maxTimelinePage);
  const timelineStart = timelineExpanded ? INITIAL_VISIBLE + effectivePage * PAGE_SIZE : 0;
  const visibleEntries = timelineExpanded
    ? entries.slice(timelineStart, timelineStart + PAGE_SIZE)
    : entries.slice(0, INITIAL_VISIBLE);
  const hasMore = !timelineExpanded && entries.length > INITIAL_VISIBLE;
  const hasOlderPage = timelineExpanded && timelineStart + PAGE_SIZE < entries.length;
  const hasNewerPage = timelineExpanded && effectivePage > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr("Progress", "Maendeleo")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tr("Track how you feel, review your plan, and see your improvements over time.", "Fuatilia jinsi unavyojisikia, kagua mpango wako, na uone maendeleo yako kwa muda.")}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-hero shadow-soft self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                {tr("Add Entry", "Ongeza Rekodi")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{tr("Add Progress Entry", "Ongeza Rekodi ya Maendeleo")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{tr("Pain level (0-10)", "Kiwango cha maumivu (0-10)")}</Label>
                  <Input type="number" min="0" max="10" value={form.pain_level}
                    onChange={(e) => setForm((p) => ({ ...p, pain_level: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>{tr("Energy level (0-10)", "Kiwango cha nguvu (0-10)")}</Label>
                  <Input type="number" min="0" max="10" value={form.energy_level}
                    onChange={(e) => setForm((p) => ({ ...p, energy_level: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>{tr("Adherence (0-10)", "Ufuataji (0-10)")}</Label>
                  <Input type="number" min="0" max="10" value={form.adherence}
                    onChange={(e) => setForm((p) => ({ ...p, adherence: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>{tr("Notes", "Maelezo")}</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>{tr("Cancel", "Ghairi")}</Button>
                  <Button onClick={handleCreateEntry} disabled={saving} className="bg-gradient-hero shadow-soft">
                    {saving ? tr("Saving...", "Inahifadhi...") : tr("Save Entry", "Hifadhi Rekodi")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary stat cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: tr("Pain Trend", "Mwelekeo wa Maumivu"), icon: Flame, value: averagePain, hint: `${tr("Average,", "Wastani,")} ${rangeLabel}` },
            { title: tr("Energy Level", "Kiwango cha Nguvu"), icon: HeartPulse, value: averageEnergy, hint: `${tr("Average,", "Wastani,")} ${rangeLabel}` },
            { title: tr("Plan Adherence", "Ufuataji wa Mpango"), icon: Activity, value: adherenceScore, hint: `${tr("Average,", "Wastani,")} ${rangeLabel}` },
          ].map(({ title, icon: Icon, value, hint }) => (
            <Card key={title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {value !== null ? `${value}/10` : tr("No data", "Hakuna data")}
                </div>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pain + Energy trend — full width, tall */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  {tr("Pain and Energy Trend", "Mwelekeo wa Maumivu na Nguvu")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {tr("Pain (lower is better) vs. energy (higher is better) over your check-ins.", "Maumivu (chini ni bora) dhidi ya nguvu (juu ni bora) kwa rekodi zako.")}
                </p>
              </div>
              {rangeSelector}
            </div>
          </CardHeader>
          <CardContent className="h-[340px]">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="painFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.pain} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.pain} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.energy} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.energy} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: COLORS.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: COLORS.grid }} minTickGap={28} interval="preserveStartEnd" />
                  <YAxis domain={[0, 10]} tick={{ fill: COLORS.axis, fontSize: 12 }} width={28} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLORS.axis, strokeDasharray: "4 4", strokeOpacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
                  <Area type="monotone" name={painKey} dataKey={painKey} stroke={COLORS.pain} strokeWidth={2.5} fill="url(#painFill)" connectNulls dot={{ fill: COLORS.pain, r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" name={energyKey} dataKey={energyKey} stroke={COLORS.energy} strokeWidth={2.5} fill="url(#energyFill)" connectNulls dot={{ fill: COLORS.energy, r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty icon={LineChartIcon} />
            )}
          </CardContent>
        </Card>

        {/* Adherence bar + latest check-in — side by side */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                {tr("Adherence", "Ufuataji")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{tr("How consistently you completed sessions.", "Jinsi ulivyokamilisha vikao kwa uthabiti.")}</p>
            </CardHeader>
            <CardContent className="h-52">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="label" tick={{ fill: COLORS.axis, fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fill: COLORS.axis, fontSize: 11 }} width={24} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name={tr("Adherence", "Ufuataji")} fill={COLORS.adherence} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmpty icon={Activity} />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                {tr("Latest Check-In", "Rekodi ya Hivi Karibuni")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{tr("Your most recent progress entry.", "Rekodi yako ya maendeleo ya hivi karibuni.")}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {latestEntry ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestEntry.created_at).toLocaleString(language === "sw" ? "sw-KE" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${painColor(latestEntry.pain_level)}`}>
                      {tr("Pain", "Maumivu")} {latestEntry.pain_level ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${energyColor(latestEntry.energy_level)}`}>
                      {tr("Energy", "Nguvu")} {latestEntry.energy_level ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${adherenceColor(latestEntry.adherence)}`}>
                      {tr("Adherence", "Ufuataji")} {latestEntry.adherence ?? "—"}
                    </span>
                  </div>
                  {latestEntry.notes && (
                    <p className="rounded-md border border-border bg-muted/40 p-3 text-foreground/80">{latestEntry.notes}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">{tr("No entries yet.", "Hakuna rekodi bado.")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Program / Report */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">{tr("AI Program Connection", "Muunganisho wa Programu ya AI")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr("Review the latest program data that powers your recovery plan.", "Kagua data ya programu ya hivi karibuni inayoendesha mpango wako wa kupona.")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5 text-xs"
                onClick={handleRegenerateReport}
                disabled={regenerating}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                {regenerating ? tr("Regenerating...", "Inazalisha upya...") : tr("Regenerate", "Zalisha upya")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRecommendation ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{tr("Program title", "Jina la programu")}</p>
                    <p className="text-base font-medium text-foreground">
                      {programData.title || tr("Personalized Exercise Program", "Programu Binafsi ya Mazoezi")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{tr("Phase", "Awamu")}</p>
                    <p className="text-base font-medium text-foreground">
                      {phaseLabel(programData.phase || programData?.schedule?.current_phase || "early")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{tr("Weekly target", "Lengo la wiki")}</p>
                    <p className="text-base font-medium text-foreground">
                      {programData.weekly_target
                        ? `${programData.weekly_target} ${tr("sessions", "vikao")}`
                        : tr("Not set", "Haijawekwa")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{tr("Report date", "Tarehe ya ripoti")}</p>
                    <p className="text-base font-medium text-foreground">
                      {latestRecommendation.created_at
                        ? new Date(latestRecommendation.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB")
                        : tr("Unknown", "Haijulikani")}
                    </p>
                  </div>
                </div>
                {reportData.summary && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{tr("Summary", "Muhtasari")}</p>
                    <p className="text-sm text-foreground/90">{reportData.summary}</p>
                  </div>
                )}
                {(reportFindings.length > 0 || reportRecs.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {reportFindings.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">{tr("Key findings", "Matokeo muhimu")}</p>
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {reportFindings.map((f, i) => (
                            <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" /><span>{f}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reportRecs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">{tr("Recommendations", "Mapendekezo")}</p>
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {reportRecs.map((r, i) => (
                            <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" /><span>{r}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{tr("No report found yet.", "Hakuna ripoti iliyopatikana bado.")}</p>
                <p>{tr("Complete an assessment to generate your personalized report.", "Kamilisha tathmini ili kutengeneza ripoti yako binafsi.")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Timeline — paginated clean design */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">{tr("Progress Timeline", "Ratiba ya Maendeleo")}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {tr("Your check-in history. Color shows condition: green is good, amber is moderate, red needs attention.", "Historia ya rekodi zako. Rangi inaonyesha hali: kijani ni nzuri, njano ni wastani, nyekundu inahitaji uangalifu.")}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-4">{tr("Loading entries...", "Inapakia rekodi...")}</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">{tr("No progress entries yet. Add your first check-in above.", "Hakuna rekodi bado. Ongeza rekodi yako ya kwanza hapo juu.")}</p>
            ) : (
              <div className="space-y-0">
                {visibleEntries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <div className={`flex flex-col sm:flex-row sm:items-start gap-3 py-4 ${idx < visibleEntries.length - 1 ? "border-b border-border/60" : ""}`}>
                      {/* Date/time column */}
                      <div className="flex-shrink-0 w-36">
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(entry.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${painColor(entry.pain_level)}`}>
                          {tr("Pain", "Maumivu")} {entry.pain_level ?? "—"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${energyColor(entry.energy_level)}`}>
                          {tr("Energy", "Nguvu")} {entry.energy_level ?? "—"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${adherenceColor(entry.adherence)}`}>
                          {tr("Adherence", "Ufuataji")} {entry.adherence ?? "—"}
                        </span>
                        {entry.notes && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs hidden sm:block">
                            {entry.notes.length > 60 ? entry.notes.slice(0, 60) + "..." : entry.notes}
                          </span>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                        title={tr("Delete entry", "Futa rekodi")}
                      >
                        <Trash2 className={`h-3.5 w-3.5 ${deletingId === entry.id ? "animate-pulse" : ""}`} />
                      </button>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground pb-3 sm:hidden pl-0">{entry.notes}</p>
                    )}
                  </motion.div>
                ))}

                {hasMore && (
                  <div className="pt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => { setTimelineExpanded(true); setTimelinePage(0); }}
                    >
                      <ChevronDown className="h-4 w-4" />
                      {tr(`Show more (${entries.length - INITIAL_VISIBLE} older)`, `Onyesha zaidi (${entries.length - INITIAL_VISIBLE} za zamani)`)}
                    </Button>
                  </div>
                )}

                {timelineExpanded && (
                  <div className="flex items-center justify-between gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={!hasNewerPage}
                      onClick={() => setTimelinePage(Math.max(0, effectivePage - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {tr("Newer", "Mpya zaidi")}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setTimelineExpanded(false); setTimelinePage(0); }}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors"
                    >
                      {tr("Back to latest", "Rudi kwa za hivi karibuni")}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={!hasOlderPage}
                      onClick={() => setTimelinePage(effectivePage + 1)}
                    >
                      {tr("Older", "Za zamani")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="pt-3 text-right">
                  <p className="text-xs text-muted-foreground">
                    {timelineExpanded
                      ? tr(
                          `Showing ${timelineStart + 1}–${Math.min(timelineStart + PAGE_SIZE, entries.length)} of ${entries.length} entries`,
                          `Inaonyesha ${timelineStart + 1}–${Math.min(timelineStart + PAGE_SIZE, entries.length)} kati ya ${entries.length} rekodi`
                        )
                      : tr(`Showing ${visibleEntries.length} of ${entries.length} entries`, `Inaonyesha ${visibleEntries.length} kati ya ${entries.length} rekodi`)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProgressPage;
