import { z } from 'zod';
import type { ApiResponse } from './api.types.js';
import { SRecordMetadata } from './metadata.types.js';

/**
 * Domain types for music references.
 */
export const SMusicReferenceId = z.string().regex(
  /^musicReference_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid musicReferenceId format' },
);

export type TMusicReferenceId = `musicReference_${string}`;


export const SMusicReferenceDetails = z.object({
  title: z.string(),
  artist: z.string(),
})

export type TCreateMusicReferenceRequestDTO = z.infer<typeof SMusicReferenceDetails>;
export type TMusicReferenceCreationResponseDTO = ApiResponse<TMusicReferenceDomainModel>

export const SMusicReferenceDomainModel = SMusicReferenceDetails
  .extend({
    musicReference_id: SMusicReferenceId,
    metadata: SRecordMetadata,
  });

export type TMusicReferenceDomainModel = z.infer<typeof SMusicReferenceDomainModel>;
