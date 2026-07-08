import { describe, expect, it } from 'vitest';
import { analyzePosture, averageMetrics, computeMetrics, isPersonVisible, type Landmark } from './ergonomics';

// 33 landmarks, defaulted invisible at frame center.
const blank = (): Landmark[] =>
  Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }));

/** Front-facing, upright body with level ears and shoulders. */
const uprightFront = (): Landmark[] => {
  const lm = blank();
  lm[7] = { x: 0.45, y: 0.3, z: 0, visibility: 0.9 }; // L ear
  lm[8] = { x: 0.55, y: 0.3, z: 0, visibility: 0.9 }; // R ear
  lm[11] = { x: 0.4, y: 0.45, z: 0, visibility: 0.9 }; // L shoulder
  lm[12] = { x: 0.6, y: 0.45, z: 0, visibility: 0.9 }; // R shoulder
  lm[23] = { x: 0.43, y: 0.75, z: 0, visibility: 0.9 }; // L hip
  lm[24] = { x: 0.57, y: 0.75, z: 0, visibility: 0.9 }; // R hip
  return lm;
};

describe('isPersonVisible', () => {
  it('rejects empty or invisible landmark sets', () => {
    expect(isPersonVisible(undefined)).toBe(false);
    expect(isPersonVisible(blank())).toBe(false);
  });

  it('accepts a body with visible shoulder and hip', () => {
    expect(isPersonVisible(uprightFront())).toBe(true);
  });
});

describe('scoring: upright posture', () => {
  it('scores an upright front-facing body as good', () => {
    const res = analyzePosture(uprightFront(), 'seated');
    expect(res.zone).toBe('good');
    expect(res.score).toBeGreaterThanOrEqual(80);
    // Front view puts the ear slightly medial to the shoulder, so a mild
    // neck note is expected - but nothing severe.
    expect(res.issues.every((i) => i.severity < 0.5)).toBe(true);
  });

  it('measures zero head tilt for a level head', () => {
    const m = computeMetrics(uprightFront(), 'seated');
    expect(m.headTilt).toBeCloseTo(0, 1);
    expect(m.shoulderTilt).toBeCloseTo(0, 1);
  });
});

describe('scoring: lateral head tilt (ear toward shoulder)', () => {
  const bentHead = () => {
    const lm = uprightFront();
    lm[7] = { x: 0.46, y: 0.26, z: 0, visibility: 0.9 }; // L ear up
    lm[8] = { x: 0.56, y: 0.33, z: 0, visibility: 0.9 }; // R ear down toward shoulder
    return lm;
  };

  it('detects a strongly tilted head', () => {
    const m = computeMetrics(bentHead(), 'seated');
    expect(m.headTilt).not.toBeNull();
    expect(m.headTilt as number).toBeGreaterThan(25);
  });

  it('scores it poor and reports a head issue first', () => {
    const res = analyzePosture(bentHead(), 'seated');
    expect(res.zone).toBe('poor');
    expect(res.score).toBeLessThan(60);
    expect(res.issues[0]?.key).toBe('head');
    expect(res.issues[0]?.severity).toBeGreaterThan(0.9);
  });

  it('does not false-flag when the whole camera is tilted', () => {
    // Rotate ears AND shoulders by the same ~8deg: head stays level
    // relative to the shoulders, so headTilt should stay near zero.
    const lm = uprightFront();
    lm[7] = { x: 0.45, y: 0.293, z: 0, visibility: 0.9 };
    lm[8] = { x: 0.55, y: 0.307, z: 0, visibility: 0.9 };
    lm[11] = { x: 0.4, y: 0.436, z: 0, visibility: 0.9 };
    lm[12] = { x: 0.6, y: 0.464, z: 0, visibility: 0.9 };
    const m = computeMetrics(lm, 'seated');
    expect(m.headTilt as number).toBeLessThan(2);
  });
});

describe('scoring: forward head (side view)', () => {
  it('penalizes a forward-leaning neck seen from the side', () => {
    const lm = blank();
    // Side view: only the left side is visible; ear far forward of shoulder.
    lm[7] = { x: 0.62, y: 0.32, z: 0, visibility: 0.9 }; // ear pushed forward
    lm[11] = { x: 0.5, y: 0.45, z: 0, visibility: 0.9 }; // shoulder
    lm[23] = { x: 0.5, y: 0.75, z: 0, visibility: 0.9 }; // hip
    const res = analyzePosture(lm, 'seated');
    expect(res.metrics.neckFlexion).toBeGreaterThan(35);
    expect(res.issues.some((i) => i.key === 'neck')).toBe(true);
    expect(res.zone).not.toBe('good');
  });
});

describe('averageMetrics', () => {
  it('returns null for an empty series', () => {
    expect(averageMetrics([], 'seated')).toBeNull();
  });

  it('averages a series so brief glitches do not dominate', () => {
    const good = computeMetrics(uprightFront(), 'seated');
    const series = [good, good, good, { ...good, neckFlexion: 60 }];
    const res = averageMetrics(series, 'seated');
    expect(res).not.toBeNull();
    // 3 clean frames + 1 outlier: average neck ~ (0*3 + 60)/4 = 15
    expect(res!.metrics.neckFlexion).toBeCloseTo((good.neckFlexion * 3 + 60) / 4, 1);
  });
});
