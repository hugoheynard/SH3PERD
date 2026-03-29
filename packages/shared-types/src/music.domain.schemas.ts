import { z } from 'zod';

// ─── Enums ──────────────────────────────────────────────────

/** Musical key root note. */
export enum MusicNote { C = 'C', D = 'D', E = 'E', F = 'F', G = 'G', A = 'A', B = 'B' }
export const SMusicNoteEnum = z.nativeEnum(MusicNote);
export type TMusicNoteEnum = MusicNote;

/** Alteration (sharp / flat). */
export enum Alteration { Sharp = '#', Flat = 'b' }
export const SAlterationEnum = z.nativeEnum(Alteration);
export type TAlterationEnum = Alteration;

/** Major / minor tone. */
export enum Tone { Major = 'major', Minor = 'minor' }
export const SToneEnum = z.nativeEnum(Tone);
export type TToneEnum = Tone;

/** Music genre. */
export enum Genre {
  Pop        = 'pop',
  Rock       = 'rock',
  Jazz       = 'jazz',
  Edm        = 'edm',
  SoulDisco  = 'soul-disco',
  Ethnic     = 'ethnic',
  Various    = 'various',
}
export const SGenreEnum = z.nativeEnum(Genre);
export type TGenreEnum = Genre;

/** Version type (original, cover…). */
export enum VersionType {
  Original = 'original',
  Cover    = 'cover',
  Remix    = 'remix',
  Acoustic = 'acoustic',
}
export const STypeEnum = z.nativeEnum(VersionType);
export type TTypeEnum = VersionType;

/** Rating 1–4, used for mastery, energy, effort, quality. */
export type TRating = 1 | 2 | 3 | 4;
export const SRating = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

/** Nullable grade (legacy compat). */
export const SMusicGrade = SRating.nullable();
export type TMusicGrade = TRating | null;


// ─── Key schema ─────────────────────────────────────────────

export const ALTERATION_KEY_MAP: Record<MusicNote, Alteration[]> = {
  [MusicNote.C]: [Alteration.Sharp],
  [MusicNote.D]: [Alteration.Sharp, Alteration.Flat],
  [MusicNote.E]: [Alteration.Sharp],
  [MusicNote.F]: [Alteration.Sharp],
  [MusicNote.G]: [Alteration.Sharp, Alteration.Flat],
  [MusicNote.A]: [Alteration.Sharp, Alteration.Flat],
  [MusicNote.B]: [Alteration.Flat],
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
  });
