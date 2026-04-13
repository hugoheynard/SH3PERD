import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from './UserRegisteredEvent.js';

/**
 * Handles UserRegisteredEvent — placeholder for email verification.
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

  handle(event: UserRegisteredEvent): void {
    this.logger.log(
      `[UserRegistered] ${event.email} (${event.firstName} ${event.lastName}) — userId=${event.userId}`,
    );
    // TODO: Send verification email when mailer is configured
  }
}
