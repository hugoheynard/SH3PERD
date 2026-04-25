import type { TCompanyId, TContractId, TUserId } from '@sh3pherd/shared-types';

/**
 * Emitted when the company signs a contract and the contract becomes
 * visible to the recipient. This is the "Sign & Send" moment of the
 * company-first flow described in sh3-contracts.md.
 *
 * Listeners react to this event to notify the recipient — they should
 * not assume any further work has happened (the user has not yet
 * counter-signed at this point).
 */
export class ContractSentEvent {
  constructor(
    public readonly contractId: TContractId,
    public readonly companyId: TCompanyId,
    public readonly recipientId: TUserId,
    public readonly companySignerId: TUserId,
  ) {}
}
