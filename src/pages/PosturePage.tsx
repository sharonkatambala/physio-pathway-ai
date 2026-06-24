import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePoseLandmarker } from '@/hooks/usePoseLandmarker';
import { drawPose } from '@/lib/drawPose';
import { fetchCoaching, localCoaching } from '@/lib/postureCoaching';
import {
  analyzePosture,
  averageMetrics,
  computeMetrics,
  isPersonVisible,
  summarize,
  zoneColor,
  zoneLabel,
  type Landmark,
  type PostureMetrics,
  type PostureMode,
  type PostureResult,
} from '@/lib/ergonomics';
import {
  Activity,
  AlertTriangle,
  Armchair,
  Camera,
  CameraOff,
  CheckCircle2,
  History,
  Loader2,
  PersonStanding,
  Play,
  ShieldCheck,
  Sparkles,
  Square,
  Video,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const ASSESS_SECONDS = 10;
const SAMPLE_EVERY_MS = 200;
const NUDGE_AFTER_MS = 8000; // sustained poor posture before a nudge
const NUDGE_COOLDOWN_MS = 30000;

type PostureSession = {
  id: string;
  created_at: string;
  mode: string | null;
  posture_mode: string | null;
  duration_seconds: number | null;
  overall_score: number | null;
  pct_good_posture: number | null;
};

const ScoreRing = ({ score, color, size = 140 }: { score: number; color: string; size?: number }) => {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, unit = '°', max = 60 }: { label: string; value: number | null; unit?: string; max?: number }) => {
  if (value === null) return null;
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{Math.round(value)}{unit}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const PosturePage = () => {
  const { user, role, loading } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'sw' ? 'sw' : 'en';
  const tr = (en: string, sw: string) => (lang === 'sw' ? sw : en);
  const { status: modelStatus, error: modelError, detect } = usePoseLandmarker();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const lastSampleRef = useRef(0);

  const [tab, setTab] = useState<'live' | 'assessment' | 'history'>('assessment');
  const [postureMode, setPostureMode] = useState<PostureMode>('seated');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<PostureResult | null>(null);
  const [personVisible, setPersonVisible] = useState(false);

  // Assessment state
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'capturing' | 'done'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [finalResult, setFinalResult] = useState<PostureResult | null>(null);
  const [coaching, setCoaching] = useState<string | null>(null);

  // Live state
  const [liveRunning, setLiveRunning] = useState(false);
  const [pctGood, setPctGood] = useState<number | null>(null);

  // History
  const [sessions, setSessions] = useState<PostureSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Refs mirrored from state for use inside the animation loop.
  const postureModeRef = useRef(postureMode);
  const phaseRef = useRef(phase);
  const liveRunningRef = useRef(liveRunning);
  const captureSamplesRef = useRef<PostureMetrics[]>([]);
  const liveSamplesRef = useRef<PostureMetrics[]>([]);
  const liveCountersRef = useRef({ good: 0, total: 0 });
  const liveStartRef = useRef(0);
  const captureStartRef = useRef(0);
  const poorSinceRef = useRef<number | null>(null);
  const lastNudgeRef = useRef(0);

  useEffect(() => { postureModeRef.current = postureMode; }, [postureMode]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { liveRunningRef.current = liveRunning; }, [liveRunning]);

  const saveSession = useCallback(
    async (
      res: PostureResult,
      mode: 'assessment' | 'live',
      durationSeconds: number,
      pct: number | null
    ) => {
      if (!user) return;
      const { error } = await supabase.from('posture_sessions').insert({
        patient_user_id: user.id,
        mode,
        posture_mode: postureModeRef.current,
        duration_seconds: Math.round(durationSeconds),
        overall_score: res.score,
        pct_good_posture: pct,
        avg_neck_flexion: Math.round(res.metrics.neckFlexion),
        avg_trunk_flexion: Math.round(res.metrics.trunkFlexion),
        avg_shoulder_tilt: res.metrics.shoulderTilt !== null ? Math.round(res.metrics.shoulderTilt) : null,
        metrics: { ...res.metrics, zone: res.zone, issues: res.issues.map((i) => i.key) },
      });
      if (error) {
        toast.error(tr('Could not save session', 'Imeshindwa kuhifadhi kipindi'), { description: error.message });
      } else {
        toast.success(tr('Session saved', 'Kipindi kimehifadhiwa'));
      }
    },
    [user, lang]
  );

  // ── Animation loop ────────────────────────────────────────────────
  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 2 && modelStatus === 'ready') {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ts = Math.max(performance.now(), lastTsRef.current + 1);
      lastTsRef.current = ts;
      const detection = detect(video, ts);
      const ctx = canvas.getContext('2d');
      const landmarks = detection?.landmarks?.[0] as Landmark[] | undefined;

      if (landmarks && isPersonVisible(landmarks)) {
        setPersonVisible(true);
        const mode = postureModeRef.current;
        const res = analyzePosture(landmarks, mode);
        setResult(res);
        if (ctx) drawPose(ctx, landmarks, canvas.width, canvas.height, zoneColor(res.zone));

        const now = performance.now();
        const metrics = res.metrics;

        // Assessment capture
        if (phaseRef.current === 'capturing') {
          if (now - lastSampleRef.current >= SAMPLE_EVERY_MS) {
            lastSampleRef.current = now;
            captureSamplesRef.current.push(metrics);
          }
          setCaptureProgress(Math.min(100, ((now - captureStartRef.current) / (ASSESS_SECONDS * 1000)) * 100));
          if (now - captureStartRef.current >= ASSESS_SECONDS * 1000) {
            finalizeAssessment();
          }
        }

        // Live coaching
        if (liveRunningRef.current) {
          if (now - lastSampleRef.current >= SAMPLE_EVERY_MS) {
            lastSampleRef.current = now;
            liveSamplesRef.current.push(metrics);
            liveCountersRef.current.total += 1;
            if (res.zone === 'good') liveCountersRef.current.good += 1;
          }
          // Sustained-poor nudge (debounced)
          if (res.zone === 'poor') {
            if (poorSinceRef.current === null) poorSinceRef.current = now;
            else if (now - poorSinceRef.current >= NUDGE_AFTER_MS && now - lastNudgeRef.current >= NUDGE_COOLDOWN_MS) {
              lastNudgeRef.current = now;
              poorSinceRef.current = now;
              toast.warning(tr('Check your posture', 'Angalia mkao wako'), { description: summarize(res, lang) });
            }
          } else {
            poorSinceRef.current = null;
          }
        }
      } else {
        setPersonVisible(false);
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detect, modelStatus, lang]);

  // Start/stop the camera ------------------------------------------------
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setResult(null);
    setLiveRunning(false);
    setPhase('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setCameraError(e?.message || tr('Camera access was denied.', 'Ufikiaji wa kamera ulikataliwa.'));
    }
  }, [loop, lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Assessment flow ───────────────────────────────────────────────
  const finalizeAssessment = useCallback(() => {
    const res = averageMetrics(captureSamplesRef.current, postureModeRef.current);
    setPhase('done');
    setCaptureProgress(100);
    if (res) {
      setFinalResult(res);
      setCoaching(localCoaching(res, postureModeRef.current, lang));
      fetchCoaching(res, postureModeRef.current, lang).then(setCoaching);
      saveSession(res, 'assessment', ASSESS_SECONDS, null);
    } else {
      toast.error(tr('No posture detected', 'Hakuna mkao uliogunduliwa'), {
        description: tr('Make sure your upper body is in frame and try again.', 'Hakikisha mwili wako wa juu unaonekana kisha jaribu tena.'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSession, lang]);

  const startAssessment = useCallback(() => {
    if (!cameraOn) return;
    setFinalResult(null);
    setCoaching(null);
    captureSamplesRef.current = [];
    setCaptureProgress(0);
    setPhase('countdown');
    setCountdown(3);
    let n = 3;
    const tick = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(tick);
        captureStartRef.current = performance.now();
        lastSampleRef.current = 0;
        setPhase('capturing');
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [cameraOn]);

  // ── Live flow ─────────────────────────────────────────────────────
  const startLive = useCallback(() => {
    if (!cameraOn) return;
    liveSamplesRef.current = [];
    liveCountersRef.current = { good: 0, total: 0 };
    liveStartRef.current = performance.now();
    poorSinceRef.current = null;
    lastNudgeRef.current = 0;
    lastSampleRef.current = 0;
    setPctGood(100);
    setLiveRunning(true);
  }, [cameraOn]);

  const stopLive = useCallback(() => {
    setLiveRunning(false);
    const { good, total } = liveCountersRef.current;
    const pct = total > 0 ? Math.round((good / total) * 100) : null;
    const duration = (performance.now() - liveStartRef.current) / 1000;
    const res = averageMetrics(liveSamplesRef.current, postureModeRef.current);
    if (res && total > 5) {
      saveSession(res, 'live', duration, pct);
    }
  }, [saveSession]);

  // Update live % good roughly once per second while running.
  useEffect(() => {
    if (!liveRunning) return;
    const id = setInterval(() => {
      const { good, total } = liveCountersRef.current;
      setPctGood(total > 0 ? Math.round((good / total) * 100) : 100);
    }, 1000);
    return () => clearInterval(id);
  }, [liveRunning]);

  // Switching away from camera tabs stops the camera; entering History loads data.
  useEffect(() => {
    if (tab === 'history') {
      if (cameraOn) stopCamera();
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('posture_sessions')
      .select('id, created_at, mode, posture_mode, duration_seconds, overall_score, pct_good_posture')
      .eq('patient_user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast.error(tr('Could not load history', 'Imeshindwa kupakia historia'), { description: error.message });
    }
    setSessions((data as PostureSession[]) ?? []);
    setHistoryLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, lang]);

  const trendData = useMemo(
    () =>
      [...sessions]
        .reverse()
        .slice(-12)
        .map((s) => ({
          date: new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          score: s.overall_score ?? 0,
        })),
    [sessions]
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const liveColor = result ? zoneColor(result.zone) : 'hsl(var(--muted-foreground))';

  // Camera viewport (shared by Live + Assessment)
  const cameraPanel = (
    <Card className="shadow-card overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-muted">
          {/* Mirror video + overlay for a natural selfie view */}
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]" />

          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80 p-6 text-center">
              <Camera className="h-10 w-10 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">
                {tr(
                  'Sit side-on to the camera so your ear, shoulder and hip are visible. Video stays on your device.',
                  'Kaa ubavu kuelekea kamera ili sikio, bega na nyonga vionekane. Video inabaki kwenye kifaa chako.'
                )}
              </p>
              {modelStatus === 'loading' && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> {tr('Loading posture model...', 'Inapakia modeli ya mkao...')}
                </span>
              )}
              {modelStatus === 'error' && (
                <p className="text-sm text-destructive">{modelError}</p>
              )}
              <Button onClick={startCamera} disabled={modelStatus !== 'ready'} className="bg-gradient-hero shadow-soft">
                <Camera className="mr-2 h-4 w-4" />
                {tr('Enable camera', 'Washa kamera')}
              </Button>
              {cameraError && <p className="text-sm text-destructive">{cameraError}</p>}
            </div>
          )}

          {/* Countdown overlay */}
          {cameraOn && phase === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <span className="text-7xl font-bold text-primary drop-shadow">{countdown}</span>
            </div>
          )}

          {/* Live score chip */}
          {cameraOn && result && (phase === 'capturing' || liveRunning) && (
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 shadow-soft backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: liveColor }} />
              <span className="text-sm font-semibold text-foreground">{result.score}</span>
              <span className="text-xs text-muted-foreground">{zoneLabel(result.zone, lang)}</span>
            </div>
          )}

          {cameraOn && !personVisible && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1.5 text-xs text-muted-foreground shadow-soft backdrop-blur">
              {tr('Step into frame - upper body not detected', 'Ingia kwenye fremu - mwili wa juu haujagunduliwa')}
            </div>
          )}
        </div>

        {cameraOn && (
          <div className="flex items-center justify-between gap-2 border-t border-border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              {tr('On-device, video not uploaded', 'Kwenye kifaa, video haijapakiwa')}
            </div>
            <Button variant="ghost" size="sm" onClick={stopCamera}>
              <CameraOff className="mr-2 h-4 w-4" />
              {tr('Stop camera', 'Zima kamera')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const modeToggle = (
    <div className="inline-flex rounded-lg border border-border p-1">
      <button
        onClick={() => setPostureMode('seated')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${postureMode === 'seated' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Armchair className="h-4 w-4" /> {tr('Seated', 'Kukaa')}
      </button>
      <button
        onClick={() => setPostureMode('standing')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${postureMode === 'standing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <PersonStanding className="h-4 w-4" /> {tr('Standing', 'Kusimama')}
      </button>
    </div>
  );

  const ResultDetail = ({ res }: { res: PostureResult }) => (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <ScoreRing score={res.score} color={zoneColor(res.zone)} />
        <div className="flex-1 space-y-2">
          <Badge style={{ background: zoneColor(res.zone), color: 'white' }}>{zoneLabel(res.zone, lang)}</Badge>
          <p className="text-sm text-foreground/90">{summarize(res, lang)}</p>
        </div>
      </div>
      {coaching && (
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {tr('Coaching', 'Mwongozo')}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">{coaching}</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricBar label={tr('Neck / forward-head', 'Shingo / kichwa mbele')} value={res.metrics.neckFlexion} max={60} />
        <MetricBar label={tr('Trunk lean', 'Mwelekeo wa kiwiliwili')} value={res.metrics.trunkFlexion} max={60} />
        <MetricBar label={tr('Shoulder tilt', 'Mwinamo wa mabega')} value={res.metrics.shoulderTilt} max={30} />
        {postureMode === 'standing' && (
          <MetricBar label={tr('Knee bend', 'Mpinda wa goti')} value={res.metrics.kneeFlexion} max={90} />
        )}
      </div>
      {res.issues.length > 0 && (
        <div className="space-y-2">
          {res.issues.map((issue) => (
            <div key={issue.key} className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <span className="text-sm text-foreground/90">{lang === 'sw' ? issue.sw : issue.en}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tr('Posture Check', 'Ukaguzi wa Mkao')}</h1>
              <p className="text-sm text-muted-foreground">
                {tr('AI ergonomic assessment - runs privately on your device.', 'Tathmini ya ergonomiki ya AI - inafanya kazi kwa faragha kwenye kifaa chako.')}
              </p>
            </div>
          </div>
          {modeToggle}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessment">{tr('Assessment', 'Tathmini')}</TabsTrigger>
            <TabsTrigger value="live">{tr('Live coaching', 'Mwongozo wa moja kwa moja')}</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-1.5 h-4 w-4" />{tr('History', 'Historia')}</TabsTrigger>
          </TabsList>

          {/* ── Assessment ── */}
          <TabsContent value="assessment" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {cameraPanel}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">{tr('Guided assessment', 'Tathmini elekezi')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tr(
                      `Hold a natural ${postureMode} posture for ${ASSESS_SECONDS} seconds. We average your angles and score them.`,
                      `Shikilia mkao wa kawaida wa ${postureMode === 'seated' ? 'kukaa' : 'kusimama'} kwa sekunde ${ASSESS_SECONDS}. Tutachukua wastani wa pembe zako na kuzitathmini.`
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phase === 'capturing' && (
                    <div>
                      <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                        <span>{tr('Capturing...', 'Inanasa...')}</span>
                        <span>{Math.round(captureProgress)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${captureProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {phase === 'done' && finalResult ? (
                    <>
                      <ResultDetail res={finalResult} />
                      <Button onClick={startAssessment} disabled={!cameraOn} variant="outline" className="w-full">
                        {tr('Run again', 'Pima tena')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={startAssessment}
                      disabled={!cameraOn || phase === 'countdown' || phase === 'capturing'}
                      className="w-full bg-gradient-hero shadow-soft"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {phase === 'idle'
                        ? tr('Start assessment', 'Anza tathmini')
                        : tr('In progress...', 'Inaendelea...')}
                    </Button>
                  )}
                  {!cameraOn && (
                    <p className="text-center text-xs text-muted-foreground">
                      {tr('Enable the camera to begin.', 'Washa kamera ili kuanza.')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Live ── */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {cameraPanel}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">{tr('Live coaching', 'Mwongozo wa moja kwa moja')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tr('We watch your posture and nudge you when you slouch.', 'Tunafuatilia mkao wako na kukukumbusha unapoinama.')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={result?.score ?? 0} color={liveColor} size={120} />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{tr('Time in good posture', 'Muda wa mkao mzuri')}</p>
                      <p className="text-3xl font-bold text-foreground">{pctGood !== null ? `${pctGood}%` : '-'}</p>
                      {result && <Badge style={{ background: liveColor, color: 'white' }}>{zoneLabel(result.zone, lang)}</Badge>}
                    </div>
                  </div>

                  {result && result.issues[0] && liveRunning && (
                    <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3">
                      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-foreground/90">{summarize(result, lang)}</span>
                    </div>
                  )}

                  {liveRunning ? (
                    <Button onClick={stopLive} variant="destructive" className="w-full">
                      <Square className="mr-2 h-4 w-4" />
                      {tr('Stop & save session', 'Simamisha na hifadhi kipindi')}
                    </Button>
                  ) : (
                    <Button onClick={startLive} disabled={!cameraOn} className="w-full bg-gradient-hero shadow-soft">
                      <Play className="mr-2 h-4 w-4" />
                      {tr('Start live coaching', 'Anza mwongozo')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── History ── */}
          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">{tr('Posture score over time', 'Alama ya mkao kwa muda')}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground">{tr('Loading...', 'Inapakia...')}</p>
                ) : trendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--foreground))' }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <Activity className="h-8 w-8 opacity-40" />
                    <p className="text-sm">{tr('No sessions yet - run an assessment to start tracking.', 'Hakuna vipindi bado - fanya tathmini ili kuanza kufuatilia.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {sessions.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">{tr('Recent sessions', 'Vipindi vya hivi karibuni')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sessions.slice(0, 15).map((s) => {
                    const zone = (s.overall_score ?? 0) >= 80 ? 'good' : (s.overall_score ?? 0) >= 60 ? 'fair' : 'poor';
                    return (
                      <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{new Date(s.created_at).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.mode === 'live' ? tr('Live coaching', 'Mwongozo') : tr('Assessment', 'Tathmini')},{' '}
                            {s.posture_mode === 'standing' ? tr('Standing', 'Kusimama') : tr('Seated', 'Kukaa')}
                            {s.pct_good_posture !== null ? `, ${s.pct_good_posture}% ${tr('good', 'nzuri')}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {zone === 'good' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                          <Badge style={{ background: zoneColor(zone), color: 'white' }}>{s.overall_score ?? '-'}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PosturePage;
