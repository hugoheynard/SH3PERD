import { z } from 'zod';
import type { TApiResponse } from './api.types.js';
import { SRecordMetadata } from './metadata.types.js';

/**
 * Domain types for music references.
 */
export const SMusicReferenceId = z.string().regex(
  /^musicReference_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid musicReferenceId format' },
);

export type TMusicReferenceId = z.infer<typeof SMusicReferenceId>;


export const SMusicReferenceDetails = z.object({
  title: z.string(),
  artist: z.string(),
})

export type TCreateMusicReferenceRequestDTO = z.infer<typeof SMusicReferenceDetails>;
export type TMusicReferenceCreationResponseDTO = TApiResponse<TMusicReferenceDomainModel>

export const SMusicReferenceDomainModel = SMusicReferenceDetails
  .extend({
    musicReference_id: SMusicReferenceId,
    metadata: SRecordMetadata,
  });

export type TMusicReferenceDomainModel = z.infer<typeof SMusicReferenceDomainModel>;
