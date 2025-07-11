import { z } from 'zod';

/** KEY */
export const SMusicNoteEnum = z.enum(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
export const SAlterationEnum = z.enum(['#', 'b']);
export const SToneEnum = z.enum(['major', 'minor']);

export const ALTERATION_KEY_MAP: Record<TMusicNoteEnum, TAlterationEnum[]> = {
  'C': ['#'],
  'D': ['#', 'b'],
  'E': ['#'],
  'F': ['#'],
  'G': ['#', 'b'],
  'A': ['#', 'b'],
  'B': ['b']
};

export const SKeySchema = z
  .object({
    root: SMusicNoteEnum.nullable(),
    alteration: SAlterationEnum.nullable(),
    tone: SToneEnum.nullable(),
  })
  .superRefine((key, ctx) => {
    const root = key.root;
    const alt = key.alteration;

    if (root && alt) {
      const allowed = ALTERATION_KEY_MAP[root];
      if (!allowed?.includes(alt)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alteration'],
          message: `Invalid alteration "${alt}" for root "${root}". Allowed: ${allowed.join(', ')}`,
        });
      }
    }
  })

export type TMusicNoteEnum = z.infer<typeof SMusicNoteEnum>;
export type TAlterationEnum = z.infer<typeof SAlterationEnum>;
export type TToneEnum = z.infer<typeof SToneEnum>;

// MUSIC DATAS
export const SGenreEnum = z.enum(['pop', 'rock', 'jazz', 'edm', 'soul-disco', 'ethnic', 'various']);
export const STypeEnum = z.enum(['original', 'cover', 'remix', 'acoustic']);

export type TGenreEnum = z.infer<typeof SGenreEnum>;
export type TTypeEnum = z.infer<typeof STypeEnum>;

export const MUSIC_GRADE_VALUES = [1, 2, 3, 4] as const;
export const SMusicGrade = z
  .union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ])
  .nullable();

export type TMusicGrade = z.infer<typeof SMusicGrade>;

export const SMusicReference_id = z.string().regex(
  /^musicReference_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid musicReference_id format' }
);





export const MusicRepertoireEntryPayloadSchema = z.object({
  musicVersion_id: z.string().min(1),
  repertoireEntryData: z.object({
    effort: SMusicGrade,
    energy: SMusicGrade,
    mastery: SMusicGrade,
    affinity: SMusicGrade
  })
})


