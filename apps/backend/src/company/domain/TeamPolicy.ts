import type { TeamEntity } from './TeamEntity.js';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';

export class TeamPolicy {
  ensureActive(team: TeamEntity): void {
    if (team.isArchived()) {
      throw new DomainError('Cannot modify an archived team', { code: 'TEAM_ARCHIVED' });
    }
  }

  ensureCanManageMembers(actorId: string | undefined): void {
    if (!actorId) {
      throw new DomainError('Actor required to manage team members', { code: 'TEAM_UNAUTHORIZED' });
    }
  }
}
