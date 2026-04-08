import type { OrgNodeEntity } from './OrgNodeEntity.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';

export class OrgNodePolicy {
  ensureActive(node: OrgNodeEntity): void {
    if (node.isArchived()) {
      throw new DomainError('Cannot modify an archived org node', { code: 'ORGNODE_ARCHIVED' });
    }
  }

  ensureCanManageMembers(actorId: string | undefined): void {
    if (!actorId) {
      throw new DomainError('Actor required to manage node members', { code: 'ORGNODE_UNAUTHORIZED' });
    }
  }
}
