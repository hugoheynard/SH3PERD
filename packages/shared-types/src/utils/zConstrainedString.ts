import { z } from 'zod';


/**
 * Build a string schema with:
 * - required/optional flag
 * - min length
 * - no spaces allowed
 * - custom label for better error messages
 */
export const zConstrainedString = (
  label: string,
  {
    minLength = 2,
    optional = false,
    allowSpaces = false,
  }: { minLength?: number; optional?: boolean; allowSpaces?: boolean } = {},
) => {
  let schema: z.ZodString | z.ZodOptional<z.ZodString> = z
    .string({
      required_error: `${label} is required.`,
      invalid_type_error: `${label} must be a string.`,
    })
    .trim()
    .min(minLength, `${label} must be at least ${minLength} characters long.`);

  if (!allowSpaces) {
    schema = schema.regex(/^\S+$/, `${label} must not contain spaces.`);
  }

  if (optional) {
    schema = schema.optional();
  }

  return schema;
};