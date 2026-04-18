/**
 * Mailer server-side config.
 *
 * Read once at module bootstrap. An absent or blank `RESEND_API_KEY` puts the
 * service into dry-run mode so local dev, tests, and CI work without a real
 * provider account. Production MUST set the key — the DryRun adapter only
 * logs and never delivers.
 */
export type TMailerConfig = {
  /** True when a provider API key is configured (vs. dry-run). */
  enabled: boolean;
  /** Raw provider API key, or `null` in dry-run mode. */
  apiKey: string | null;
  /** `From:` header used for every outbound email. */
  fromAddress: string;
  /** Optional `Reply-To:` header. `null` when unset. */
  replyTo: string | null;
};

const DEFAULT_FROM_ADDRESS = 'noreply@sh3pherd.com';

const trimOrNull = (value: string | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getMailerConfig = (): TMailerConfig => {
  const apiKey = trimOrNull(process.env['RESEND_API_KEY']);
  const fromAddress = trimOrNull(process.env['MAILER_FROM_ADDRESS']) ?? DEFAULT_FROM_ADDRESS;
  const replyTo = trimOrNull(process.env['MAILER_REPLY_TO']);

  return {
    enabled: apiKey !== null,
    apiKey,
    fromAddress,
    replyTo,
  };
};
