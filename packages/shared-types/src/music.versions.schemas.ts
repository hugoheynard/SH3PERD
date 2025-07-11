import { z } from 'zod';
import { SUserId } from './user.domain.js';
import { SGenreEnum, SMusicReference_id, STypeEnum } from './music.domain.schemas.js';
import { SRecordMetadata } from './metadata.types.js';


export const SMusicVersion_id = z.string().regex(
  /^musicVersion_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid musicVersion_id format' },
);

export type TMusicVersionId = z.infer<typeof SMusicVersion_id>;

export const SMusicVersionDomainModel = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  owner_id: SUserId,
  genre: SGenreEnum,
  type: STypeEnum,
  bpm: z.number().nullable(),
  pitch: z.number().nullable(),
  musicReference_id: SMusicReference_id.nullable(),
  metaData: SRecordMetadata,
});

export type TMusicVersionDomainModel = z.infer<typeof SMusicVersionDomainModel>;


/** 🎛️ Form Payload */
export const SMusicVersionCreationFormPayloadSchema = SMusicVersionDomainModel
  .omit({
    owner_id: true,
    metaData: true,
  })
  .extend({
    createMusicReference: z.boolean(),
    musicReferenceDetails: z.object({
      title: z.string().min(1).nullable(),
      artist: z.string().min(1).nullable(),
      useVersionDetails: z.boolean(),
    }),
  });

export type TMusicVersionCreationFormPayload = z.infer<typeof SMusicVersionCreationFormPayloadSchema>;
