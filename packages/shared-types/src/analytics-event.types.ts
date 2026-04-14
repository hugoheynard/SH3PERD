import { z } from 'zod';
import type { TUserId } from './ids.js';

// ── Event types (single source of truth) ───────────────────

/**
 * All tracked analytics event types — `as const` array is the
 * single source of truth. The type `TAnalyticsEventType` is
 * derived from it, so adding a new event requires only one change.
 *
 * Convention: `domain_action` (snake_case).
 * Events are append-only — never modified after insertion.
 */
export const ANALYTICS_EVENT_TYPES = [
  // Auth
  'user_registered',
  'user_login',
  'user_login_failed',
  'user_deactivated',
  // Plan
  'plan_changed',
  'billing_cycle_changed',
  // Credits
  'credit_pack_purchased',
  'credit_used',
  // Music
  'track_uploaded',
  'track_analysed',
  'track_mastered',
  'track_ai_mastered',
  'track_pitch_shifted',
  'repertoire_entry_created',
  // Quota
  'quota_exceeded',
  'quota_warning_80pct',
] as const;

/** Union type derived from the `ANALYTICS_EVENT_TYPES` array. */
export type TAnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

// ── Domain model ───────────────────────────────────────────

/**
 * An analytics event stored in the `analytics_events` collection.
 *
 * This is an append-only record — never updated or deleted.
 * The collection serves as the audit trail / analytics source.
 */
export type TAnalyticsEventDomainModel = {
  id: string;
  type: TAnalyticsEventType;
  user_id: TUserId;
  timestamp: Date;
  /** Type-specific payload (e.g. { from: 'artist_free', to: 'artist_pro' }). */
  metadata: Record<string, unknown>;
};

// ── Zod schema (for query validation) ──────────────────────

export const SAnalyticsEventQuery = z.object({
  type: z.enum(ANALYTICS_EVENT_TYPES).optional(),
  user_id: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type TAnalyticsEventQuery = z.infer<typeof SAnalyticsEventQuery>;
