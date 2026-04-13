import type { ZodError } from 'zod';

/**
 * Formats a ZodError into a more readable structure.
 * @param error
 */
export function formatZodError(error: ZodError) {
  const { fieldErrors, formErrors } = error.flatten();

  const details = Object.entries(fieldErrors)
    .map(([path, messages]) => `${path}: ${messages?.join(', ')}`)
    .join('\n');

  return {
    summary: formErrors,
    fieldErrors,
    message: details || 'Invalid data structure',
  };
}
