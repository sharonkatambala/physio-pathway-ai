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
import { TrendingDown, TrendingUp, Activity, Calendar, Flame, HeartPulse, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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

const mockTrendData = [
  { date: "Week 1", pain: 6, energy: 4 },
  { date: "Week 2", pain: 5, energy: 5 },
  { date: "Week 3", pain: 4, energy: 6 },
  { date: "Week 4", pain: 3, energy: 7 },
];

const mockAdherenceData = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 1 },
  { label: "Thu", value: 1 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 1 },
  { label: "Sun", value: 1 },
];

const ProgressPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [latestRecommendation, setLatestRecommendation] = useState<RecommendationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    pain_level: "",
    energy_level: "",
    adherence: "",
    notes: "",
  });

  const latestEntry = entries[0];

  const averagePain = useMemo(() => {
    const values = entries.map((entry) => entry.pain_level).filter((value): value is number => value !== null);
    if (!values.length) return null;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }, [entries]);

  const averageEnergy = useMemo(() => {
    const values = entries.map((entry) => entry.energy_level).filter((value): value is number => value !== null);
    if (!values.length) return null;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }, [entries]);

  const adherenceScore = useMemo(() => {
    const values = entries.map((entry) => entry.adherence).filter((value): value is number => value !== null);
    if (!values.length) return null;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }, [entries]);

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

        const { data: progressData } = await supabase
          .from("progress_entries")
          .select("id, created_at, pain_level, energy_level, adherence, notes")
          .eq("patient_user_id", user.id)
          .order("created_at", { ascending: false });

        setEntries(progressData ?? []);
      } catch (error) {
        toast({
          title: "Unable to load progress",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, user, authLoading]);

  const handleCreateEntry = async () => {
    const payload = {
      pain_level: form.pain_level ? Number(form.pain_level) : null,
      energy_level: form.energy_level ? Number(form.energy_level) : null,
      adherence: form.adherence ? Number(form.adherence) : null,
      notes: form.notes.trim() || null,
    };

    const { error, data } = await supabase
      .from("progress_entries")
      .insert(payload)
      .select("id, created_at, pain_level, energy_level, adherence, notes")
      .single();

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

  const trendData = useMemo(() => {
    if (!entries.length) return mockTrendData;
    return [...entries]
      .reverse()
      .slice(-6)
      .map((entry, index) => ({
        date: `Entry ${index + 1}`,
        pain: entry.pain_level ?? 0,
        energy: entry.energy_level ?? 0,
      }));
  }, [entries]);

  const adherenceData = useMemo(() => {
    if (!entries.length) return mockAdherenceData;
    return entries
      .slice(0, 7)
      .reverse()
      .map((entry, index) => ({
        label: `Day ${index + 1}`,
        value: entry.adherence ?? 0,
      }));
  }, [entries]);

  const programData = latestRecommendation?.program || {};
  const reportData = programData.report || {};
  const reportFindings = Array.isArray(reportData.findings) ? reportData.findings : [];
  const reportRecommendations = Array.isArray(reportData.recommendations) ? reportData.recommendations : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Progress</h1>
          <p className="text-sm text-emerald-100/70">
            Track how you feel, review your plan, and see your improvements over time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-800/60 bg-emerald-950/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pain Trend</CardTitle>
              <Flame className="h-4 w-4 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {averagePain !== null ? `${averagePain}/10` : "No data"}
              </div>
              <p className="text-xs text-emerald-100/70">Average of recent entries</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-800/60 bg-emerald-950/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
              <HeartPulse className="h-4 w-4 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {averageEnergy !== null ? `${averageEnergy}/10` : "No data"}
              </div>
              <p className="text-xs text-emerald-100/70">How energized you feel</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-800/60 bg-emerald-950/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plan Adherence</CardTitle>
              <Activity className="h-4 w-4 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {adherenceScore !== null ? `${adherenceScore}/10` : "No data"}
              </div>
              <p className="text-xs text-emerald-100/70">Consistency across sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-emerald-800/60 bg-emerald-950/60">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-emerald-200" />
                Pain and Energy Trend
              </CardTitle>
              <p className="text-xs text-emerald-100/70">Your weekly trend over the last entries.</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: "#d1fae5", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#d1fae5", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#052e16",
                      borderColor: "#064e3b",
                      color: "#d1fae5",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pain"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ fill: "#34d399", stroke: "#052e16" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#a7f3d0"
                    strokeWidth={2}
                    dot={{ fill: "#a7f3d0", stroke: "#052e16" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-emerald-800/60 bg-emerald-950/60">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-emerald-200" />
                  Weekly Adherence
                </CardTitle>
                <p className="text-xs text-emerald-100/70">How often you completed sessions.</p>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "#d1fae5", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#d1fae5", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#052e16",
                        borderColor: "#064e3b",
                        color: "#d1fae5",
                      }}
                    />
                    <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-emerald-800/60 bg-emerald-950/60">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-emerald-200" />
                  Latest Check-In
                </CardTitle>
                <p className="text-xs text-emerald-100/70">Your most recent progress entry.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {latestEntry ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Pain level</span>
                      <Badge variant="secondary">{latestEntry.pain_level ?? "N/A"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Energy level</span>
                      <Badge variant="secondary">{latestEntry.energy_level ?? "N/A"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Adherence</span>
                      <Badge variant="secondary">{latestEntry.adherence ?? "N/A"}</Badge>
                    </div>
                    {latestEntry.notes && (
                      <div className="rounded-md border border-emerald-900/60 bg-emerald-950/70 p-3 text-emerald-100/70">
                        {latestEntry.notes}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-emerald-100/70">No entries yet. Add your first update below.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-emerald-800/60 bg-emerald-950/60">
          <CardHeader>
            <CardTitle className="text-base">AI Program Connection</CardTitle>
            <p className="text-xs text-emerald-100/70">
              Review the latest program data that powers your recovery plan.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRecommendation ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-100/70">Program title</p>
                    <p className="text-base font-medium">
                      {programData.title || "Personalized Exercise Program"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-100/70">Phase</p>
                    <p className="text-base font-medium">
                      {programData.phase || programData?.schedule?.current_phase || "early"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-100/70">Weekly target</p>
                    <p className="text-base font-medium">
                      {programData.weekly_target ? `${programData.weekly_target} sessions` : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-100/70">Report date</p>
                    <p className="text-base font-medium">
                      {latestRecommendation.created_at
                        ? new Date(latestRecommendation.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {reportData.summary && (
                  <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/60 p-4">
                    <p className="text-sm text-emerald-100/70">Summary</p>
                    <p className="mt-2 text-sm text-emerald-50/90">{reportData.summary}</p>
                  </div>
                )}

                {(reportFindings.length > 0 || reportRecommendations.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {reportFindings.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-100/70">Key findings</p>
                        <ul className="space-y-2 text-sm text-emerald-50/90">
                          {reportFindings.map((finding: string, idx: number) => (
                            <li key={`${finding}-${idx}`} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reportRecommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-100/70">Recommendations</p>
                        <ul className="space-y-2 text-sm text-emerald-50/90">
                          {reportRecommendations.map((rec: string, idx: number) => (
                            <li key={`${rec}-${idx}`} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
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
              <div className="space-y-2 text-sm text-emerald-100/70">
                <p>No report found for your account yet.</p>
                <p>Complete an assessment to generate a personalized report.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-800/60 bg-emerald-950/60">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Progress Timeline</CardTitle>
              <p className="text-xs text-emerald-100/70">
                Snapshot of how you are feeling over time.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-400 text-emerald-950 hover:bg-emerald-300">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg border-emerald-800 bg-emerald-950 text-emerald-50">
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
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-emerald-800 text-emerald-100 hover:bg-emerald-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateEntry}
                      className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                    >
                      Save Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-emerald-100/70">Loading entries...</p>
            ) : entries.length ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border border-emerald-900/70 bg-emerald-950/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-emerald-100/70">
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
                      <p className="mt-3 text-sm text-emerald-100/80">{entry.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-100/70">No progress entries yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
