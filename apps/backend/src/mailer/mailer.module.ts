import { Module } from '@nestjs/common';
import { MAILER_SERVICE } from '../appBootstrap/nestTokens.js';
import { DryRunMailerAdapter } from './DryRunMailerAdapter.js';
import { getMailerConfig } from './getMailerConfig.js';
import type { IMailerService } from './types.js';

/**
 * Mailer module — provider-agnostic transactional email.
 *
 * Exposes `MAILER_SERVICE` (an `IMailerService`). The concrete adapter is
 * chosen at bootstrap from `getMailerConfig()`:
 * - When disabled (no API key) → `DryRunMailerAdapter` (logs only).
 * - When enabled → real provider adapter (wired in a follow-up commit).
 *
 * Callers never import adapters directly — they inject `MAILER_SERVICE`.
 */
@Module({
  providers: [
    {
      provide: MAILER_SERVICE,
      useFactory: (): IMailerService => {
        const config = getMailerConfig();
        if (!config.enabled) {
          return new DryRunMailerAdapter();
        }
        // Real provider adapter is wired in the next commit.
        // Until then, even with an API key present, fall back to dry-run
        // to keep the bootstrap green.
        return new DryRunMailerAdapter();
      },
    },
  ],
  exports: [MAILER_SERVICE],
})
export class MailerModule {}
