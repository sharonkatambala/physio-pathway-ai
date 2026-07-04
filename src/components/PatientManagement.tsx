import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, User, MessageSquare, Calendar, Loader2, Activity, ScanLine, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

interface Patient {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  sex: string | null;
  occupation: string | null;
  phone: string | null;
  created_at: string;
}

interface ProgressEntry {
  id: string;
  created_at: string;
  pain_level: number | null;
  energy_level: number | null;
  adherence: number | null;
  notes: string | null;
}

type LastAssessment = { pain_level: number | null; created_at: string };
type LastPosture = { overall_score: number | null; posture_mode: string | null; created_at: string };
type LastProgress = { pain_level: number | null; energy_level: number | null; adherence: number | null; created_at: string };

const CHART_COLORS = {
  pain: "hsl(var(--warning))",
  energy: "hsl(var(--primary))",
  axis: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
};

const painColor = (v: number | null) =>
  v === null ? "bg-muted/60 text-muted-foreground"
    : v <= 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v <= 6 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const energyColor = (v: number | null) =>
  v === null ? "bg-muted/60 text-muted-foreground"
    : v >= 7 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 4 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const adherenceColor = (v: number | null) =>
  v === null ? "bg-muted/60 text-muted-foreground"
    : v >= 7 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : v >= 4 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

const avg = (vals: (number | null)[]) => {
  const nums = vals.filter((v): v is number => v !== null);
  if (!nums.length) return null;
  return Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10;
};

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<Record<string, LastAssessment>>({});
  const [posture, setPosture] = useState<Record<string, LastPosture>>({});
  const [latestProgress, setLatestProgress] = useState<Record<string, LastProgress>>({});
  const [loading, setLoading] = useState(true);

  // Progress sheet
  const [sheetPatient, setSheetPatient] = useState<Patient | null>(null);
  const [sheetEntries, setSheetEntries] = useState<ProgressEntry[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const navigate = useNavigate();

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    fontSize: 12,
  };

  const fetchPatients = useCallback(async () => {
    try {
      if (!user || !profile?.id) { setPatients([]); return; }

      const { data: assignments, error: assignError } = await supabase
        .from('physio_patient_assignments')
        .select('patient_id')
        .eq('physio_id', profile.id)
        .eq('status', 'active');
      if (assignError) throw assignError;

      const patientIds = (assignments || []).map((a) => a.patient_id);
      if (patientIds.length === 0) { setPatients([]); return; }

      const { data: patientProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, age, sex, occupation, phone, created_at')
        .in('id', patientIds);
      if (profileError) throw profileError;

      const list = (patientProfiles as Patient[]) || [];
      setPatients(list);

      const userIds = list.map((p) => p.user_id).filter(Boolean);
      if (!userIds.length) return;

      // Latest assessment per patient
      const { data: aData } = await supabase
        .from('assessments')
        .select('patient_user_id, pain_level, created_at')
        .in('patient_user_id', userIds)
        .order('created_at', { ascending: false });
      const aMap: Record<string, LastAssessment> = {};
      (aData ?? []).forEach((a: any) => {
        if (!aMap[a.patient_user_id]) aMap[a.patient_user_id] = { pain_level: a.pain_level, created_at: a.created_at };
      });
      setAssessments(aMap);

      // Latest posture session per patient
      const { data: pData } = await supabase
        .from('posture_sessions')
        .select('patient_user_id, overall_score, posture_mode, created_at')
        .in('patient_user_id', userIds)
        .order('created_at', { ascending: false });
      const pMap: Record<string, LastPosture> = {};
      (pData ?? []).forEach((p: any) => {
        if (!pMap[p.patient_user_id])
          pMap[p.patient_user_id] = { overall_score: p.overall_score, posture_mode: p.posture_mode, created_at: p.created_at };
      });
      setPosture(pMap);

      // Latest progress entry per patient
      const { data: pgData } = await supabase
        .from('progress_entries')
        .select('patient_user_id, pain_level, energy_level, adherence, created_at')
        .in('patient_user_id', userIds)
        .order('created_at', { ascending: false });
      const pgMap: Record<string, LastProgress> = {};
      (pgData ?? []).forEach((e: any) => {
        if (!pgMap[e.patient_user_id])
          pgMap[e.patient_user_id] = { pain_level: e.pain_level, energy_level: e.energy_level, adherence: e.adherence, created_at: e.created_at };
      });
      setLatestProgress(pgMap);

    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: tr("Couldn't load patients", "Imeshindwa kupakia wagonjwa"),
        description: tr("Please refresh and try again.", "Tafadhali onyesha upya na ujaribu tena."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.id, toast]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openProgressSheet = async (patient: Patient) => {
    setSheetPatient(patient);
    setSheetEntries([]);
    setSheetLoading(true);
    const { data } = await supabase
      .from('progress_entries')
      .select('id, created_at, pain_level, energy_level, adherence, notes')
      .eq('patient_user_id', patient.user_id)
      .order('created_at', { ascending: false })
      .limit(20);
    setSheetEntries(data ?? []);
    setSheetLoading(false);
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return p.first_name?.toLowerCase().includes(q) || p.last_name?.toLowerCase().includes(q) || p.occupation?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chart data for the sheet
  const sheetChartData = [...sheetEntries].reverse().slice(-10).map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-GB', { month: 'short', day: 'numeric' }),
    [tr('Pain', 'Maumivu')]: e.pain_level ?? null,
    [tr('Energy', 'Nguvu')]: e.energy_level ?? null,
  }));

  const sheetAvgPain = avg(sheetEntries.map((e) => e.pain_level));
  const sheetAvgEnergy = avg(sheetEntries.map((e) => e.energy_level));
  const sheetAvgAdherence = avg(sheetEntries.map((e) => e.adherence));

  const patientName = (p: Patient) =>
    `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || tr('Patient', 'Mgonjwa');

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {tr('Patient Management', 'Usimamizi wa Wagonjwa')}
            </CardTitle>
            <Badge className="bg-primary text-white">{filteredPatients.length} {tr('Patients', 'Wagonjwa')}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tr("Search patients...", "Tafuta wagonjwa...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => {
          const last = assessments[patient.user_id];
          const pg = latestProgress[patient.user_id];
          const meta = [
            patient.occupation,
            patient.age ? `${tr('Age', 'Umri')} ${patient.age}` : null,
            patient.sex,
          ].filter(Boolean).join(', ');
          return (
            <Card key={patient.id} className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-lg truncate">{patientName(patient)}</h4>
                      {meta && <p className="text-sm text-muted-foreground truncate">{meta}</p>}
                      {patient.phone && <p className="text-xs text-muted-foreground">{patient.phone}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => navigate('/messages?with=' + patient.id)}>
                      <MessageSquare className="h-4 w-4 mr-2" />{tr('Message', 'Ujumbe')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/physio-sessions')}>
                      <Calendar className="h-4 w-4 mr-2" />{tr('Sessions', 'Vikao')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openProgressSheet(patient)}>
                      <TrendingUp className="h-4 w-4 mr-2" />{tr('Progress', 'Maendeleo')}
                    </Button>
                  </div>
                </div>

                {/* Latest progress snapshot inline on card */}
                {pg && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${painColor(pg.pain_level)}`}>
                      {tr('Pain', 'Maumivu')} {pg.pain_level ?? '—'}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${energyColor(pg.energy_level)}`}>
                      {tr('Energy', 'Nguvu')} {pg.energy_level ?? '—'}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${adherenceColor(pg.adherence)}`}>
                      {tr('Adherence', 'Ufuataji')} {pg.adherence ?? '—'}
                    </span>
                    <span className="text-xs text-muted-foreground self-center">
                      {new Date(pg.created_at).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center text-sm flex-wrap gap-x-4 gap-y-2">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    {last
                      ? `${tr('Last assessment', 'Tathmini ya mwisho')}: ${tr('pain', 'maumivu')} ${last.pain_level ?? '-'}/10, ${new Date(last.created_at).toLocaleDateString()}`
                      : tr('No assessment submitted yet', 'Hakuna tathmini iliyowasilishwa bado')}
                  </span>
                  {(() => {
                    const p = posture[patient.user_id];
                    if (!p || p.overall_score === null) {
                      return (
                        <span className="text-muted-foreground inline-flex items-center gap-1.5">
                          <ScanLine className="h-4 w-4" />{tr('No posture check yet', 'Hakuna ukaguzi wa mkao bado')}
                        </span>
                      );
                    }
                    const score = Math.round(p.overall_score);
                    const color = score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-destructive';
                    return (
                      <span className="text-muted-foreground inline-flex items-center gap-1.5">
                        <ScanLine className="h-4 w-4" />
                        {tr('Posture', 'Mkao')}
                        <span className={`inline-flex h-5 min-w-[2rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white ${color}`}>
                          {score}
                        </span>
                        , {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    );
                  })()}
                  <span className="text-muted-foreground ml-auto">
                    {tr('Joined', 'Alijiunga')} {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{tr('No patients yet', 'Hakuna wagonjwa bado')}</h3>
            <p className="text-muted-foreground">
              {patients.length === 0
                ? tr('Patients appear here once they book a session with you.', 'Wagonjwa wataonekana hapa watakapoweka kikao nawe.')
                : tr('No patients match your search.', 'Hakuna mgonjwa anayelingana na utafutaji wako.')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Patient progress sheet */}
      <Sheet open={!!sheetPatient} onOpenChange={(open) => { if (!open) setSheetPatient(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {sheetPatient && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {patientName(sheetPatient)} — {tr('Progress', 'Maendeleo')}
                </SheetTitle>
              </SheetHeader>

              {sheetLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : sheetEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tr('No progress entries logged yet for this patient.', 'Mgonjwa huyu hajarekodiwa maendeleo bado.')}
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: tr('Avg Pain', 'Wastani Maumivu'), value: sheetAvgPain, colorFn: painColor },
                      { label: tr('Avg Energy', 'Wastani Nguvu'), value: sheetAvgEnergy, colorFn: energyColor },
                      { label: tr('Adherence', 'Ufuataji'), value: sheetAvgAdherence, colorFn: adherenceColor },
                    ].map(({ label, value, colorFn }) => (
                      <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-sm font-bold ${colorFn(value !== null ? Math.round(value) : null)}`}>
                          {value !== null ? `${value}/10` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Trend chart */}
                  {sheetChartData.length > 1 && (
                    <div className="h-52">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{tr('Pain vs Energy trend', 'Mwelekeo wa Maumivu na Nguvu')}</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sheetChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                          <XAxis dataKey="date" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} />
                          <YAxis domain={[0, 10]} tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} width={24} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" name={tr('Pain', 'Maumivu')} dataKey={tr('Pain', 'Maumivu')} stroke={CHART_COLORS.pain} strokeWidth={2} connectNulls dot={{ r: 3 }} />
                          <Line type="monotone" name={tr('Energy', 'Nguvu')} dataKey={tr('Energy', 'Nguvu')} stroke={CHART_COLORS.energy} strokeWidth={2} connectNulls dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Check-in history */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      {tr(`Check-in history (last ${sheetEntries.length})`, `Historia ya rekodi (${sheetEntries.length} za mwisho)`)}
                    </p>
                    <div className="space-y-0">
                      {sheetEntries.map((entry, idx) => (
                        <div key={entry.id} className={`py-3 ${idx < sheetEntries.length - 1 ? 'border-b border-border/60' : ''}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-shrink-0">
                              <p className="text-xs font-semibold text-foreground">
                                {new Date(entry.created_at).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${painColor(entry.pain_level)}`}>
                                {tr('P', 'M')} {entry.pain_level ?? '—'}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${energyColor(entry.energy_level)}`}>
                                {tr('E', 'N')} {entry.energy_level ?? '—'}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${adherenceColor(entry.adherence)}`}>
                                {tr('A', 'U')} {entry.adherence ?? '—'}
                              </span>
                            </div>
                          </div>
                          {entry.notes && (
                            <p className="mt-1.5 text-xs text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PatientManagement;
