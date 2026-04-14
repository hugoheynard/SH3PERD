import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TPlatformContractDomainModel } from '@sh3pherd/shared-types';
import type { TAccountType, TPlatformRole, TUserId } from '@sh3pherd/shared-types';

/** Artist plan names. */
const ARTIST_PLANS = new Set<TPlatformRole>(['artist_free', 'artist_pro', 'artist_max']);

/** Company plan names. */
const COMPANY_PLANS = new Set<TPlatformRole>(['company_free', 'company_pro', 'company_business']);

/** All valid plan names. */
const ALL_PLANS = new Set<TPlatformRole>([...ARTIST_PLANS, ...COMPANY_PLANS]);

/** Map account type → default plan. */
const DEFAULT_PLAN: Record<TAccountType, TPlatformRole> = {
  artist: 'artist_free',
  company: 'company_free',
};

/** Map account type → allowed plan set. */
const PLANS_FOR_ACCOUNT: Record<TAccountType, Set<TPlatformRole>> = {
  artist: ARTIST_PLANS,
  company: COMPANY_PLANS,
};

/**
 * Platform contract entity — represents a user's SaaS subscription.
 *
 * One per user, created at registration. The `plan` field determines
 * which permissions the user has for personal features via
 * `PLATFORM_ROLE_TEMPLATES`.
 *
 * The `account_type` field locks the plan family — an artist account
 * can only upgrade within artist plans, a company account within
 * company plans. Set at registration, never changes.
 *
 * Completely separate from `ContractEntity` (which represents an
 * employment relationship with a company).
 *
 * Invariants:
 * - `user_id` must be set
 * - `account_type` must be 'artist' or 'company'
 * - `plan` must belong to the same family as `account_type`
 * - `status` must be 'active' or 'suspended'
 */
export class PlatformContractEntity extends Entity<TPlatformContractDomainModel> {
  private static readonly VALID_STATUSES = new Set(['active', 'suspended']);

  constructor(props: TEntityInput<TPlatformContractDomainModel>) {
    if (!props.user_id) {
      throw new Error('PLATFORM_CONTRACT_USER_REQUIRED');
    }
    if (!props.account_type || !PLANS_FOR_ACCOUNT[props.account_type]) {
      throw new Error('PLATFORM_CONTRACT_INVALID_ACCOUNT_TYPE');
    }
    if (!ALL_PLANS.has(props.plan)) {
      throw new Error('PLATFORM_CONTRACT_INVALID_PLAN');
    }
    if (!PLANS_FOR_ACCOUNT[props.account_type].has(props.plan)) {
      throw new Error('PLATFORM_CONTRACT_PLAN_MISMATCH');
    }
    if (!PlatformContractEntity.VALID_STATUSES.has(props.status)) {
      throw new Error('PLATFORM_CONTRACT_INVALID_STATUS');
    }
    super(props, 'platformContract');
  }

  // ── Factory ──────────────────────────────────────────

  /**
   * Create a new platform contract for a given account type.
   * Defaults to the free plan of the matching family.
   */
  static create(
    userId: TUserId,
    accountType: TAccountType,
    plan?: TPlatformRole,
  ): PlatformContractEntity {
    return new PlatformContractEntity({
      user_id: userId,
      account_type: accountType,
      plan: plan ?? DEFAULT_PLAN[accountType],
      status: 'active',
      startDate: new Date(),
    });
  }

  // ── Getters ──────────────────────────────────────────

  get user_id(): TUserId {
    return this.props.user_id;
  }
  get account_type(): TAccountType {
    return this.props.account_type;
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

  /**
   * Upgrade or downgrade the subscription plan.
   * Must stay within the same family (artist → artist, company → company).
   */
  changePlan(newPlan: TPlatformRole): void {
    if (!PLANS_FOR_ACCOUNT[this.props.account_type].has(newPlan)) {
      throw new Error('PLATFORM_CONTRACT_PLAN_MISMATCH');
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
