import { z } from 'zod';

/**
 * Creates a Zod schema for IDs of the form `${prefix}_${string}`.
 */
export const createIdSchema = <const TPrefix extends string>(prefix: TPrefix) =>
  z
    .string()
    .refine(
      (val): val is `${TPrefix}_${string}` =>
        val.startsWith(`${prefix}_`),
      {
        message: `Invalid ID format. Expected format: ${prefix}_<unique_identifier>`,
      },
    );