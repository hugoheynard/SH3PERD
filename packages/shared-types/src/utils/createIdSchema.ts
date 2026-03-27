import { z } from 'zod';

/**
 * Creates a Zod schema for IDs of the form `${prefix}_${string}`.
 *
 * The generic parameter `TId` narrows the output type to the branded template
 * literal (e.g. `company_${string}`), enabling `z.ZodType<T>` annotations on
 * schemas that contain this ID field.
 *
 * @example
 * export type TCompanyId = `company_${string}`;
 * export const SCompanyId = createIdSchema<TCompanyId>('company');
 * // z.infer<typeof SCompanyId> === TCompanyId  ✅
 */
export const createIdSchema = <TId extends string>(prefix: string) =>
  z.string()
    .regex(
      new RegExp(`^${prefix}_[a-zA-Z0-9_-]+$`),
      { message: `Invalid ID format. Expected format: ${prefix}_<unique_identifier>` }
    )
    .transform(s => s as TId);
