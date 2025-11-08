/**
 * Représente une erreur métier (non technique).
 * Ces erreurs expriment une règle du domaine violée.
 */
export class DomainError extends Error {
  override readonly name = 'DomainError';
  public readonly code?: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options?: { code?: string; context?: Record<string, unknown> }
  ) {
    super(message);
    this.code = options?.code;
    this.context = options?.context;
    Error.captureStackTrace?.(this, this.constructor);
  }
}