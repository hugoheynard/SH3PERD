import { Logger } from '@nestjs/common';
import type { IMailerService, TSendMailArgs } from './types.js';

/**
 * Dry-run adapter — logs instead of delivering.
 *
 * Active whenever `RESEND_API_KEY` is unset. Used by:
 * - Local dev without a provider account
 * - CI (tests never touch the network)
 * - Any environment where outbound mail would be noise
 *
 * The log line is deliberately parsable (`template=...`, `to=...`) so that
 * integration tests and manual dev QA can grep for the email they expect.
 */
export class DryRunMailerAdapter implements IMailerService {
  private readonly logger = new Logger('Mailer');
  readonly enabled = false;

  constructor() {
    this.logger.warn(
      'RESEND_API_KEY is not configured — mailer is in dry-run mode. ' +
        'Emails will be logged instead of sent. Set RESEND_API_KEY in production.',
    );
  }

  send(args: TSendMailArgs): Promise<void> {
    this.logger.log(
      `[DryRun] template=${args.template} to=${args.to} data=${JSON.stringify(args.data)}`,
    );
    return Promise.resolve();
  }
}
