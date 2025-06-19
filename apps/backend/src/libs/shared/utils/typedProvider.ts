import type { Provider } from '@nestjs/common';

/**
 * Generic helper to bind a class to a DI token while enforcing a type T.
 *
 * Ensures the class implements the interface T.
 */
export function typedProvider<T>(
  token: symbol | string,
  useClass: new (...args: any[]) => T,
): Provider<T> {
  return {
    provide: token,
    useClass,
  };
}
