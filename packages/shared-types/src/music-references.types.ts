import { z } from "zod";
import {
  SMusicReferenceId,
  SUserId,
  type TMusicReferenceId,
  type TUserId,
} from "./ids.js";
import type { TApiResponse } from "./api.types.js";

// ─── Creator (discriminated union) ────────────────────────

/**
 * Who contributed this canonical reference.
 *
 * - `user`: a real user submitted the reference → counts as a community contribution
 * - `system`: imported from an external catalogue → no contribution credit
 *
 * The creator is immutable after creation. References are shared across the whole
 * user base, so no one owns them — this field is a contribution marker only and
 * MUST NOT be used to gate mutation rights.
 */
export type TMusicReferenceCreator =
  | { type: "user"; id: TUserId }
  | { type: "system"; source: "musicbrainz" | "spotify" | "seed" };

export const SMusicReferenceCreator = z.discriminatedUnion("type", [
  z.object({ type: z.literal("user"), id: SUserId }),
  z.object({
    type: z.literal("system"),
    source: z.enum(["musicbrainz", "spotify", "seed"]),
  }),
]);

// ─── Domain model ──────────────────────────────────────────

/**
 * A canonical music reference (song) — shared across all users.
 *
 * Immutable after creation on the user-facing API. Only admin-triggered
 * curation ops (merge, rematch, enrichment) are allowed to mutate the
 * underlying document, and they emit dedicated domain events rather than
 * bumping an `updated_at` on this model.
 */
export interface TMusicReferenceDomainModel {
  id: TMusicReferenceId;
  title: string;
  artist: string;
  creator: TMusicReferenceCreator;
  created_at: Date;
}

export const SMusicReferenceDomainModel = z.object({
  id: SMusicReferenceId,
  title: z.string().min(1),
  artist: z.string().min(1),
  creator: SMusicReferenceCreator,
  created_at: z.date(),
});

// ─── DTOs ──────────────────────────────────────────────────

export interface TCreateMusicReferenceRequestDTO {
  title: string;
  artist: string;
}

export const SCreateMusicReferencePayload = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
});

export type TMusicReferenceCreationResponseDTO =
  TApiResponse<TMusicReferenceDomainModel>;

// ─── Backward compat re-exports (used by music.domain.schemas) ──

/** @deprecated Use SMusicReferenceId from ids.ts instead */
export const SMusicReferenceId_legacy = SMusicReferenceId;
