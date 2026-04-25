import type { ContractEntity } from './ContractEntity.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';

export class ContractPolicy {
  static ensureActive(contract: ContractEntity): void {
    if (!contract.isActive()) {
      throw new DomainError('Contract is inactive', {
        code: 'CONTRACT_INACTIVE',
        context: { contractId: contract.id },
      });
    }
  }

  /** Blocks direct edits once contract is fully signed. Modifications go via addendum. */
  static ensureEditable(contract: ContractEntity): void {
    if (contract.isLocked()) {
      throw new BusinessError(
        'Contract is locked — all modifications must go through an addendum',
        { code: 'CONTRACT_LOCKED', status: 409 },
      );
    }
  }

  /**
   * A contract is amendable when it has been fully accepted by both
   * sides and is currently active. Drafts (incl. company-signed but not
   * yet counter-signed) cannot be amended — the legitimate path is to
   * either complete the signature or void and recreate. Terminated
   * contracts are history; a new agreement is required to revive
   * anything from them.
   *
   * Note: an active contract whose endDate has passed remains amendable
   * — that's how `extend_period` keeps a relationship alive past its
   * original term.
   */
  static ensureAmendable(contract: ContractEntity): void {
    if (contract.toDomain.status !== 'active' || !contract.isFullySigned()) {
      throw new BusinessError(
        'Contract must be active and fully signed before an addendum can be created',
        { code: 'CONTRACT_NOT_AMENDABLE', status: 409 },
      );
    }
  }
}
