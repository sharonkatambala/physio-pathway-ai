import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { TrendingDown, TrendingUp, Activity, Calendar, ClipboardCheck, Flame, HeartPulse, Plus, LineChart as LineChartIcon, ChevronDown, ChevronLeft, ChevronRight, Trash2, RefreshCw } from "lucide-react";
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
  pain_level: number | null; // NPRS 0-10
  function_score: number | null; // PSFS-style main-activity ability 0-10
  sessions_done: number | null; // exercise sessions completed this week
  sessions_target: number | null; // prescribed weekly target at entry time
  groc: number | null; // Global Rating of Change -7..+7
  ears_score: number | null; // Exercise Adherence Rating Scale 0-24
  energy_level: number | null; // legacy entries only
  adherence: number | null; // legacy entries only
  notes: string | null;
}

const ENTRY_COLUMNS =
  "id, created_at, pain_level, function_score, sessions_done, sessions_target, groc, ears_score, energy_level, adherence, notes";

// EARS items (Newman-Beinart et al. 2017). Responses are agreement 0-4
// (0 = completely agree .. 4 = completely disagree); positively worded items
// are reverse-scored so the 0-24 total always reads higher = better adherence.
const EARS_ITEMS: { en: string; sw: string; positive: boolean }[] = [
  { en: "I do my exercises as often as recommended", sw: "Nafanya mazoezi yangu mara nyingi kama ilivyopendekezwa", positive: true },
  { en: "I forget to do my exercises", sw: "Nasahau kufanya mazoezi yangu", positive: false },
  { en: "I do less exercise than recommended by my healthcare professional", sw: "Nafanya mazoezi machache kuliko ilivyopendekezwa na mtaalamu wangu wa afya", positive: false },
  { en: "I fit my exercises into my regular routine", sw: "Naingiza mazoezi yangu kwenye ratiba yangu ya kawaida", positive: true },
  { en: "I don't get round to doing my exercises", sw: "Sifikii kufanya mazoezi yangu", positive: false },
  { en: "I do most, or all, of my exercises", sw: "Nafanya mengi, au yote, ya mazoezi yangu", positive: true },
];

const EARS_RESPONSES: { en: string; sw: string }[] = [
  { en: "Completely agree", sw: "Nakubali kabisa" },
  { en: "Agree", sw: "Nakubali" },
  { en: "Neither agree nor disagree", sw: "Sikubali wala sikatai" },
  { en: "Disagree", sw: "Sikubali" },
  { en: "Completely disagree", sw: "Sikubali kabisa" },
];

// Jaeschke 15-point Global Rating of Change scale.
const GROC_OPTIONS: { value: number; en: string; sw: string }[] = [
  { value: 7, en: "A very great deal better", sw: "Bora zaidi kabisa" },
  { value: 6, en: "A great deal better", sw: "Bora zaidi sana" },
  { value: 5, en: "Quite a bit better", sw: "Bora kwa kiasi kikubwa" },
  { value: 4, en: "Moderately better", sw: "Bora kiasi" },
  { value: 3, en: "Somewhat better", sw: "Bora kidogo" },
  { value: 2, en: "A little better", sw: "Nafuu kidogo" },
  { value: 1, en: "A tiny bit better (almost the same)", sw: "Nafuu kidogo sana (karibu sawa)" },
  { value: 0, en: "About the same", sw: "Karibu sawa" },
  { value: -1, en: "A tiny bit worse (almost the same)", sw: "Mbaya kidogo sana (karibu sawa)" },
  { value: -2, en: "A little worse", sw: "Mbaya kidogo" },
  { value: -3, en: "Somewhat worse", sw: "Mbaya kiasi fulani" },
  { value: -4, en: "Moderately worse", sw: "Mbaya kiasi" },
  { value: -5, en: "Quite a bit worse", sw: "Mbaya kwa kiasi kikubwa" },
  { value: -6, en: "A great deal worse", sw: "Mbaya zaidi sana" },
  { value: -7, en: "A very great deal worse", sw: "Mbaya zaidi kabisa" },
];

const REVIEW_INTERVAL_DAYS = 28; // GROC + EARS cadence

const daysSince = (iso: string | null | undefined) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : Infinity;

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

// higher = better (function 0-10, legacy energy)
const goodHighColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v >= 7
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 4
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const pctColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v >= 70
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 40
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const grocColor = (v: number | null) =>
  v === null
    ? "bg-muted/60 text-muted-foreground"
    : v >= 2
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= -1
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
  const [form, setForm] = useState({ pain_level: "", function_score: "", sessions_done: "", groc: "", notes: "" });

  // EARS questionnaire state
  const [earsOpen, setEarsOpen] = useState(false);
  const [earsAnswers, setEarsAnswers] = useState<(number | null)[]>(Array(EARS_ITEMS.length).fill(null));
  const [earsSaving, setEarsSaving] = useState(false);

  const latestEntry = entries.find((e) => e.ears_score === null) ?? entries[0];

  // Periodic measures: due again after 28 days.
  const lastGrocAt = entries.find((e) => e.groc !== null)?.created_at ?? null;
  const grocDue = daysSince(lastGrocAt) >= REVIEW_INTERVAL_DAYS;
  const latestEars = entries.find((e) => e.ears_score !== null) ?? null;
  const earsDue = daysSince(latestEars?.created_at) >= REVIEW_INTERVAL_DAYS;

  const weeklyTarget: number | null = (() => {
    const t = latestRecommendation?.program?.weekly_target;
    const n = Number(t);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

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
  const averageFunction = useMemo(() => averageOf(chartEntries.map((e) => e.function_score)), [chartEntries]);

  // Adherence % = completed / prescribed sessions across the range.
  // Legacy 0-10 self-ratings are mapped to % only when no count data exists.
  const adherencePct = useMemo(() => {
    let done = 0;
    let target = 0;
    chartEntries.forEach((e) => {
      if (e.sessions_done !== null && e.sessions_target !== null && e.sessions_target > 0) {
        done += e.sessions_done;
        target += e.sessions_target;
      }
    });
    if (target > 0) return Math.min(100, Math.round((done / target) * 100));
    const legacy = averageOf(chartEntries.map((e) => e.adherence));
    return legacy !== null ? Math.round(legacy * 10) : null;
  }, [chartEntries]);

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
          .select(ENTRY_COLUMNS)
          .eq("patient_user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setEntries((progressData as unknown as ProgressEntry[]) ?? []);
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
      pain_level: form.pain_level !== "" ? Number(form.pain_level) : null,
      function_score: form.function_score !== "" ? Number(form.function_score) : null,
      sessions_done: form.sessions_done !== "" ? Number(form.sessions_done) : null,
      sessions_target: form.sessions_done !== "" ? weeklyTarget : null,
      groc: form.groc !== "" ? Number(form.groc) : null,
      notes: form.notes.trim() || null,
    };
    setSaving(true);
    const { error, data } = await supabase
      .from("progress_entries")
      .insert(payload)
      .select(ENTRY_COLUMNS)
      .single();
    setSaving(false);
    if (error) {
      toast({ title: tr("Could not save entry", "Imeshindwa kuhifadhi"), description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => [data as unknown as ProgressEntry, ...prev]);
    setForm({ pain_level: "", function_score: "", sessions_done: "", groc: "", notes: "" });
    setDialogOpen(false);
    toast({ title: tr("Progress entry added", "Rekodi imeongezwa"), description: tr("Saved.", "Imehifadhiwa.") });
  };

  const earsTotal = useMemo(() => {
    if (earsAnswers.some((a) => a === null)) return null;
    return earsAnswers.reduce<number>(
      (sum, a, i) => sum + (EARS_ITEMS[i].positive ? 4 - (a as number) : (a as number)),
      0
    );
  }, [earsAnswers]);

  const handleSaveEars = async () => {
    if (!user || earsTotal === null) return;
    setEarsSaving(true);
    const { error, data } = await supabase
      .from("progress_entries")
      .insert({
        patient_user_id: user.id,
        ears_score: earsTotal,
        ears_answers: earsAnswers,
      })
      .select(ENTRY_COLUMNS)
      .single();
    setEarsSaving(false);
    if (error) {
      toast({ title: tr("Could not save questionnaire", "Imeshindwa kuhifadhi dodoso"), description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => [data as unknown as ProgressEntry, ...prev]);
    setEarsAnswers(Array(EARS_ITEMS.length).fill(null));
    setEarsOpen(false);
    toast({
      title: tr("Adherence questionnaire saved", "Dodoso la ufuataji limehifadhiwa"),
      description: tr(`Your EARS score is ${earsTotal}/24.`, `Alama yako ya EARS ni ${earsTotal}/24.`),
    });
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
    const previousId = latestRecommendation?.id ?? null;
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

      // Replace, don't accumulate: remove the superseded report so the
      // program list and platform stats stay honest. Best-effort - if the
      // delete policy isn't applied yet this quietly leaves the old row.
      if (previousId && recData?.id && recData.id !== previousId) {
        await supabase.from("recommendations").delete().eq("id", previousId);
      }

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
    const buckets = new Map<string, { pain: number[]; fn: number[] }>();
    chartEntries.forEach((e) => {
      const k = dayKey(new Date(e.created_at));
      const b = buckets.get(k) ?? { pain: [], fn: [] };
      if (e.pain_level !== null) b.pain.push(e.pain_level);
      if (e.function_score !== null) b.fn.push(e.function_score);
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
        [tr("Function", "Uwezo")]: b ? avg(b.fn) : null,
      });
    }
    return days;
  }, [chartEntries, language, chartRange]);

  // Weekly completion percentage per check-in (legacy 0-10 ratings mapped to %).
  const adherenceData = useMemo(
    () =>
      [...chartEntries]
        .reverse()
        .map((e) => {
          const pct =
            e.sessions_done !== null && e.sessions_target !== null && e.sessions_target > 0
              ? Math.min(100, Math.round((e.sessions_done / e.sessions_target) * 100))
              : e.adherence !== null
              ? e.adherence * 10
              : null;
          return pct === null
            ? null
            : {
                label: new Date(e.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB", { month: "short", day: "numeric" }),
                value: pct,
              };
        })
        .filter((d): d is { label: string; value: number } => d !== null),
    [chartEntries, language]
  );

  const programData = latestRecommendation?.program || {};

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
  const functionKey = tr("Function", "Uwezo");
  const grocLabelOf = (v: number | null) => {
    const opt = GROC_OPTIONS.find((o) => o.value === v);
    return opt ? tr(opt.en, opt.sw) : null;
  };

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
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{tr("Add Progress Entry", "Ongeza Rekodi ya Maendeleo")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{tr("Pain level (NPRS, 0-10)", "Kiwango cha maumivu (NPRS, 0-10)")}</Label>
                  <Input type="number" min="0" max="10" value={form.pain_level}
                    onChange={(e) => setForm((p) => ({ ...p, pain_level: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    {tr("0 = no pain, 10 = worst pain imaginable.", "0 = hakuna maumivu, 10 = maumivu makali kabisa unayoweza kufikiria.")}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>{tr("Main activity ability (0-10)", "Uwezo wa shughuli yako kuu (0-10)")}</Label>
                  <Input type="number" min="0" max="10" value={form.function_score}
                    onChange={(e) => setForm((p) => ({ ...p, function_score: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    {tr(
                      "How well can you perform the activity that matters most to you today? 0 = unable, 10 = fully able (as before your problem).",
                      "Unaweza kufanya vipi shughuli inayokuhusu zaidi leo? 0 = huwezi kabisa, 10 = kikamilifu (kama kabla ya tatizo lako)."
                    )}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>{tr("Exercise sessions completed this week", "Vikao vya mazoezi vilivyokamilika wiki hii")}</Label>
                  <Input type="number" min="0" max="21" value={form.sessions_done}
                    onChange={(e) => setForm((p) => ({ ...p, sessions_done: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    {weeklyTarget
                      ? tr(`Your program prescribes ${weeklyTarget} sessions per week.`, `Programu yako inapendekeza vikao ${weeklyTarget} kwa wiki.`)
                      : tr("Count of prescribed exercise sessions you finished.", "Idadi ya vikao vya mazoezi ulivyokamilisha.")}
                  </p>
                </div>
                {grocDue && (
                  <div className="grid gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3">
                    <Label>{tr("Compared to when you started, how are you now?", "Ukilinganisha na ulipoanza, hali yako ikoje sasa?")}</Label>
                    <select
                      value={form.groc}
                      onChange={(e) => setForm((p) => ({ ...p, groc: e.target.value }))}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">{tr("Select (optional)", "Chagua (hiari)")}</option>
                      {GROC_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.value > 0 ? `+${o.value}` : o.value}: {tr(o.en, o.sw)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {tr("Asked every 4 weeks (Global Rating of Change).", "Huulizwa kila wiki 4 (Tathmini ya Jumla ya Mabadiliko).")}
                    </p>
                  </div>
                )}
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
            {
              title: tr("Pain (NPRS)", "Maumivu (NPRS)"),
              icon: Flame,
              display: averagePain !== null ? `${averagePain}/10` : tr("No data", "Hakuna data"),
              hint: `${tr("Average,", "Wastani,")} ${rangeLabel}`,
            },
            {
              title: tr("Function (PSFS)", "Uwezo (PSFS)"),
              icon: HeartPulse,
              display: averageFunction !== null ? `${averageFunction}/10` : tr("No data", "Hakuna data"),
              hint: `${tr("Main-activity ability,", "Uwezo wa shughuli kuu,")} ${rangeLabel}`,
            },
            {
              title: tr("Adherence", "Ufuataji"),
              icon: Activity,
              display: adherencePct !== null ? `${adherencePct}%` : tr("No data", "Hakuna data"),
              hint: `${tr("Sessions completed vs prescribed,", "Vikao vilivyokamilika dhidi ya vilivyopangwa,")} ${rangeLabel}`,
            },
          ].map(({ title, icon: Icon, display, hint }) => (
            <Card key={title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{display}</div>
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
                  {tr("Pain and Function Trend", "Mwelekeo wa Maumivu na Uwezo")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {tr("Pain (lower is better) vs. main-activity function (higher is better) over your check-ins.", "Maumivu (chini ni bora) dhidi ya uwezo wa shughuli kuu (juu ni bora) kwa rekodi zako.")}
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
                    <linearGradient id="functionFill" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" name={functionKey} dataKey={functionKey} stroke={COLORS.energy} strokeWidth={2.5} fill="url(#functionFill)" connectNulls dot={{ fill: COLORS.energy, r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
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
              <p className="text-xs text-muted-foreground">{tr("Sessions completed as % of your prescribed weekly target.", "Vikao vilivyokamilika kama % ya lengo lako la wiki.")}</p>
            </CardHeader>
            <CardContent className="h-52">
              {adherenceData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="label" tick={{ fill: COLORS.axis, fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: COLORS.axis, fontSize: 11 }} width={30} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, tr("Adherence", "Ufuataji")]} />
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${goodHighColor(latestEntry.function_score ?? latestEntry.energy_level)}`}>
                      {latestEntry.function_score !== null ? tr("Function", "Uwezo") : tr("Energy", "Nguvu")}{" "}
                      {latestEntry.function_score ?? latestEntry.energy_level ?? "—"}
                    </span>
                    {latestEntry.sessions_done !== null ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pctColor(latestEntry.sessions_target ? Math.round((latestEntry.sessions_done / latestEntry.sessions_target) * 100) : null)}`}>
                        {tr("Sessions", "Vikao")} {latestEntry.sessions_done}{latestEntry.sessions_target ? `/${latestEntry.sessions_target}` : ""}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${goodHighColor(latestEntry.adherence)}`}>
                        {tr("Adherence", "Ufuataji")} {latestEntry.adherence ?? "—"}
                      </span>
                    )}
                    {latestEntry.groc !== null && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${grocColor(latestEntry.groc)}`}>
                        {tr("Change", "Mabadiliko")}: {grocLabelOf(latestEntry.groc)}
                      </span>
                    )}
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

        {/* EARS — Exercise Adherence Rating Scale (every 4 weeks) */}
        <Card className={`shadow-card ${earsDue ? "border-primary/30" : ""}`}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  {tr("Exercise Adherence Questionnaire (EARS)", "Dodoso la Ufuataji wa Mazoezi (EARS)")}
                  {earsDue && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {tr("Due", "Inastahili")}
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {tr(
                    "A validated 6-question check on how well your home exercise program fits your routine. Taken every 4 weeks.",
                    "Dodoso la maswali 6 lililothibitishwa kuhusu jinsi programu yako ya mazoezi ya nyumbani inavyoendana na ratiba yako. Hujazwa kila wiki 4."
                  )}
                </p>
              </div>
              <Button size="sm" onClick={() => setEarsOpen(true)} className="flex-shrink-0 bg-gradient-hero shadow-soft">
                {latestEars ? tr("Retake", "Jaza tena") : tr("Take questionnaire", "Jaza dodoso")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {latestEars ? (
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{latestEars.ears_score}/24</p>
                  <p className="text-xs text-muted-foreground">
                    {tr("Higher is better.", "Juu zaidi ni bora.")}{" "}
                    {new Date(latestEars.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB")}
                  </p>
                </div>
                <div className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round(((latestEars.ears_score ?? 0) / 24) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tr("Not taken yet. Your first score becomes the baseline your physiotherapist tracks.", "Bado halijajazwa. Alama yako ya kwanza itakuwa kigezo ambacho physiotherapist wako atafuatilia.")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* EARS dialog */}
        <Dialog open={earsOpen} onOpenChange={(o) => { setEarsOpen(o); if (!o) setEarsAnswers(Array(EARS_ITEMS.length).fill(null)); }}>
          <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tr("Exercise Adherence Rating Scale", "Kipimo cha Ufuataji wa Mazoezi (EARS)")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {tr("For each statement, choose how much you agree, thinking about the past week.", "Kwa kila kauli, chagua kiwango unachokubali, ukifikiria wiki iliyopita.")}
            </p>
            <div className="space-y-5">
              {EARS_ITEMS.map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{i + 1}. {tr(item.en, item.sw)}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {EARS_RESPONSES.map((resp, v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEarsAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))}
                        className={`rounded-lg border px-1 py-2 text-center text-[11px] font-medium leading-tight transition-colors ${
                          earsAnswers[i] === v
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {tr(resp.en, resp.sw)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                {earsTotal !== null
                  ? tr(`Score: ${earsTotal}/24`, `Alama: ${earsTotal}/24`)
                  : tr("Answer all 6 statements to save.", "Jibu kauli zote 6 ili kuhifadhi.")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEarsOpen(false)}>{tr("Cancel", "Ghairi")}</Button>
                <Button onClick={handleSaveEars} disabled={earsTotal === null || earsSaving} className="bg-gradient-hero shadow-soft">
                  {earsSaving ? tr("Saving...", "Inahifadhi...") : tr("Save", "Hifadhi")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Current program — compact strip; the full report lives on /programs */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            {latestRecommendation ? (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {tr("Current Program", "Programu ya Sasa")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-foreground">
                      {programData.title || tr("Personalized Exercise Program", "Programu Binafsi ya Mazoezi")}
                    </p>
                    {latestRecommendation.confidence != null && (
                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          latestRecommendation.source === "fallback"
                            ? "bg-warning/10 text-warning"
                            : "bg-primary/10 text-primary"
                        }`}
                        title={tr(
                          "How much the AI trusted this program, based on how much detail your assessment provided.",
                          "Ni kiasi gani AI iliamini programu hii, kulingana na undani wa tathmini yako."
                        )}
                      >
                        {latestRecommendation.source === "fallback"
                          ? tr("Basic plan", "Mpango wa msingi")
                          : tr(`AI confidence: ${Math.round(latestRecommendation.confidence * 100)}%`, `Uhakika wa AI: ${Math.round(latestRecommendation.confidence * 100)}%`)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{tr("Phase", "Awamu")}: <span className="font-medium text-foreground">{phaseLabel(programData.phase || programData?.schedule?.current_phase || "early")}</span></span>
                    <span>{tr("Weekly target", "Lengo la wiki")}: <span className="font-medium text-foreground">{weeklyTarget ? `${weeklyTarget} ${tr("sessions", "vikao")}` : tr("Not set", "Haijawekwa")}</span></span>
                    {latestRecommendation.created_at && (
                      <span>{tr("Report date", "Tarehe ya ripoti")}: <span className="font-medium text-foreground">{new Date(latestRecommendation.created_at).toLocaleDateString(language === "sw" ? "sw-KE" : "en-GB")}</span></span>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/programs">{tr("View full report", "Tazama ripoti kamili")}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={handleRegenerateReport}
                    disabled={regenerating}
                    title={tr("Rebuilds the report from your last assessment (e.g. after changing language).", "Huunda upya ripoti kutoka tathmini yako ya mwisho (mf. baada ya kubadili lugha).")}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? tr("Regenerating...", "Inazalisha upya...") : tr("Regenerate", "Zalisha upya")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {tr("Current Program", "Programu ya Sasa")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tr("No program yet — complete an assessment to get your personalized plan.", "Hakuna programu bado — kamilisha tathmini kupata mpango wako binafsi.")}
                  </p>
                </div>
                <Button asChild size="sm" className="flex-shrink-0 bg-gradient-hero shadow-soft">
                  <Link to="/assessment">{tr("Start Assessment", "Anza Tathmini")}</Link>
                </Button>
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
                        {entry.ears_score !== null ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${pctColor(Math.round((entry.ears_score / 24) * 100))}`}>
                            {tr("EARS questionnaire", "Dodoso la EARS")} {entry.ears_score}/24
                          </span>
                        ) : (
                          <>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${painColor(entry.pain_level)}`}>
                              {tr("Pain", "Maumivu")} {entry.pain_level ?? "—"}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${goodHighColor(entry.function_score ?? entry.energy_level)}`}>
                              {entry.function_score !== null ? tr("Function", "Uwezo") : tr("Energy", "Nguvu")}{" "}
                              {entry.function_score ?? entry.energy_level ?? "—"}
                            </span>
                            {entry.sessions_done !== null ? (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${pctColor(entry.sessions_target ? Math.round((entry.sessions_done / entry.sessions_target) * 100) : null)}`}>
                                {tr("Sessions", "Vikao")} {entry.sessions_done}{entry.sessions_target ? `/${entry.sessions_target}` : ""}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${goodHighColor(entry.adherence)}`}>
                                {tr("Adherence", "Ufuataji")} {entry.adherence ?? "—"}
                              </span>
                            )}
                            {entry.groc !== null && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${grocColor(entry.groc)}`}>
                                {tr("Change", "Mabadiliko")} {entry.groc > 0 ? `+${entry.groc}` : entry.groc}
                              </span>
                            )}
                          </>
                        )}
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
