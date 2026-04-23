import type { TPlatformRole } from '@sh3pherd/shared-types';
import { DEFAULT_MUSIC_POLICY_LIMITS, type MusicPolicyLimits } from './MusicPolicy.js';

/**
 * Per-plan music policy limits.
 *
 * Coherent tiering — every quantitative axis grows monotonically with
 * the plan so upgrades never *reduce* what a user can do. `artist_free`
 * is pinned to the domain default so existing users keep the exact
 * same ceilings after this wiring lands; paid tiers lift the caps.
 *
 * Free and *_pro share the same shape across artist / company families
 * (companies on free / pro get artist parity — they curate rather than
 * produce, but not at a lower volume). `company_business` is the top
 * tier: highest aggregate numbers, shaped for orchestrating larger
 * catalogues.
 *
 * Keep this table the single source of truth. `MusicPolicyLimitsProvider`
 * reads from it; tests spot-check individual rows. Any future plan has
 * to land here or fallback to the default — the `Record<TPlatformRole, …>`
 * typing guarantees exhaustive coverage.
 */
export const MUSIC_POLICY_LIMITS_BY_PLAN: Record<TPlatformRole, MusicPolicyLimits> = {
  // ── Artist family ─────────────────────────────────────
  artist_free: DEFAULT_MUSIC_POLICY_LIMITS, // 2 / 1 / 3 / 10
  artist_pro: {
    maxTracksPerVersion: 4,
    maxMastersPerVersion: 2,
    maxDerivationsPerSource: 5,
    maxVersionsPerReference: 25,
  },
  artist_max: {
    maxTracksPerVersion: 8,
    maxMastersPerVersion: 4,
    maxDerivationsPerSource: 10,
    maxVersionsPerReference: 100,
  },

  // ── Company family ────────────────────────────────────
  company_free: DEFAULT_MUSIC_POLICY_LIMITS,
  company_pro: {
    maxTracksPerVersion: 4,
    maxMastersPerVersion: 2,
    maxDerivationsPerSource: 5,
    maxVersionsPerReference: 25,
  },
  company_business: {
    maxTracksPerVersion: 10,
    maxMastersPerVersion: 4,
    maxDerivationsPerSource: 10,
    maxVersionsPerReference: 100,
  },
};

/** Safe resolver — falls back to the domain default when a plan is unknown or null. */
export function limitsForPlan(plan: TPlatformRole | null | undefined): MusicPolicyLimits {
  if (!plan) return DEFAULT_MUSIC_POLICY_LIMITS;
  return MUSIC_POLICY_LIMITS_BY_PLAN[plan] ?? DEFAULT_MUSIC_POLICY_LIMITS;
}
