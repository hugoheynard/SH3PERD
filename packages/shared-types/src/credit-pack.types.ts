import type { TUserId } from './ids.js';
import type { TQuotaResource } from './quota.types.js';

// ── Credit purchase record ─────────────────────────────────

/**
 * A credit purchase stored in `credit_purchases`.
 *
 * When a user buys a credit pack, a purchase record is created.
 * The `remaining` field is decremented each time a credit is used.
 *
 * - `one_time` packs never expire (period_key = 'permanent')
 * - `monthly` packs expire at the end of the billing month (period_key = 'YYYY-MM')
 */
export type TCreditPurchaseDomainModel = {
  id: string;                        // creditPurchase_xxx
  user_id: TUserId;
  resource: TQuotaResource;
  amount: number;                    // total credits purchased
  remaining: number;                 // credits left (decremented on usage)
  period: 'one_time' | 'monthly';
  period_key: string;                // 'permanent' or 'YYYY-MM'
  purchased_at: Date;
  stripe_payment_id?: string;        // Stripe reference for receipt
};

// ── Credit pack catalogue ──────────────────────────────────

/**
 * A credit pack that can be purchased.
 * Hardcoded for now — will move to DB when self-serve admin exists.
 */
export type TCreditPack = {
  id: string;
  resource: TQuotaResource;
  amount: number;
  price: number;                     // EUR
  currency: string;
  period: 'one_time' | 'monthly';
  label: string;                     // "10 AI Masters"
  description: string;
};

/**
 * Credit pack catalogue — the buyable packs.
 *
 * Hardcoded like PLAN_QUOTAS. Moving to DB is tracked in
 * documentation/todos/TODO-usage-credits-events.md.
 */
export const CREDIT_PACKS: TCreditPack[] = [
  // ── AI Mastering ─────────────────────────────────────
  {
    id: 'pack_ai_10',
    resource: 'master_ai',
    amount: 10,
    price: 4.99,
    currency: 'EUR',
    period: 'monthly',
    label: '10 AI Masters',
    description: '10 AI mastering credits this month',
  },
  {
    id: 'pack_ai_50',
    resource: 'master_ai',
    amount: 50,
    price: 19.99,
    currency: 'EUR',
    period: 'monthly',
    label: '50 AI Masters',
    description: '50 AI mastering credits this month',
  },

  // ── Storage ──────────────────────────────────────────
  {
    id: 'pack_storage_5',
    resource: 'storage_bytes',
    amount: 5 * 1024 * 1024 * 1024,  // 5 GB
    price: 2.99,
    currency: 'EUR',
    period: 'one_time',
    label: '+5 GB Storage',
    description: 'Permanent storage extension',
  },
  {
    id: 'pack_storage_20',
    resource: 'storage_bytes',
    amount: 20 * 1024 * 1024 * 1024, // 20 GB
    price: 9.99,
    currency: 'EUR',
    period: 'one_time',
    label: '+20 GB Storage',
    description: 'Permanent storage extension',
  },

  // ── Repertoire (artist_free) ─────────────────────────
  {
    id: 'pack_songs_50',
    resource: 'repertoire_entry',
    amount: 50,
    price: 3.99,
    currency: 'EUR',
    period: 'one_time',
    label: '+50 Songs',
    description: 'Add 50 slots to your library',
  },
];

// ── Helpers ────────────────────────────────────────────────

/**
 * Find a credit pack by ID.
 */
export function getCreditPack(packId: string): TCreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}

/**
 * Get all packs available for a given resource.
 */
export function getPacksForResource(resource: TQuotaResource): TCreditPack[] {
  return CREDIT_PACKS.filter((p) => p.resource === resource);
}
