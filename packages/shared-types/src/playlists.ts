import { z } from "zod";
import {
  SPlaylistId,
  SPlaylistTrackId,
  SMusicReferenceId,
  SMusicVersionId,
  SUserId,
} from "./ids.js";
import type {
  TPlaylistId,
  TPlaylistTrackId,
  TMusicReferenceId,
  TMusicVersionId,
  TUserId,
} from "./ids.js";

// ─── Playlist color ──────────────────────────────────────

export const PlaylistColors = [
  "indigo",
  "emerald",
  "rose",
  "amber",
  "sky",
  "violet",
] as const;
export const SPlaylistColor = z.enum(PlaylistColors);
export type TPlaylistColor = z.infer<typeof SPlaylistColor>;

// ─── Playlist domain model ───────────────────────────────

export interface TPlaylistDomainModel {
  id: TPlaylistId;
  owner_id: TUserId;
  name: string;
  description?: string;
  color: TPlaylistColor;
  createdAt: number;
}

const _SPlaylistDomainModel = z.object({
  id: SPlaylistId,
  owner_id: SUserId,
  name: z.string().min(1),
  description: z.string().optional(),
  color: SPlaylistColor,
  createdAt: z.number(),
});

export const SPlaylistDomainModel = _SPlaylistDomainModel;

// ─── Playlist track domain model ─────────────────────────

export interface TPlaylistTrackDomainModel {
  id: TPlaylistTrackId;
  playlistId: TPlaylistId;
  referenceId: TMusicReferenceId;
  versionId: TMusicVersionId;
  position: number;
  notes?: string;
}

export const SPlaylistTrackDomainModel = z.object({
  id: SPlaylistTrackId,
  playlistId: SPlaylistId,
  referenceId: SMusicReferenceId,
  versionId: SMusicVersionId,
  position: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

// ─── DTOs ────────────────────────────────────────────────

export interface TCreatePlaylistPayload {
  name: string;
  color: TPlaylistColor;
  description?: string;
}

export const SCreatePlaylistPayload = _SPlaylistDomainModel.pick({
  name: true,
  color: true,
  description: true,
});

export interface TUpdatePlaylistPayload {
  name?: string;
  color?: TPlaylistColor;
  description?: string;
}

export const SUpdatePlaylistPayload = _SPlaylistDomainModel
  .pick({ name: true, color: true, description: true })
  .partial();

export interface TAddPlaylistTrackPayload {
  referenceId: TMusicReferenceId;
  versionId: TMusicVersionId;
  notes?: string;
}

export const SAddPlaylistTrackPayload = z.object({
  referenceId: SMusicReferenceId,
  versionId: SMusicVersionId,
  notes: z.string().optional(),
});

export interface TReorderPlaylistTrackPayload {
  newPosition: number;
}

export const SReorderPlaylistTrackPayload = z.object({
  newPosition: z.number().int().nonnegative(),
});

// ─── View models ─────────────────────────────────────────

/** Resolved track with reference title/artist and version label. */
export interface TPlaylistTrackView {
  id: TPlaylistTrackId;
  position: number;
  notes?: string;
  referenceId: TMusicReferenceId;
  versionId: TMusicVersionId;
  title: string;
  originalArtist: string;
  versionLabel: string;
}

/** Playlist with its resolved tracks. */
export interface TPlaylistDetailViewModel {
  id: TPlaylistId;
  name: string;
  description?: string;
  color: TPlaylistColor;
  createdAt: number;
  tracks: TPlaylistTrackView[];
}

/** Playlist summary for list view.
 *
 * Aggregates are computed by `GetUserPlaylistsHandler` from the resolved
 * music versions + favorite tracks of each playlist track:
 *
 * - `totalDurationSeconds` — sum of each playlist track's favorite-track
 *   duration; tracks whose version / favorite is unavailable contribute 0.
 * - `meanMastery` / `meanEnergy` / `meanEffort` — average over the versions
 *   referenced by the playlist tracks (one data point per playlist track).
 * - `meanQuality` — average of the favorite track's `quality` rating across
 *   the playlist's tracks.
 *
 * The mean fields are `null` when the playlist is empty OR when none of the
 * resolved versions / favorite tracks carried a rating. Consumers MUST
 * treat `null` as "no data" (e.g. render a dash), not as zero.
 *
 * The `*Series` fields carry the per-track values in playlist position
 * order. Length equals the number of playlist tracks whose version was
 * resolvable (tracks with orphaned versions are skipped from BOTH the
 * means and the series, so series.length ≤ trackCount). An entry is
 * `null` when that specific track lacks data on that axis — typically
 * only `qualitySeries` has gaps, because quality comes from the
 * favorite track's audio analysis. Consumers can plot the values as a
 * shape-of-the-playlist sparkline to complement the mean.
 */
export interface TPlaylistSummaryViewModel {
  id: TPlaylistId;
  name: string;
  description?: string;
  color: TPlaylistColor;
  createdAt: number;
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
