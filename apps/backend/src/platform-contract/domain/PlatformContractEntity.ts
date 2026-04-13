import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TPlatformContractDomainModel } from '@sh3pherd/shared-types';
import type { TPlatformRole, TUserId } from '@sh3pherd/shared-types';

/**
 * Platform contract entity — represents a user's SaaS subscription.
 *
 * One per user, created at registration. The `plan` field determines
 * which permissions the user has for personal features (music library,
 * playlists, etc.) via `PLATFORM_ROLE_TEMPLATES`.
 *
 * Completely separate from `ContractEntity` (which represents an
 * employment relationship with a company).
 *
 * Invariants:
 * - `user_id` must be set
 * - `plan` must be a valid TPlatformRole
 * - `status` must be 'active' or 'suspended'
 */
export class PlatformContractEntity extends Entity<TPlatformContractDomainModel> {
  private static readonly VALID_STATUSES = new Set(['active', 'suspended']);
  private static readonly VALID_PLANS = new Set([
    'plan_free',
    'plan_pro',
    'plan_band',
    'plan_business',
  ]);

  constructor(props: TEntityInput<TPlatformContractDomainModel>) {
    if (!props.user_id) {
      throw new Error('PLATFORM_CONTRACT_USER_REQUIRED');
    }
    if (!PlatformContractEntity.VALID_PLANS.has(props.plan)) {
      throw new Error('PLATFORM_CONTRACT_INVALID_PLAN');
    }
    if (!PlatformContractEntity.VALID_STATUSES.has(props.status)) {
      throw new Error('PLATFORM_CONTRACT_INVALID_STATUS');
    }
    super(props, 'platformContract');
  }

  // ── Factory ──────────────────────────────────────────

  /**
   * Single entry point for creating a new platform contract.
   * Defaults to plan_free + active. Use this instead of calling
   * the constructor directly — ensures consistent defaults.
   */
  static create(userId: TUserId, plan: TPlatformRole = 'plan_free'): PlatformContractEntity {
    return new PlatformContractEntity({
      user_id: userId,
      plan,
      status: 'active',
      startDate: new Date(),
    });
  }

  // ── Getters ──────────────────────────────────────────

  get user_id(): TUserId {
    return this.props.user_id;
  }
  get plan(): TPlatformRole {
    return this.props.plan;
  }
  get status(): 'active' | 'suspended' {
    return this.props.status;
  }
  get startDate(): Date {
    return this.props.startDate;
  }

  get isActive(): boolean {
    return this.props.status === 'active';
  }

  // ── Mutations ────────────────────────────────────────

  /** Upgrade or downgrade the subscription plan. */
  changePlan(newPlan: TPlatformRole): void {
    if (!PlatformContractEntity.VALID_PLANS.has(newPlan)) {
      throw new Error('PLATFORM_CONTRACT_INVALID_PLAN');
    }
    this.props.plan = newPlan;
  }

  /** Suspend the subscription (e.g. payment failed). */
  suspend(): void {
    if (this.props.status === 'suspended') return;
    this.props.status = 'suspended';
  }

  /** Reactivate a suspended subscription. */
  reactivate(): void {
    if (this.props.status === 'active') return;
    this.props.status = 'active';
  }
}
