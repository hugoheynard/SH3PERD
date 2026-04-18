import { Module } from '@nestjs/common';
import { MAILER_SERVICE } from '../appBootstrap/nestTokens.js';
import { DryRunMailerAdapter } from './DryRunMailerAdapter.js';
import { createResendMailerAdapter } from './ResendMailerAdapter.js';
import { getMailerConfig } from './getMailerConfig.js';
import type { IMailerService } from './types.js';

/**
 * Mailer module — provider-agnostic transactional email.
 *
 * Exposes `MAILER_SERVICE` (an `IMailerService`). The concrete adapter is
 * chosen at bootstrap from `getMailerConfig()`:
 * - When disabled (no API key) → `DryRunMailerAdapter` (logs only).
 * - When enabled → `ResendMailerAdapter` talking to the Resend SDK.
 *
 * Callers never import adapters directly — they inject `MAILER_SERVICE`.
 * Swapping provider (SES, SendGrid) is a one-file change here.
 */
@Module({
  providers: [
    {
      provide: MAILER_SERVICE,
      useFactory: (): IMailerService => {
        const config = getMailerConfig();
        if (!config.enabled || config.apiKey === null) {
          return new DryRunMailerAdapter();
        }
        return createResendMailerAdapter({
          apiKey: config.apiKey,
          fromAddress: config.fromAddress,
          replyTo: config.replyTo,
        });
      },
    },
  ],
  exports: [MAILER_SERVICE],
})
export class MailerModule {}
