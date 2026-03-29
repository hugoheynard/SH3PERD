import { z } from 'zod';
import { SRepertoireEntryId, SMusicReferenceId, SUserId } from './ids.js';
import type { TRepertoireEntryId, TMusicReferenceId, TUserId } from './ids.js';
import type { TApiResponse } from './api.types.js';

// ─── Domain model ──────────────────────────────────────────

/** Links a user to a music reference — "this song is in my repertoire". */
export interface TMusicRepertoireEntryDomainModel {
  id:                TRepertoireEntryId;
  musicReference_id: TMusicReferenceId;
  user_id:           TUserId;
}

export const SMusicRepertoireEntryDomainModel = z.object({
  id:                 SRepertoireEntryId,
  musicReference_id:  SMusicReferenceId,
  user_id:            SUserId,
});


// ─── DTOs ──────────────────────────────────────────────────

export interface TCreateRepertoireEntryPayload {
  musicReference_id: TMusicReferenceId;
}

export const SCreateRepertoireEntryPayload = z.object({
  musicReference_id: SMusicReferenceId,
});


export interface TGetMusicRepertoireByFilterRequestDTO {
  asker_user_id:  TUserId;
  target_user_id: TUserId | TUserId[];
  filter?:        Record<string, unknown>;
}

export type TGetMusicRepertoireByFilterResponseDTO = TApiResponse<TMusicRepertoireEntryDomainModel[]>;
