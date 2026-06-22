import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Activity, Calendar, Flame, HeartPulse, Plus, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

// Theme-aware chart colors (resolve against the active light/dark palette).
const COLORS = {
  pain: "hsl(var(--warning))",
  energy: "hsl(var(--primary))",
  adherence: "hsl(var(--primary))",
  axis: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
};

const ProgressPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [latestRecommendation, setLatestRecommendation] = useState<RecommendationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    pain_level: "",
    energy_level: "",
    adherence: "",
    notes: "",
  });

  const latestEntry = entries[0];
  const hasData = entries.length > 0;

  const averageOf = (values: (number | null)[]) => {
    const nums = values.filter((value): value is number => value !== null);
    if (!nums.length) return null;
    return Math.round((nums.reduce((sum, value) => sum + value, 0) / nums.length) * 10) / 10;
  };

  const averagePain = useMemo(() => averageOf(entries.map((e) => e.pain_level)), [entries]);
  const averageEnergy = useMemo(() => averageOf(entries.map((e) => e.energy_level)), [entries]);
  const adherenceScore = useMemo(() => averageOf(entries.map((e) => e.adherence)), [entries]);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: recommendationData } = await supabase
          .from("recommendations")
          .select("id, created_at, program, source, confidence, assessments!inner(patient_user_id)")
          .eq("assessments.patient_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestRecommendation(recommendationData ?? null);

        const { data: progressData, error: progressError } = await supabase
          .from("progress_entries")
          .select("id, created_at, pain_level, energy_level, adherence, notes")
          .eq("patient_user_id", user.id)
          .order("created_at", { ascending: false });

        if (progressError) throw progressError;
        setEntries(progressData ?? []);
      } catch (error: any) {
        toast({
          title: "Unable to load progress",
          description: error?.message || "Please refresh the page and try again.",
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
      toast({
        title: "Could not save entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEntries((prev) => [data, ...prev]);
    setForm({ pain_level: "", energy_level: "", adherence: "", notes: "" });
    setDialogOpen(false);
    toast({
      title: "Progress entry added",
      description: "Your latest update has been saved.",
    });
  };

  const trendData = useMemo(
    () =>
      [...entries]
        .reverse()
        .slice(-8)
        .map((entry) => ({
          date: new Date(entry.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
          pain: entry.pain_level ?? null,
          energy: entry.energy_level ?? null,
        })),
    [entries]
  );

  const adherenceData = useMemo(
    () =>
      [...entries]
        .reverse()
        .slice(-7)
        .map((entry) => ({
          label: new Date(entry.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
          value: entry.adherence ?? 0,
        })),
    [entries]
  );

  const programData = latestRecommendation?.program || {};
  const reportData = programData.report || {};
  const reportFindings = Array.isArray(reportData.findings) ? reportData.findings : [];
  const reportRecommendations = Array.isArray(reportData.recommendations) ? reportData.recommendations : [];

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
  };

  const ChartEmptyState = ({ icon: Icon }: { icon: typeof LineChartIcon }) => (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">No data yet — add a check-in to see your trend.</p>
    </div>
  );

  const summaryCards = [
    { title: "Pain Trend", icon: Flame, value: averagePain, hint: "Average of recent entries" },
    { title: "Energy Level", icon: HeartPulse, value: averageEnergy, hint: "How energized you feel" },
    { title: "Plan Adherence", icon: Activity, value: adherenceScore, hint: "Consistency across sessions" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground">
            Track how you feel, review your plan, and see your improvements over time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map(({ title, icon: Icon, value, hint }) => (
            <Card key={title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {value !== null ? `${value}/10` : "No data"}
                </div>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-primary" />
                Pain and Energy Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">Pain (lower is better) vs. energy (higher is better) over your check-ins.</p>
            </CardHeader>
            <CardContent className="h-64">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="date" tick={{ fill: COLORS.axis, fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fill: COLORS.axis, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" name="Pain" dataKey="pain" stroke={COLORS.pain} strokeWidth={2} connectNulls dot={{ fill: COLORS.pain }} />
                    <Line type="monotone" name="Energy" dataKey="energy" stroke={COLORS.energy} strokeWidth={2} connectNulls dot={{ fill: COLORS.energy }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState icon={LineChartIcon} />
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="shadow-card">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Adherence
                </CardTitle>
                <p className="text-xs text-muted-foreground">How consistently you completed sessions.</p>
              </CardHeader>
              <CardContent className="h-48">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adherenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis dataKey="label" tick={{ fill: COLORS.axis, fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fill: COLORS.axis, fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill={COLORS.adherence} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmptyState icon={Activity} />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  Latest Check-In
                </CardTitle>
                <p className="text-xs text-muted-foreground">Your most recent progress entry.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {latestEntry ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pain level</span>
                      <Badge variant="secondary">{latestEntry.pain_level ?? "N/A"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Energy level</span>
                      <Badge variant="secondary">{latestEntry.energy_level ?? "N/A"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Adherence</span>
                      <Badge variant="secondary">{latestEntry.adherence ?? "N/A"}</Badge>
                    </div>
                    {latestEntry.notes && (
                      <div className="rounded-md border border-border bg-muted/40 p-3 text-foreground/80">
                        {latestEntry.notes}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No entries yet. Add your first update below.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">AI Program Connection</CardTitle>
            <p className="text-xs text-muted-foreground">
              Review the latest program data that powers your recovery plan.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRecommendation ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Program title</p>
                    <p className="text-base font-medium text-foreground">
                      {programData.title || "Personalized Exercise Program"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phase</p>
                    <p className="text-base font-medium text-foreground">
                      {programData.phase || programData?.schedule?.current_phase || "early"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Weekly target</p>
                    <p className="text-base font-medium text-foreground">
                      {programData.weekly_target ? `${programData.weekly_target} sessions` : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Report date</p>
                    <p className="text-base font-medium text-foreground">
                      {latestRecommendation.created_at
                        ? new Date(latestRecommendation.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {reportData.summary && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Summary</p>
                    <p className="mt-2 text-sm text-foreground/90">{reportData.summary}</p>
                  </div>
                )}

                {(reportFindings.length > 0 || reportRecommendations.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {reportFindings.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Key findings</p>
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {reportFindings.map((finding: string, idx: number) => (
                            <li key={`${finding}-${idx}`} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reportRecommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Recommendations</p>
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {reportRecommendations.map((rec: string, idx: number) => (
                            <li key={`${rec}-${idx}`} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>No report found for your account yet.</p>
                <p>Complete an assessment to generate a personalized report.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Progress Timeline</CardTitle>
              <p className="text-xs text-muted-foreground">
                Snapshot of how you are feeling over time.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-hero shadow-soft">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Progress Entry</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pain_level">Pain level (0-10)</Label>
                    <Input
                      id="pain_level"
                      type="number"
                      min="0"
                      max="10"
                      value={form.pain_level}
                      onChange={(event) => setForm((prev) => ({ ...prev, pain_level: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="energy_level">Energy level (0-10)</Label>
                    <Input
                      id="energy_level"
                      type="number"
                      min="0"
                      max="10"
                      value={form.energy_level}
                      onChange={(event) => setForm((prev) => ({ ...prev, energy_level: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adherence">Adherence (0-10)</Label>
                    <Input
                      id="adherence"
                      type="number"
                      min="0"
                      max="10"
                      value={form.adherence}
                      onChange={(event) => setForm((prev) => ({ ...prev, adherence: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEntry} disabled={saving} className="bg-gradient-hero shadow-soft">
                      {saving ? "Saving..." : "Save Entry"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading entries...</p>
            ) : entries.length ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Pain {entry.pain_level ?? "N/A"}</Badge>
                        <Badge variant="secondary">Energy {entry.energy_level ?? "N/A"}</Badge>
                        <Badge variant="secondary">Adherence {entry.adherence ?? "N/A"}</Badge>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="mt-3 text-sm text-foreground/80">{entry.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No progress entries yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
