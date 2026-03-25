import type { CastEntity } from './CastEntity.js';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';

export class CastPolicy {
  ensureActive(cast: CastEntity): void {
    if (cast.isArchived()) {
      throw new DomainError('Cannot modify an archived cast', { code: 'CAST_ARCHIVED' });
    }
  }

  ensureCanManageMembers(actorId: string | undefined): void {
    if (!actorId) {
      throw new DomainError('Actor required to manage cast members', { code: 'CAST_UNAUTHORIZED' });
    }
  }
}
