import { z, type ZodTypeAny } from 'zod';


export type TFormOption<T = string> = {
  label: string;
  value: T;
};

/**
 * Utility function to build a Zod schema for a form option.
 * It keeps the inner schema type for `value`.
 *
 * @example
 * const stringOption = formOption(z.string());
 * // => { label: string, value: string }
 *
 * const enumOption = formOption(z.enum(['root', 'department']));
 * // => { label: string, value: 'root' | 'department' }
 */
export function zFormOption<T extends ZodTypeAny>(schema: T) {
  return z.object({
    label: z.string(),
    value: schema,
  });
}