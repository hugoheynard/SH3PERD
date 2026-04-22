import { z } from "zod";
import { SShowId, SShowSectionId, SShowSectionItemId, SUserId } from "./ids.js";
import type {
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TUserId,
  TPlaylistId,
  TMusicVersionId,
  TMusicReferenceId,
  TVersionTrackId,
} from "./ids.js";
import { SPlaylistColor, type TPlaylistColor } from "./playlists.js";

// ─── Section target ──────────────────────────────────────
// Optional hint set by the artist when planning a section — either a
// duration envelope ("this set should run ~45 min") or a track count
// target ("10 songs"). Purely informational: not enforced at insert time.

export const SHOW_SECTION_TARGET_MODES = ["duration", "track_count"] as const;
export type TShowSectionTargetMode = (typeof SHOW_SECTION_TARGET_MODES)[number];

export type TShowSectionTarget =
  | { mode: "duration"; duration_s: number }
  | { mode: "track_count"; track_count: number };

export const SShowSectionTarget = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("duration"),
    duration_s: z.number().int().positive(),
  }),
  z.object({
    mode: z.literal("track_count"),
    track_count: z.number().int().positive(),
  }),
]);

// ─── Section item kind ───────────────────────────────────

export const SHOW_ITEM_KINDS = ["version", "playlist"] as const;
export type TShowSectionItemKind = (typeof SHOW_ITEM_KINDS)[number];
export const SShowSectionItemKind = z.enum(SHOW_ITEM_KINDS);

// ─── Axis criteria ───────────────────────────────────────
// Optional per-axis target range the artist sets to steer a section
// (or the whole show) — "I want this set to average energy between 3
// and 4". Purely informational, drives a chip + out-of-range tint on
// the sparkline so the artist sees at a glance when the mean drifts
// outside the target window.
//
// Both bounds are optional. `min` alone = "at least N". `max` alone =
// "at most N". Both = a range. Neither = the criterion carries no
// constraint (kept as a hint marker rather than a gate).

export const SHOW_AXIS_KEYS = [
  "mastery",
  "energy",
  "effort",
  "quality",
] as const;
export type TShowAxisKey = (typeof SHOW_AXIS_KEYS)[number];
export const SShowAxisKey = z.enum(SHOW_AXIS_KEYS);

export interface TShowAxisCriterion {
  axis: TShowAxisKey;
  min?: number; // 1..4 inclusive
  max?: number; // 1..4 inclusive
}

export const SShowAxisCriterion = z
  .object({
    axis: SShowAxisKey,
    min: z.number().min(1).max(4).optional(),
    max: z.number().min(1).max(4).optional(),
  })
  .refine((c) => c.min === undefined || c.max === undefined || c.min <= c.max, {
    message: "axis criterion min must be <= max",
  });

/** Array form — at most one entry per axis; duplicates are the
 *  caller's responsibility, we don't dedupe at validation time. */
export const SShowAxisCriteria = z.array(SShowAxisCriterion);

// ─── Domain models ───────────────────────────────────────

export interface TShowDomainModel {
  id: TShowId;
  owner_id: TUserId;
  name: string;
  description?: string;
  color: TPlaylistColor;
  createdAt: number;
  updatedAt: number;
  lastPlayedAt?: number;
  /** Planning target for the whole show — what the artist wants the
   *  total running length to be, in seconds. Purely informational:
   *  used by the UI to drive a fill-% progress bar at the show level
   *  (separate from per-section targets). */
  totalDurationTargetSeconds?: number;
  /** Parity with per-section track-count targets — the whole show can
   *  also be scoped by song count. When set alongside the duration
   *  target, the UI picks whichever matches the user's pick in the
   *  settings panel (they're mutually exclusive on the front but
   *  independently stored so the shape stays additive). */
  totalTrackCountTarget?: number;
  /** Absolute scheduled start time (ms since epoch) for the show, or
   *  unset for "no schedule" (practice/prep plan without a date). */
  startAt?: number;
  /** Optional axis target ranges — at most one per axis. Empty (or
   *  undefined) means no criteria set. */
  axisCriteria?: TShowAxisCriterion[];
}

export const SShowDomainModel = z.object({
  id: SShowId,
  owner_id: SUserId,
  name: z.string().min(1),
  description: z.string().optional(),
  color: SPlaylistColor,
  createdAt: z.number(),
  updatedAt: z.number(),
  lastPlayedAt: z.number().optional(),
  totalDurationTargetSeconds: z.number().int().positive().optional(),
  totalTrackCountTarget: z.number().int().positive().optional(),
  startAt: z.number().optional(),
  axisCriteria: SShowAxisCriteria.optional(),
});

export interface TShowSectionDomainModel {
  id: TShowSectionId;
  show_id: TShowId;
  name: string;
  /** Optional free-text note on this section — venue cue, transition
   *  reminder, set intent. Rendered in the section header the same way
   *  the show description renders in the show header. */
  description?: string;
  position: number;
  target?: TShowSectionTarget;
  lastPlayedAt?: number;
  /** Absolute scheduled start time for this section (ms since epoch).
   *  Independent per section — the artist fills in what they want to
   *  remember; no auto-cascade from the show or previous section. */
  startAt?: number;
  /** Per-axis target ranges — same shape as the show-level field but
   *  scoped to this section's expanded version series. */
  axisCriteria?: TShowAxisCriterion[];
}

export const SShowSectionDomainModel = z.object({
  id: SShowSectionId,
  show_id: SShowId,
  name: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().nonnegative(),
  target: SShowSectionTarget.optional(),
  lastPlayedAt: z.number().optional(),
  startAt: z.number().optional(),
  axisCriteria: SShowAxisCriteria.optional(),
});

export interface TShowSectionItemDomainModel {
  id: TShowSectionItemId;
  section_id: TShowSectionId;
  position: number;
  kind: TShowSectionItemKind;
  ref_id: TMusicVersionId | TPlaylistId;
}

export const SShowSectionItemDomainModel = z.object({
  id: SShowSectionItemId,
  section_id: SShowSectionId,
  position: z.number().int().nonnegative(),
  kind: SShowSectionItemKind,
  ref_id: z.string().min(1), // version or playlist id — validated by handler against ownership
});

// ─── DTOs ────────────────────────────────────────────────

export interface TCreateShowPayload {
  name: string;
  color: TPlaylistColor;
  description?: string;
  totalDurationTargetSeconds?: number;
  totalTrackCountTarget?: number;
  startAt?: number;
  axisCriteria?: TShowAxisCriterion[];
}

export const SCreateShowPayload = z.object({
  name: z.string().min(1),
  color: SPlaylistColor,
  description: z.string().optional(),
  totalDurationTargetSeconds: z.number().int().positive().optional(),
  totalTrackCountTarget: z.number().int().positive().optional(),
  startAt: z.number().optional(),
  axisCriteria: SShowAxisCriteria.optional(),
});

export interface TUpdateShowPayload {
  name?: string;
  color?: TPlaylistColor;
  description?: string;
  /** `null` clears the field, `undefined` leaves it untouched. Same
   *  convention across every nullable field in this payload. */
  totalDurationTargetSeconds?: number | null;
  totalTrackCountTarget?: number | null;
  startAt?: number | null;
  axisCriteria?: TShowAxisCriterion[] | null;
}

export const SUpdateShowPayload = z.object({
  name: z.string().min(1).optional(),
  color: SPlaylistColor.optional(),
  description: z.string().optional(),
  totalDurationTargetSeconds: z.number().int().positive().nullable().optional(),
  totalTrackCountTarget: z.number().int().positive().nullable().optional(),
  startAt: z.number().nullable().optional(),
  axisCriteria: SShowAxisCriteria.nullable().optional(),
});

export interface TAddShowSectionPayload {
  name: string;
  description?: string;
  target?: TShowSectionTarget;
  startAt?: number;
  axisCriteria?: TShowAxisCriterion[];
}

export const SAddShowSectionPayload = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  target: SShowSectionTarget.optional(),
  startAt: z.number().optional(),
  axisCriteria: SShowAxisCriteria.optional(),
});

export interface TUpdateShowSectionPayload {
  name?: string;
  /** Empty string clears (same convention as show description). */
  description?: string;
  /** `null` clears the field, `undefined` leaves it untouched. */
  target?: TShowSectionTarget | null;
  startAt?: number | null;
  axisCriteria?: TShowAxisCriterion[] | null;
}

export const SUpdateShowSectionPayload = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  target: SShowSectionTarget.nullable().optional(),
  startAt: z.number().nullable().optional(),
  axisCriteria: SShowAxisCriteria.nullable().optional(),
});

export interface TReorderShowSectionsPayload {
  ordered_ids: TShowSectionId[];
}

export const SReorderShowSectionsPayload = z.object({
  ordered_ids: z.array(SShowSectionId).min(1),
});

export interface TAddShowSectionItemPayload {
  kind: TShowSectionItemKind;
  ref_id: TMusicVersionId | TPlaylistId;
  position?: number; // defaults to end
}

export const SAddShowSectionItemPayload = z.object({
  kind: SShowSectionItemKind,
  ref_id: z.string().min(1),
  position: z.number().int().nonnegative().optional(),
});

export interface TReorderShowSectionItemsPayload {
  ordered_ids: TShowSectionItemId[];
}

export const SReorderShowSectionItemsPayload = z.object({
  ordered_ids: z.array(SShowSectionItemId),
});

export interface TMarkShowPlayedPayload {
  playedAt?: number; // defaults to now
}

export const SMarkShowPlayedPayload = z.object({
  playedAt: z.number().optional(),
});

export interface TConvertSectionToPlaylistPayload {
  name?: string;
  color?: TPlaylistColor;
}

export const SConvertSectionToPlaylistPayload = z.object({
  name: z.string().min(1).optional(),
  color: SPlaylistColor.optional(),
});

// ─── View models ─────────────────────────────────────────
// The series follow the same contract as TPlaylistSummaryViewModel:
// one entry per expanded version (playlists are flattened at compute
// time), length == trackCount, `null` means "no data on that axis".

export interface TShowRatingSeries {
  trackCount: number;
  totalDurationSeconds: number;
  meanMastery: number | null;
  meanEnergy: number | null;
  meanEffort: number | null;
  meanQuality: number | null;
  masterySeries: (number | null)[];
  energySeries: (number | null)[];
  effortSeries: (number | null)[];
  qualitySeries: (number | null)[];
  /** Per-track duration in seconds, aligned with the rating series
   *  (same order, same length). Tracks with no resolvable duration
   *  surface as `0` so the sparkline can fall back to uniform spacing
   *  when every entry is zero. */
  durationSeries: number[];
}

export interface TShowSummaryViewModel extends TShowRatingSeries {
  id: TShowId;
  name: string;
  description?: string;
  color: TPlaylistColor;
  createdAt: number;
  updatedAt: number;
  lastPlayedAt?: number;
  sectionCount: number;
  /** Planning target for the whole show, in seconds (see domain model). */
  totalDurationTargetSeconds?: number;
  /** Track-count target for the whole show (alternative to duration). */
  totalTrackCountTarget?: number;
  /** Absolute scheduled start (ms since epoch). */
  startAt?: number;
  /** Per-axis target ranges. Not rendered on the list card (too dense),
   *  but carried in the summary so the list can filter / highlight
   *  later if needed. */
  axisCriteria?: TShowAxisCriterion[];
}

export type TShowSectionItemView =
  | {
      kind: "version";
      id: TShowSectionItemId;
      position: number;
      version: {
        id: TMusicVersionId;
        reference_id: TMusicReferenceId;
        label: string;
        title: string;
        originalArtist: string;
        favoriteTrackId?: TVersionTrackId;
        durationSeconds?: number;
      };
    }
  | {
      kind: "playlist";
      id: TShowSectionItemId;
      position: number;
      playlist: {
        id: TPlaylistId;
        name: string;
        color: TPlaylistColor;
        trackCount: number;
      };
    };

export interface TShowSectionViewModel extends TShowRatingSeries {
  id: TShowSectionId;
  name: string;
  /** Optional free-text note on this section. */
  description?: string;
  position: number;
  target?: TShowSectionTarget;
  lastPlayedAt?: number;
  /** Absolute scheduled start for this section (ms since epoch). */
  startAt?: number;
  /** Per-axis target ranges — drive the criteria chip + out-of-range
   *  tint on the section footer sparkline. */
  axisCriteria?: TShowAxisCriterion[];
  items: TShowSectionItemView[];
}

export interface TShowDetailViewModel extends TShowSummaryViewModel {
  sections: TShowSectionViewModel[];
}

// ─── Helpers (type narrowing) ────────────────────────────

export function isShowVersionItem(
  item: TShowSectionItemView,
): item is Extract<TShowSectionItemView, { kind: "version" }> {
  return item.kind === "version";
}

export function isShowPlaylistItem(
  item: TShowSectionItemView,
): item is Extract<TShowSectionItemView, { kind: "playlist" }> {
  return item.kind === "playlist";
}
