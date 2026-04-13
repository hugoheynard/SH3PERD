import type { TUserId } from '@sh3pherd/shared-types';

/**
 * Emitted after a user has been successfully registered (credentials,
 * profile, and platform contract persisted in a single transaction).
 *
 * Listeners can react to this event to:
 * - Send a welcome / verification email (when mailer is configured)
 * - Track registration analytics
 * - Trigger onboarding workflows
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: TUserId,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
