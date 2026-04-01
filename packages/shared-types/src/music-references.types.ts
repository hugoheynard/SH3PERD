import { z } from 'zod';
import { SMusicReferenceId, SUserId, type TMusicReferenceId, type TUserId } from './ids.js';
import type { TApiResponse } from './api.types.js';

// ─── Domain model ──────────────────────────────────────────

/** A canonical music reference (song) — shared across all users. */
export interface TMusicReferenceDomainModel {
  id:       TMusicReferenceId;
  title:    string;
  artist:   string;
  owner_id: TUserId;
}

export const SMusicReferenceDomainModel = z.object({
  id:       SMusicReferenceId,
  title:    z.string().min(1),
  artist:   z.string().min(1),
  owner_id: SUserId,
});


// ─── DTOs ──────────────────────────────────────────────────

export interface TCreateMusicReferenceRequestDTO {
  title:  string;
  artist: string;
}

export const SCreateMusicReferencePayload = z.object({
  title:  z.string().min(1),
  artist: z.string().min(1),
});

export type TMusicReferenceCreationResponseDTO = TApiResponse<TMusicReferenceDomainModel>;


// ─── Backward compat re-exports (used by music.domain.schemas) ──

/** @deprecated Use SMusicReferenceId from ids.ts instead */
export const SMusicReferenceId_legacy = SMusicReferenceId;
