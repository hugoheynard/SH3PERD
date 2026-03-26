import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TTeamDomainModel, TTeamMember, TContractId, TUserId } from '@sh3pherd/shared-types';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';

export class TeamEntity extends Entity<TTeamDomainModel> {
  constructor(props: TEntityInput<TTeamDomainModel>) {
    super(props, 'team');
  }

  // ── Member management ──────────────────────────────

  addMember(userId: TUserId, contractId: TContractId, joinedAt: Date = new Date()): TTeamMember {
    if (this.hasActiveMember(userId)) {
      throw new DomainError('Member already active in this team', {
        code: 'TEAM_MEMBER_ALREADY_EXISTS',
        context: { userId },
      });
    }
    const member: TTeamMember = { user_id: userId, contract_id: contractId, joinedAt };
    this.props = { ...this.props, members: [...this.props.members, member] };
    return member;
  }

  removeMember(userId: TUserId, leftAt: Date = new Date()): void {
    if (!this.hasActiveMember(userId)) {
      throw new DomainError('Member not active in this team', {
        code: 'TEAM_MEMBER_NOT_FOUND',
        context: { userId },
      });
    }
    this.props = {
      ...this.props,
      members: this.props.members.map(m =>
        m.user_id === userId && !m.leftAt ? { ...m, leftAt } : m,
      ),
    };
  }

  // ── Temporal queries ───────────────────────────────

  getMembersAt(date: Date): TTeamMember[] {
    return this.props.members.filter(
      m => m.joinedAt <= date && (!m.leftAt || m.leftAt >= date),
    );
  }

  getActiveMembers(): TTeamMember[] {
    return this.props.members.filter(m => !m.leftAt);
  }

  hasActiveMember(userId: TUserId): boolean {
    return this.props.members.some(m => m.user_id === userId && !m.leftAt);
  }

  // ── Lifecycle ──────────────────────────────────────

  archive(): void {
    if (this.props.status === 'archived') {
      throw new DomainError('Team is already archived', { code: 'TEAM_ALREADY_ARCHIVED' });
    }
    this.props = { ...this.props, status: 'archived' };
  }

  isArchived(): boolean {
    return this.props.status === 'archived';
  }
}
