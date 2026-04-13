/**
 * Domain rule violation — thrown from entities, aggregates, or policies.
 *
 * Always maps to HTTP 400. The `context` helps pinpoint which field
 * or value caused the violation.
 *
 * @example
 * ```ts
 * throw new DomainError('Name cannot be empty', {
 *   code: 'COMPANY_NAME_REQUIRED',
 *   context: { field: 'name' },
 * });
 * ```
 */
export class DomainError extends Error {
  override readonly name = 'DomainError';
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, options: { code: string; context?: Record<string, unknown> }) {
    super(message);
    this.code = options.code;
    this.context = options.context;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
