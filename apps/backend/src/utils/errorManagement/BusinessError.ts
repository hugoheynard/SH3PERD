/**
 * Business-level error — thrown from command/query handlers or controllers.
 *
 * Carries its own HTTP status code (404, 403, 409, etc.).
 * No context or cause needed — the code + message tell the full story.
 *
 * @example
 * ```ts
 * throw new BusinessError('Company not found', {
 *   code: 'COMPANY_NOT_FOUND',
 *   status: 404,
 * });
 *
 * throw new BusinessError('Forbidden', {
 *   code: 'ORGNODE_FORBIDDEN',
 *   status: 403,
 * });
 * ```
 */
export class BusinessError extends Error {
  override readonly name = 'BusinessError';
  public readonly code: string;
  public readonly status: number;

  constructor(
    message: string,
    options: { code: string; status?: number },
  ) {
    super(message);
    this.code = options.code;
    this.status = options.status ?? 400;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
