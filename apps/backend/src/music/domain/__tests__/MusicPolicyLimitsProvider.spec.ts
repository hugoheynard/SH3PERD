import type { TPlatformRole } from '@sh3pherd/shared-types';
import { DEFAULT_MUSIC_POLICY_LIMITS } from '../MusicPolicy.js';
import { MUSIC_POLICY_LIMITS_BY_PLAN, limitsForPlan } from '../musicPolicyLimits.plans.js';
import { MusicPolicyLimitsProvider } from '../MusicPolicyLimitsProvider.js';
import { userId } from './test-helpers.js';

describe('limitsForPlan', () => {
  it('returns the domain default when the plan is null or undefined', () => {
    expect(limitsForPlan(null)).toBe(DEFAULT_MUSIC_POLICY_LIMITS);
    expect(limitsForPlan(undefined)).toBe(DEFAULT_MUSIC_POLICY_LIMITS);
  });

  it('returns the tier-specific limits for every known plan', () => {
    const plans: TPlatformRole[] = [
      'artist_free',
      'artist_pro',
      'artist_max',
      'company_free',
      'company_pro',
      'company_business',
    ];
    for (const p of plans) {
      expect(limitsForPlan(p)).toBe(MUSIC_POLICY_LIMITS_BY_PLAN[p]);
    }
  });

  it('grows monotonically with the plan tier (artist family)', () => {
    const free = MUSIC_POLICY_LIMITS_BY_PLAN.artist_free;
    const pro = MUSIC_POLICY_LIMITS_BY_PLAN.artist_pro;
    const max = MUSIC_POLICY_LIMITS_BY_PLAN.artist_max;

    expect(pro.maxTracksPerVersion).toBeGreaterThanOrEqual(free.maxTracksPerVersion);
    expect(max.maxTracksPerVersion).toBeGreaterThanOrEqual(pro.maxTracksPerVersion);

    expect(pro.maxMastersPerVersion).toBeGreaterThanOrEqual(free.maxMastersPerVersion);
    expect(max.maxMastersPerVersion).toBeGreaterThanOrEqual(pro.maxMastersPerVersion);

    expect(pro.maxVersionsPerReference).toBeGreaterThanOrEqual(free.maxVersionsPerReference);
    expect(max.maxVersionsPerReference).toBeGreaterThanOrEqual(pro.maxVersionsPerReference);
  });

  it('keeps company_business at or above artist_max on every axis (top tier)', () => {
    const cb = MUSIC_POLICY_LIMITS_BY_PLAN.company_business;
    const am = MUSIC_POLICY_LIMITS_BY_PLAN.artist_max;
    expect(cb.maxTracksPerVersion).toBeGreaterThanOrEqual(am.maxTracksPerVersion);
    expect(cb.maxMastersPerVersion).toBeGreaterThanOrEqual(am.maxMastersPerVersion);
    expect(cb.maxVersionsPerReference).toBeGreaterThanOrEqual(am.maxVersionsPerReference);
  });
});

describe('MusicPolicyLimitsProvider', () => {
  it('resolves the plan via QuotaService and maps to the tier-specific limits', async () => {
    const quota = { getPlan: jest.fn().mockResolvedValue('artist_pro') };
    const provider = new MusicPolicyLimitsProvider(quota as never);

    const limits = await provider.forUser(userId());

    expect(quota.getPlan).toHaveBeenCalledWith(userId());
    expect(limits).toEqual(MUSIC_POLICY_LIMITS_BY_PLAN.artist_pro);
  });

  it('falls back to the default when QuotaService throws (DB blip)', async () => {
    const quota = { getPlan: jest.fn().mockRejectedValue(new Error('mongo down')) };
    const provider = new MusicPolicyLimitsProvider(quota as never);

    const limits = await provider.forUser(userId());

    expect(limits).toBe(DEFAULT_MUSIC_POLICY_LIMITS);
  });

  it('falls back to the default when the plan value is unexpected', async () => {
    const quota = { getPlan: jest.fn().mockResolvedValue('some_future_plan') };
    const provider = new MusicPolicyLimitsProvider(quota as never);

    const limits = await provider.forUser(userId());

    expect(limits).toBe(DEFAULT_MUSIC_POLICY_LIMITS);
  });
});
