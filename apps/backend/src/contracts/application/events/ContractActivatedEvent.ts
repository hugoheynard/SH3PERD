import type { TCompanyId, TContractId, TUserId } from '@sh3pherd/shared-types';

/**
 * Emitted when both parties have signed and the contract has just
 * been promoted to `active`. The user has just counter-signed (the
 * trigger), so the notification target is the company-side signer
 * who needs to know the contract is now in force.
 */
export class ContractActivatedEvent {
  constructor(
    public readonly contractId: TContractId,
    public readonly companyId: TCompanyId,
    /** The company user who originally signed (recipient of the notif). */
    public readonly companySignerId: TUserId,
    /** The user who just counter-signed (actor — no notif). */
    public readonly userSignerId: TUserId,
  ) {}
}
