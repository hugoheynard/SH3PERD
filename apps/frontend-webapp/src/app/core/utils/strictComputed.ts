import { computed, type Signal } from '@angular/core';

/**
 * Wraps a nullable signal into a strict computed signal.
 * Throws if the value is null or undefined.
 */
export function strictComputed<T>(
  source: Signal<T | null | undefined>,
  name = 'Value',
): Signal<NonNullable<T>> {
  return computed(() => {
    const value = source();
    if (value == null) {
      throw new Error(`${name} not initialized`);
    }
    return value;
  });
}
