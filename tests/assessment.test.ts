import { describe, it, expect } from 'vitest';
import { scoreAssessment } from '@/lib/assessment';

describe('scoreAssessment', () => {
  it('computes pain average and functional score and red flags', () => {
    const form = {
      pain_now: 6,
      pain_week: 4,
      limits_work: true,
      limits_sleep: false,
      limits_walk: true,
      limits_lift: false,
      numbness: false,
      bowel_bladder_loss: false,
      fever_weight_loss: false,
      recent_trauma: false,
      chronicity: '2_6',
      region: 'lower_back'
    };

    const res = scoreAssessment(form as any);
    expect(res.pain_level).toBe(5);
    expect(res.functional_score).toBe(2);
    expect(res.red_flag).toBe(false);
    expect(res.region).toBe('lower_back');
    expect(res.chronicity).toBe('2_6');
  });
});
