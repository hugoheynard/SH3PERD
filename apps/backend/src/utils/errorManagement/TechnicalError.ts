/**
 * Infrastructure / technical failure — DB down, external service timeout, write failure.
 *
 * Always maps to HTTP 500. The `cause` chains the original error for investigation.
 * The `context` captures IDs and operation metadata for debugging.
 *
 * **Never exposed to the client** — the GlobalExceptionFilter returns a generic
 * "An internal error occurred" message and logs the full details server-side.
 *
 * @example
 * ```ts
 * throw new TechnicalError('Failed to update company', {
 *   code: 'COMPANY_UPDATE_FAILED',
 *   cause: mongoError,
 *   context: { companyId: 'company_abc', operation: 'updateOne' },
 * });
 * ```
 */
export class TechnicalError extends Error {
  override readonly name = 'TechnicalError';
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      code: string;
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, { cause: options.cause });
    this.code = options.code;
    this.context = options.context;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
