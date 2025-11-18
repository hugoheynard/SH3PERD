import { TechnicalError } from '../errorClasses/TechnicalError.js';

/**
 * Method decorator that wraps an asynchronous method in a `try/catch`
 * and throws a `TechnicalError` with a standardized HTTP 500 response
 * if an unhandled error occurs during execution.
 *
 * ✅ Usage:
 * - Apply only to `async` methods
 * - Centralizes error handling logic for infrastructure or system-level operations
 * - Promotes clean, DRY repositories and services
 *
 * 🚨 If applied to non-method members (e.g., fields or getters), it will throw at runtime.
 *
 * @example
 * ```ts
 * class MyRepository {
 *   @failThrows500('USER_DELETE_FAILED', 'Could not delete user from DB')
 *   async deleteUser(id: string) {
 *     await this.collection.deleteOne({ id });
 *   }
 * }
 * ```
 *
 * @param code - A technical error code (used for logging and client responses)
 * @param message - Optional developer-defined error message (defaults to auto-generated)
 *
 * @throws {TechnicalError} When the decorated method throws
 */
export function technicalFailThrows500(code: string, message?: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor | undefined,
  ): void => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error(
        `@failThrows500 must be applied to a method. Check "${String(propertyKey)}".`,
      );
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        console.error(err)
        throw new TechnicalError(
          message ?? `Failure in ${target.constructor.name}.${String(propertyKey)}`,
          code,
          500,
        );
      }
    };
  };
}
