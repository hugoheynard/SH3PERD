import { z } from 'zod';
import { SShowId, SShowSectionId, SShowSectionItemId, SUserId } from './ids.js';
import type {
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TUserId,
  TPlaylistId,
  TMusicVersionId,
  TMusicReferenceId,
  TVersionTrackId,
} from './ids.js';
import { SPlaylistColor, type TPlaylistColor } from './playlists.js';

// ─── Section target ──────────────────────────────────────
// Optional hint set by the artist when planning a section — either a
// duration envelope ("this set should run ~45 min") or a track count
// target ("10 songs"). Purely informational: not enforced at insert time.

export const SHOW_SECTION_TARGET_MODES = ['duration', 'track_count'] as const;
export type TShowSectionTargetMode = (typeof SHOW_SECTION_TARGET_MODES)[number];

export type TShowSectionTarget =
  | { mode: 'duration'; duration_s: number }
  | { mode: 'track_count'; track_count: number };

export const SShowSectionTarget = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('duration'),
    duration_s: z.number().int().positive(),
  }),
  z.object({
    mode: z.literal('track_count'),
    track_count: z.number().int().positive(),
  }),
]);

// ─── Section item kind ───────────────────────────────────

export const SHOW_ITEM_KINDS = ['version', 'playlist'] as const;
export type TShowSectionItemKind = (typeof SHOW_ITEM_KINDS)[number];
export const SShowSectionItemKind = z.enum(SHOW_ITEM_KINDS);

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
});

export interface TShowSectionDomainModel {
  id: TShowSectionId;
  show_id: TShowId;
  name: string;
  position: number;
  target?: TShowSectionTarget;
  lastPlayedAt?: number;
}

export const SShowSectionDomainModel = z.object({
  id: SShowSectionId,
  show_id: SShowId,
  name: z.string().min(1),
  position: z.number().int().nonnegative(),
  target: SShowSectionTarget.optional(),
  lastPlayedAt: z.number().optional(),
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
}

export const SCreateShowPayload = z.object({
  name: z.string().min(1),
  color: SPlaylistColor,
  description: z.string().optional(),
});

export interface TUpdateShowPayload {
  name?: string;
  color?: TPlaylistColor;
  description?: string;
}

export const SUpdateShowPayload = SCreateShowPayload.partial();

export interface TAddShowSectionPayload {
  name: string;
  target?: TShowSectionTarget;
}

export const SAddShowSectionPayload = z.object({
  name: z.string().min(1),
  target: SShowSectionTarget.optional(),
});

export interface TUpdateShowSectionPayload {
  name?: string;
  target?: TShowSectionTarget | null; // null clears the target
}

export const SUpdateShowSectionPayload = z.object({
  name: z.string().min(1).optional(),
  target: SShowSectionTarget.nullable().optional(),
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
}

export type TShowSectionItemView =
  | {
      kind: 'version';
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
      kind: 'playlist';
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
  position: number;
  target?: TShowSectionTarget;
  lastPlayedAt?: number;
  items: TShowSectionItemView[];
}

export interface TShowDetailViewModel extends TShowSummaryViewModel {
  sections: TShowSectionViewModel[];
}

// ─── Helpers (type narrowing) ────────────────────────────

export function isShowVersionItem(
  item: TShowSectionItemView,
): item is Extract<TShowSectionItemView, { kind: 'version' }> {
  return item.kind === 'version';
}

export function isShowPlaylistItem(
  item: TShowSectionItemView,
): item is Extract<TShowSectionItemView, { kind: 'playlist' }> {
  return item.kind === 'playlist';
}
