import type { TUserId, TPlatformRole } from '@sh3pherd/shared-types';

/**
 * Emitted after a user's subscription plan has been successfully changed.
 *
 * Listeners can react to this event to:
 * - Persist an analytics event (audit trail)
 * - Send a plan-change confirmation email
 * - Update cached usage summary
 */
export class PlanChangedEvent {
  constructor(
    public readonly userId: TUserId,
    public readonly fromPlan: TPlatformRole,
    public readonly toPlan: TPlatformRole,
    public readonly billingCycle: 'monthly' | 'annual' | null,
  ) {}
}
