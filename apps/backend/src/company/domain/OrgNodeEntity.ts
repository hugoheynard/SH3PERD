import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TOrgNodeDomainModel,
  TOrgNodeId,
  TOrgNodeMember,
  TOrgNodeGuestMember,
  TOrgNodeCommunication,
  TCommunicationPlatform,
  TContractId,
  TUserId,
} from '@sh3pherd/shared-types';
import type { TTeamRole, TTeamType } from '@sh3pherd/shared-types';
import { DomainError } from '../../utils/errorManagement/DomainError.js';

/**
 * OrgNode entity — a node in the company's organizational hierarchy.
 *
 * Root nodes (`parent_id: undefined`) act as departments/divisions
 * and carry a `type` that maps to application feature sets (music, event, etc.).
 *
 * Child nodes inherit their parent's feature domain via the hierarchy.
 *
 * Permission inheritance: a manager of a parent node has manager access
 * to all child nodes. A direct membership overrides the inherited role.
 */
export class OrgNodeEntity extends Entity<TOrgNodeDomainModel> {
  private static readonly VALID_STATUSES = new Set(['active', 'archived']);

  constructor(props: TEntityInput<TOrgNodeDomainModel>) {
    if (!props.company_id) {
      throw new DomainError('Company ID is required', { code: 'ORGNODE_COMPANY_REQUIRED' });
    }
    if (!props.name?.trim()) {
      throw new DomainError('Name is required', { code: 'ORGNODE_NAME_REQUIRED' });
    }
    if (!OrgNodeEntity.VALID_STATUSES.has(props.status)) {
      throw new DomainError('Invalid status', { code: 'ORGNODE_INVALID_STATUS' });
    }

    super({ ...props, name: props.name.trim() }, 'orgnode');
  }

  // ── Getters ────────────────────────────────────────────

  get name(): string {
    return this.props.name;
  }
  get company_id(): TOrgNodeDomainModel['company_id'] {
    return this.props.company_id;
  }
  get parent_id(): TOrgNodeDomainModel['parent_id'] {
    return this.props.parent_id;
  }
  get type(): TOrgNodeDomainModel['type'] {
    return this.props.type;
  }
  get color(): TOrgNodeDomainModel['color'] {
    return this.props.color;
  }
  get position(): TOrgNodeDomainModel['position'] {
    return this.props.position;
  }
  get status(): TOrgNodeDomainModel['status'] {
    return this.props.status;
  }
  get communications(): TOrgNodeCommunication[] {
    return this.props.communications;
  }
  get members(): TOrgNodeMember[] {
    return this.props.members;
  }
  get guest_members(): TOrgNodeGuestMember[] {
    return this.props.guest_members;
  }

  // ── Node info management ───────────────────────────────

  rename(name: string): void {
    if (!name.trim()) {
      throw new DomainError('Name is required', { code: 'ORGNODE_NAME_REQUIRED' });
    }
    this.props.name = name.trim();
  }

  setColor(color: string): void {
    this.props.color = color;
  }

  setType(type: TTeamType): void {
    this.props.type = type;
  }

  setPosition(position: number): void {
    this.props.position = position;
  }

  setParent(parentId: TOrgNodeId | undefined): void {
    this.props.parent_id = parentId;
  }

  setCommunications(communications: TOrgNodeCommunication[]): void {
    this.props.communications = [...communications];
  }

  /** Add a communication channel to this node */
  addCommunication(comm: TOrgNodeCommunication): void {
    this.props = { ...this.props, communications: [...(this.props.communications ?? []), comm] };
  }

  /** Remove a communication channel by platform */
  removeCommunication(platform: TCommunicationPlatform): void {
    this.props = {
      ...this.props,
      communications: (this.props.communications ?? []).filter((c) => c.platform !== platform),
    };
  }

  // ── Member management ──────────────────────────────────

  addMember(
    userId: TUserId,
    contractId: TContractId,
    teamRole: TTeamRole = 'member',
    jobTitle?: string,
    joinedAt: Date = new Date(),
  ): TOrgNodeMember {
    if (this.hasActiveMember(userId)) {
      throw new DomainError('Member already active in this node', {
        code: 'ORGNODE_MEMBER_ALREADY_EXISTS',
        context: { userId },
      });
    }
    const member: TOrgNodeMember = {
      user_id: userId,
      contract_id: contractId,
      team_role: teamRole,
      ...(jobTitle ? { job_title: jobTitle } : {}),
      joinedAt,
    };
    this.props = { ...this.props, members: [...this.props.members, member] };
    return member;
  }

  removeMember(userId: TUserId, leftAt: Date = new Date()): void {
    if (!this.hasActiveMember(userId)) {
      throw new DomainError('Member not active in this node', {
        code: 'ORGNODE_MEMBER_NOT_FOUND',
        context: { userId },
      });
    }
    this.props = {
      ...this.props,
      members: this.props.members.map((m) =>
        m.user_id === userId && !m.leftAt ? { ...m, leftAt } : m,
      ),
    };
  }

  /** Update a member's role within this node */
  updateMemberRole(userId: TUserId, teamRole: TTeamRole): void {
    if (!this.hasActiveMember(userId)) {
      throw new DomainError('Member not active in this node', {
        code: 'ORGNODE_MEMBER_NOT_FOUND',
        context: { userId },
      });
    }
    this.props = {
      ...this.props,
      members: this.props.members.map((m) =>
        m.user_id === userId && !m.leftAt ? { ...m, team_role: teamRole } : m,
      ),
    };
  }

  // ── Guest member management ──────────────────────────────

  addGuestMember(guest: TOrgNodeGuestMember): TOrgNodeGuestMember {
    this.props = { ...this.props, guest_members: [...(this.props.guest_members ?? []), guest] };
    return guest;
  }

  removeGuestMember(guestId: string): void {
    const guests = this.props.guest_members ?? [];
    if (!guests.some((g) => g.id === guestId)) {
      throw new DomainError('Guest member not found', {
        code: 'ORGNODE_GUEST_NOT_FOUND',
        context: { guestId },
      });
    }
    this.props = { ...this.props, guest_members: guests.filter((g) => g.id !== guestId) };
  }

  // ── Temporal queries ───────────────────────────────────

  getMembersAt(date: Date): TOrgNodeMember[] {
    return this.props.members.filter((m) => m.joinedAt <= date && (!m.leftAt || m.leftAt >= date));
  }

  getActiveMembers(): TOrgNodeMember[] {
    return this.props.members.filter((m) => !m.leftAt);
  }

  hasActiveMember(userId: TUserId): boolean {
    return this.props.members.some((m) => m.user_id === userId && !m.leftAt);
  }

  // ── Hierarchy queries ──────────────────────────────────

  get isRoot(): boolean {
    return !this.props.parent_id;
  }

  // ── Lifecycle ──────────────────────────────────────────

  archive(): void {
    if (this.props.status === 'archived') {
      throw new DomainError('Node is already archived', { code: 'ORGNODE_ALREADY_ARCHIVED' });
    }
    this.props = { ...this.props, status: 'archived' };
  }

  isArchived(): boolean {
    return this.props.status === 'archived';
  }
}
