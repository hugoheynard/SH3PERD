import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { TechnicalError } from '../utils/errorManagement/TechnicalError.js';
import { renderTemplate } from './templates/renderTemplate.js';
import type { IMailerService, TSendMailArgs } from './types.js';

/**
 * Minimal shape we consume from the Resend client. Typing `emails.send`
 * explicitly lets us swap the SDK for a mock in tests without pulling
 * the full `resend` types in.
 */
export type TResendLike = {
  emails: {
    send: (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      replyTo?: string | string[];
    }) => Promise<{
      data: { id: string } | null;
      error: { message: string; name?: string; statusCode?: number | null } | null;
    }>;
  };
};

export type TResendAdapterDeps = {
  client: TResendLike;
  fromAddress: string;
  replyTo: string | null;
};

/**
 * Real provider adapter — dispatches transactional emails via Resend.
 *
 * Renders the template locally (pure function) and hands `{ from, to,
 * subject, html, replyTo }` to `resend.emails.send`. Provider-level
 * failures are wrapped as `TechnicalError` with code `MAILER_SEND_FAILED`
 * so the caller (event handler, command handler) can decide whether to
 * swallow or surface. The error body is never leaked to end-users —
 * `GlobalExceptionFilter` maps it to a generic 500.
 *
 * Network failures from the SDK itself (fetch throw) are wrapped the
 * same way — the caller sees one error shape regardless of cause.
 */
export class ResendMailerAdapter implements IMailerService {
  private readonly logger = new Logger('Mailer');
  readonly enabled = true;

  constructor(private readonly deps: TResendAdapterDeps) {}

  async send(args: TSendMailArgs): Promise<void> {
    const { subject, html } = renderTemplate(args);

    const payload = {
      from: this.deps.fromAddress,
      to: args.to,
      subject,
      html,
      ...(this.deps.replyTo !== null ? { replyTo: this.deps.replyTo } : {}),
    };

    let result: Awaited<ReturnType<TResendLike['emails']['send']>>;
    try {
      result = await this.deps.client.emails.send(payload);
    } catch (err) {
      this.logger.error(
        `Resend send failed (network/thrown) — template=${args.template} to=${args.to}`,
      );
      throw new TechnicalError('Failed to send email via Resend.', {
        code: 'MAILER_SEND_FAILED',
        cause: err instanceof Error ? err : new Error(String(err)),
        context: { template: args.template, to: args.to },
      });
    }

    if (result.error !== null) {
      const { message, name, statusCode } = result.error;
      this.logger.error(
        `Resend send failed — template=${args.template} to=${args.to} ` +
          `status=${statusCode ?? 'n/a'} name=${name ?? 'n/a'} message=${message}`,
      );
      throw new TechnicalError('Failed to send email via Resend.', {
        code: 'MAILER_SEND_FAILED',
        context: {
          template: args.template,
          to: args.to,
          providerStatus: statusCode,
          providerError: name,
          providerMessage: message,
        },
      });
    }

    this.logger.log(
      `[Sent] template=${args.template} to=${args.to} providerId=${result.data?.id ?? 'n/a'}`,
    );
  }
}

/**
 * Build a `ResendMailerAdapter` from config. Kept as a factory so the
 * module wiring stays a one-liner and tests can bypass it.
 */
export const createResendMailerAdapter = (config: {
  apiKey: string;
  fromAddress: string;
  replyTo: string | null;
}): ResendMailerAdapter => {
  return new ResendMailerAdapter({
    client: new Resend(config.apiKey) as unknown as TResendLike,
    fromAddress: config.fromAddress,
    replyTo: config.replyTo,
  });
};
