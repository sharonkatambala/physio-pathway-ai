/**
 * Ergonomics scoring engine - pure functions, no React/DOM.
 *
 * Turns MediaPipe BlazePose 33-landmark output into joint angles and a
 * RULA/REBA-inspired posture score (0-100, higher = better). This is a
 * screening/coaching heuristic, NOT a certified clinical measurement -
 * single-camera 2D pose has well-documented accuracy limits, so we keep
 * thresholds conservative and surface zones (good/fair/poor) rather than
 * claiming precise degrees.
 */

// MediaPipe BlazePose 33-landmark indices (the ones we use).
export const LM = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type PostureMode = 'seated' | 'standing';
export type Zone = 'good' | 'fair' | 'poor';

export interface PostureMetrics {
  neckFlexion: number; // degrees of head/neck tilt from vertical (forward-head)
  trunkFlexion: number; // degrees of torso lean from vertical
  headTilt: number | null; // lateral head tilt: ear-line vs shoulder-line (front view only)
  shoulderTilt: number | null; // left-right shoulder imbalance (front view only)
  kneeFlexion: number | null; // standing only: bend at the knee (0 = straight)
  side: 'left' | 'right';
}

export interface PostureIssue {
  key: 'neck' | 'head' | 'trunk' | 'shoulder' | 'knee';
  severity: number; // 0..1
  en: string;
  sw: string;
}

export interface PostureResult {
  score: number; // 0-100
  zone: Zone;
  metrics: PostureMetrics;
  issues: PostureIssue[]; // ranked worst-first
}

const toDeg = (rad: number) => (rad * 180) / Math.PI;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Signed angle of the line a→b from horizontal, folded into [-90, 90] degrees
 * so the result is independent of point ordering (0 = level line).
 */
function lineAngleFromHorizontal(a: Landmark, b: Landmark): number {
  let ang = toDeg(Math.atan2(b.y - a.y, b.x - a.x));
  if (ang > 90) ang -= 180;
  if (ang < -90) ang += 180;
  return ang;
}

/** Deviation of the segment lower→upper from the vertical axis, in degrees [0,90]. */
function tiltFromVertical(lower: Landmark, upper: Landmark): number {
  const dx = upper.x - lower.x;
  const dy = upper.y - lower.y; // image coords: y grows downward
  return toDeg(Math.atan2(Math.abs(dx), Math.abs(dy) || 1e-6));
}

/** Interior angle at point b formed by a-b-c, in degrees [0,180]. */
function jointAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.hypot(v1x, v1y);
  const m2 = Math.hypot(v2x, v2y);
  if (m1 === 0 || m2 === 0) return 180;
  return toDeg(Math.acos(clamp(dot / (m1 * m2), -1, 1)));
}

const vis = (lm: Landmark | undefined) => lm?.visibility ?? 0;

/** Is a usable body actually in frame? Needs a shoulder and a hip visible. */
export function isPersonVisible(landmarks: Landmark[] | undefined): boolean {
  if (!landmarks || landmarks.length < 33) return false;
  const shoulder = Math.max(vis(landmarks[LM.LEFT_SHOULDER]), vis(landmarks[LM.RIGHT_SHOULDER]));
  const hip = Math.max(vis(landmarks[LM.LEFT_HIP]), vis(landmarks[LM.RIGHT_HIP]));
  return shoulder > 0.5 && hip > 0.4;
}

/** Choose the body side facing the camera most clearly (best for side-on capture). */
function pickSide(lm: Landmark[]): 'left' | 'right' {
  const left = vis(lm[LM.LEFT_EAR]) + vis(lm[LM.LEFT_SHOULDER]) + vis(lm[LM.LEFT_HIP]);
  const right = vis(lm[LM.RIGHT_EAR]) + vis(lm[LM.RIGHT_SHOULDER]) + vis(lm[LM.RIGHT_HIP]);
  return right > left ? 'right' : 'left';
}

export function computeMetrics(landmarks: Landmark[], mode: PostureMode): PostureMetrics {
  const side = pickSide(landmarks);
  const ear = landmarks[side === 'left' ? LM.LEFT_EAR : LM.RIGHT_EAR];
  const shoulder = landmarks[side === 'left' ? LM.LEFT_SHOULDER : LM.RIGHT_SHOULDER];
  const hip = landmarks[side === 'left' ? LM.LEFT_HIP : LM.RIGHT_HIP];
  const knee = landmarks[side === 'left' ? LM.LEFT_KNEE : LM.RIGHT_KNEE];
  const ankle = landmarks[side === 'left' ? LM.LEFT_ANKLE : LM.RIGHT_ANKLE];

  const neckFlexion = tiltFromVertical(shoulder, ear);
  const trunkFlexion = tiltFromVertical(hip, shoulder);

  // Shoulder tilt only meaningful when both shoulders are clearly visible (front-ish view).
  let shoulderTilt: number | null = null;
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  if (vis(ls) > 0.6 && vis(rs) > 0.6) {
    shoulderTilt = toDeg(Math.atan2(Math.abs(ls.y - rs.y), Math.abs(ls.x - rs.x) || 1e-6));
  }

  // Lateral head tilt (ear toward shoulder) - front view only, when both ears
  // are visible. Measured relative to the shoulder line so a slightly tilted
  // camera or leaning torso does not flag a level head.
  let headTilt: number | null = null;
  const le = landmarks[LM.LEFT_EAR];
  const re = landmarks[LM.RIGHT_EAR];
  if (vis(le) > 0.5 && vis(re) > 0.5 && vis(ls) > 0.6 && vis(rs) > 0.6) {
    const earLine = lineAngleFromHorizontal(le, re);
    const shoulderLine = lineAngleFromHorizontal(ls, rs);
    let diff = Math.abs(earLine - shoulderLine);
    if (diff > 90) diff = 180 - diff;
    headTilt = diff;
  }

  // Knee bend only for standing/manual mode and when the leg is visible.
  let kneeFlexion: number | null = null;
  if (mode === 'standing' && vis(knee) > 0.4 && vis(ankle) > 0.4) {
    kneeFlexion = Math.max(0, 180 - jointAngle(hip, knee, ankle));
  }

  return { neckFlexion, trunkFlexion, headTilt, shoulderTilt, kneeFlexion, side };
}

/** Conservative neutral allowances and concern thresholds (degrees). */
const THRESH = {
  seated: { neck: { ok: 12, bad: 35 }, head: { ok: 8, bad: 25 }, trunk: { ok: 10, bad: 30 }, shoulder: { ok: 5, bad: 18 } },
  standing: { neck: { ok: 12, bad: 35 }, head: { ok: 8, bad: 25 }, trunk: { ok: 10, bad: 45 }, shoulder: { ok: 6, bad: 20 }, knee: { ok: 12, bad: 45 } },
};

/** 0..1 severity for how far `value` is past its `ok` threshold toward `bad`. */
const severityOf = (value: number, ok: number, bad: number) => clamp((value - ok) / (bad - ok), 0, 1);

export function scorePosture(metrics: PostureMetrics, mode: PostureMode): PostureResult {
  const t = THRESH[mode];
  const issues: PostureIssue[] = [];

  const neckSev = severityOf(metrics.neckFlexion, t.neck.ok, t.neck.bad);
  if (neckSev > 0.05) {
    issues.push({
      key: 'neck',
      severity: neckSev,
      en: 'Your head is tilting forward - bring your ears back over your shoulders and raise your screen to eye level.',
      sw: 'Kichwa chako kinaegemea mbele - rudisha masikio yako juu ya mabega na inua skrini hadi usawa wa macho.',
    });
  }

  const headSev = metrics.headTilt !== null ? severityOf(metrics.headTilt, t.head.ok, t.head.bad) : 0;
  if (metrics.headTilt !== null && headSev > 0.05) {
    issues.push({
      key: 'head',
      severity: headSev,
      en: 'Your head is tilting to the side - level your head so your ear moves away from your shoulder.',
      sw: 'Kichwa chako kinainama upande - nyoosha kichwa ili sikio liache kukaribia bega.',
    });
  }

  const trunkSev = severityOf(metrics.trunkFlexion, t.trunk.ok, t.trunk.bad);
  if (trunkSev > 0.05) {
    issues.push({
      key: 'trunk',
      severity: trunkSev,
      en: 'Your back is leaning - sit/stand tall, stack your shoulders over your hips and use back support.',
      sw: 'Mgongo wako unaegemea - kaa/simama wima, weka mabega juu ya nyonga na tumia msaada wa mgongo.',
    });
  }

  if (metrics.shoulderTilt !== null) {
    const shoulderSev = severityOf(metrics.shoulderTilt, t.shoulder.ok, t.shoulder.bad);
    if (shoulderSev > 0.1) {
      issues.push({
        key: 'shoulder',
        severity: shoulderSev,
        en: 'Your shoulders are uneven - relax and level them, and check your chair/armrest height.',
        sw: 'Mabega yako hayako sawa - yatulize na yasawazishe, na angalia urefu wa kiti/kiegemeo cha mkono.',
      });
    }
  }

  if (mode === 'standing' && metrics.kneeFlexion !== null) {
    const tk = (t as typeof THRESH.standing).knee;
    const kneeSev = severityOf(metrics.kneeFlexion, tk.ok, tk.bad);
    if (kneeSev > 0.1) {
      issues.push({
        key: 'knee',
        severity: kneeSev,
        en: 'Deep knee bend detected - avoid sustained squatting; bend at the hips and keep loads close.',
        sw: 'Magoti yamepinda sana - epuka kuchuchumaa kwa muda mrefu; pinda kwenye nyonga na weka mizigo karibu.',
      });
    }
  }

  // Weighted penalty → score. Neck and trunk dominate (the angles that matter most).
  const penalty =
    neckSev * 42 +
    headSev * 34 +
    trunkSev * 38 +
    (metrics.shoulderTilt !== null ? severityOf(metrics.shoulderTilt, t.shoulder.ok, t.shoulder.bad) * 12 : 0) +
    (mode === 'standing' && metrics.kneeFlexion !== null
      ? severityOf(metrics.kneeFlexion, (t as typeof THRESH.standing).knee.ok, (t as typeof THRESH.standing).knee.bad) * 18
      : 0);

  const score = Math.round(clamp(100 - penalty, 0, 100));
  const zone: Zone = score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor';

  issues.sort((a, b) => b.severity - a.severity);
  return { score, zone, metrics, issues };
}

/** Convenience: landmarks → full result. */
export function analyzePosture(landmarks: Landmark[], mode: PostureMode): PostureResult {
  return scorePosture(computeMetrics(landmarks, mode), mode);
}

export const zoneColor = (zone: Zone) =>
  zone === 'good' ? 'hsl(var(--success))' : zone === 'fair' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

export const zoneLabel = (zone: Zone, lang: 'en' | 'sw') =>
  lang === 'sw'
    ? { good: 'Nzuri', fair: 'Wastani', poor: 'Hafifu' }[zone]
    : { good: 'Good', fair: 'Fair', poor: 'Poor' }[zone];

/** Short headline coaching message for the current/aggregate result. */
export function summarize(result: PostureResult, lang: 'en' | 'sw'): string {
  if (result.zone === 'good') {
    return lang === 'sw'
      ? 'Mkao mzuri! Endelea kukaa wima na kupumzika mara kwa mara.'
      : 'Great posture! Keep sitting tall and take regular movement breaks.';
  }
  const top = result.issues[0];
  if (top) return lang === 'sw' ? top.sw : top.en;
  return lang === 'sw' ? 'Rekebisha mkao wako kidogo.' : 'Adjust your posture a little.';
}

/** Average a series of metrics (for a multi-second assessment or a live session). */
export function averageMetrics(series: PostureMetrics[], mode: PostureMode): PostureResult | null {
  if (!series.length) return null;
  const avg = (sel: (m: PostureMetrics) => number | null) => {
    const vals = series.map(sel).filter((v): v is number => v !== null && !Number.isNaN(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };
  const metrics: PostureMetrics = {
    neckFlexion: avg((m) => m.neckFlexion) ?? 0,
    trunkFlexion: avg((m) => m.trunkFlexion) ?? 0,
    headTilt: avg((m) => m.headTilt),
    shoulderTilt: avg((m) => m.shoulderTilt),
    kneeFlexion: avg((m) => m.kneeFlexion),
    side: series[series.length - 1].side,
  };
  return scorePosture(metrics, mode);
}
