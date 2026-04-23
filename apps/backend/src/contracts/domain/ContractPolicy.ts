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
}
