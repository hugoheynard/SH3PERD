import type { TPlatformRole } from './permissions.types.js';

// ─── Billing Cycle ──────────────────────────────────────

export type TBillingCycle = 'monthly' | 'annual';

// ─── Plan Pricing ───────────────────────────────────────

export interface TPlanPricing {
  /** Price per month when billed annually. */
  annual: number;
  /** Price per month when billed monthly (+25%). */
  monthly: number;
  /** ISO 4217 currency code. */
  currency: string;
}

/**
 * Pricing for each paid plan. Free plans are not listed.
 *
 * All prices are in EUR per month. Annual = engagement price,
 * monthly = +25% premium for flexibility.
 */
export const PLAN_PRICING: Partial<Record<TPlatformRole, TPlanPricing>> = {
  // ── Artist plans ──────────────────────────────────
  artist_pro:  { annual: 9.99,  monthly: 12.99, currency: 'EUR' },
  artist_max:  { annual: 19.99, monthly: 24.99, currency: 'EUR' },

  // ── Company plans ─────────────────────────────────
  company_pro:      { annual: 29.99, monthly: 37.99, currency: 'EUR' },
  company_business: { annual: 79.99, monthly: 99.99, currency: 'EUR' },
};

// ─── Helpers ────────────────────────────────────────────

/** Returns the price per month for a plan + billing cycle. 0 for free plans. */
export function getPlanPrice(plan: TPlatformRole, cycle: TBillingCycle): number {
  const pricing = PLAN_PRICING[plan];
  if (!pricing) return 0;
  return pricing[cycle];
}

/** Returns the total yearly cost for a plan + billing cycle. */
export function getYearlyTotal(plan: TPlatformRole, cycle: TBillingCycle): number {
  return getPlanPrice(plan, cycle) * 12;
}

/** Returns the annual savings compared to monthly billing. */
export function getAnnualSavings(plan: TPlatformRole): number {
  const pricing = PLAN_PRICING[plan];
  if (!pricing) return 0;
  return (pricing.monthly - pricing.annual) * 12;
}
