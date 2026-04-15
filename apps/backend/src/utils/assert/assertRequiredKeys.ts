export const assertRequiredKeys = <T>(
  object: unknown,
  keys: (keyof T)[],
  label = 'object',
): asserts object is T => {
  if (typeof object !== 'object' || object === null) {
    throw new Error(`Expected ${label} to be a non-null object, got ${typeof object}`);
  }

  const record = object as Record<PropertyKey, unknown>;
  for (const key of keys) {
    const value = record[key as PropertyKey];
    if (typeof value !== 'function') {
      throw new Error(`Missing or invalid dependency "${String(key)}" in ${label}`);
    }
  }
};
