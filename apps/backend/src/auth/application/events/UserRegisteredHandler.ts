import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from './UserRegisteredEvent.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

/**
 * Handles UserRegisteredEvent — persists an analytics event and
 * will eventually send a verification email.
 *
 * TODO: When a mailer service is configured, this handler should:
 * 1. Generate an email verification token (same SHA-256 pattern as password reset)
 * 2. Store the hashed token in `email_verification_tokens` collection
 * 3. Send a verification email with the raw token link
 *
 * See: documentation/todos/TODO-email-verification.md
 */
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger('Auth');

  constructor(private readonly analytics: AnalyticsEventService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(
      `[UserRegistered] ${event.email} (${event.firstName} ${event.lastName}) — userId=${event.userId}`,
    );

    await this.analytics.track('user_registered', event.userId, {
      email: event.email,
      first_name: event.firstName,
      last_name: event.lastName,
    });

    // TODO: Send verification email when mailer is configured
  }
}
