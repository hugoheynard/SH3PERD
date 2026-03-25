import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';

export class CompanyPolicy {
  static ensureCanManage(actorId: string | undefined): void {
    if (!actorId) {
      throw new DomainError('Actor required to manage company', { code: 'COMPANY_UNAUTHORIZED' });
    }
  }
}
