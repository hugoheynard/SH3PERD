/**
 * Mailer domain types.
 *
 * The public API is intentionally **template-based**: callers never craft HTML
 * or subjects. They pick a template identifier and pass the typed `data` that
 * the template expects. A discriminated union on `template` + `data` keeps the
 * payload strongly typed — adding a template means adding a variant here.
 *
 * Low-level concerns (HTML rendering, provider SDK, retries) live behind the
 * `IMailerService` boundary. Swapping provider (Resend → SES → SendGrid) is a
 * single-file change.
 */

export type TPasswordResetMailPayload = {
  template: 'password-reset';
  data: {
    firstName: string;
    resetUrl: string;
    expiresAt: Date;
  };
};

export type TEmailVerificationMailPayload = {
  template: 'email-verification';
  data: {
    firstName: string;
    verifyUrl: string;
    expiresAt: Date;
  };
};

export type TMailPayload = TPasswordResetMailPayload | TEmailVerificationMailPayload;

export type TMailTemplate = TMailPayload['template'];

export type TSendMailArgs = {
  /** Primary recipient — a single RFC-5321 address. */
  to: string;
} & TMailPayload;

export type IMailerService = {
  /**
   * Send a templated transactional email.
   *
   * - When the service is in dry-run mode (no API key configured), the call
   *   logs the payload at INFO level and resolves. Used by dev, CI, and any
   *   environment that doesn't have outbound mail wired.
   * - When enabled, the adapter renders the template and dispatches to the
   *   provider. Provider errors are wrapped as `TechnicalError` with code
   *   `MAILER_SEND_FAILED` so the caller can decide whether to degrade.
   */
  send(args: TSendMailArgs): Promise<void>;

  /** True when a real provider is wired (vs. dry-run). Useful for assertions. */
  readonly enabled: boolean;
};
