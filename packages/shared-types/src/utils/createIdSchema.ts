import { z } from 'zod';

/**
 * Creates a Zod schema for IDs of the form `${prefix}_${string}`.
 */
export const createIdSchema = <TPrefix extends string>(prefix: TPrefix) =>
  z.string().regex(
    new RegExp(`^${prefix}_[a-zA-Z0-9_-]+$`),
    { message: `Invalid ID format. Expected format: ${prefix}_<unique_identifier>` }
  );
