import type { ContractEntity } from './ContractEntity.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';

export class ContractPolicy {
  static ensureActive(contract: ContractEntity): void {
    if (!contract.isActive()) {
      throw new DomainError('Contract is inactive', {
        code: 'CONTRACT_INACTIVE',
        context: { contractId: contract.id },
      });
    }
  }
}
