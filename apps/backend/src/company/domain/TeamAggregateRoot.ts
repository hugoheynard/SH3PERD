import { randomUUID } from 'crypto';
import { AggregateRoot } from '@nestjs/cqrs';
import type {
  TTeamDomainModel,
  TTeamId,
  TTeamMember,
  TCastMembershipEventRecord,
  TContractId,
  TUserId,
} from '@sh3pherd/shared-types';
import type { TEntityInput } from '../../utils/entities/Entity.js';
import { TeamEntity } from './TeamEntity.js';
import { TeamPolicy } from './TeamPolicy.js';
import { TeamMemberAddedEvent } from './events/TeamMemberAddedEvent.js';
import { TeamMemberRemovedEvent } from './events/TeamMemberRemovedEvent.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';

export class TeamAggregateRoot extends AggregateRoot {
  private readonly team: TeamEntity;
  private readonly policy: TeamPolicy;

  constructor(props: TEntityInput<TTeamDomainModel>, policy = new TeamPolicy()) {
    super();
    this.team = new TeamEntity(props);
    this.policy = policy;
  }

  // ── Commands ───────────────────────────────────────

  addMember(
    actorId: TUserId,
    userId: TUserId,
    contractId: TContractId,
  ): TCastMembershipEventRecord {
    this.policy.ensureActive(this.team);
    this.policy.ensureCanManageMembers(actorId);

    const member = this.team.addMember(userId, contractId);

    const evt: TCastMembershipEventRecord = this.buildMembershipEvent({
      type: 'member_added',
      userId,
      date: member.joinedAt,
      by: actorId,
      actorId,
    });

    this.apply(new TeamMemberAddedEvent(this.team.id as TTeamId, userId, contractId, member.joinedAt));
    return evt;
  }

  removeMember(
    actorId: TUserId,
    userId: TUserId,
    reason?: string,
  ): TCastMembershipEventRecord {
    this.policy.ensureActive(this.team);
    this.policy.ensureCanManageMembers(actorId);

    const leftAt = new Date();
    this.team.removeMember(userId, leftAt);

    const evt: TCastMembershipEventRecord = this.buildMembershipEvent({
      type: 'member_removed',
      userId,
      date: leftAt,
      by: actorId,
      actorId,
      reason,
    });

    this.apply(new TeamMemberRemovedEvent(this.team.id as TTeamId, userId, leftAt));
    return evt;
  }

  archive(actorId: TUserId): void {
    this.policy.ensureCanManageMembers(actorId);
    this.team.archive();
  }

  // ── Queries ────────────────────────────────────────

  getMembersAt(date: Date): TTeamMember[] {
    return this.team.getMembersAt(date);
  }

  getActiveMembers(): TTeamMember[] {
    return this.team.getActiveMembers();
  }

  // ── Snapshot / diff ────────────────────────────────

  get snapshot(): TTeamDomainModel {
    return this.team.toDomain;
  }

  getUpdateObject(): Record<string, unknown> {
    return this.team.getDiffProps();
  }

  get id(): TTeamId {
    return this.team.id as TTeamId;
  }

  // ── Private helpers ────────────────────────────────

  private buildMembershipEvent(input: {
    type: 'member_added' | 'member_removed';
    userId: TUserId;
    date: Date;
    by: TUserId;
    actorId: TUserId;
    reason?: string;
  }): TCastMembershipEventRecord {
    const meta = RecordMetadataUtils.create(input.actorId);
    return {
      id: `castevt_${randomUUID()}`,
      cast_id: this.team.id,
      user_id: input.userId,
      type: input.type,
      date: input.date,
      by: input.by,
      ...(input.reason ? { reason: input.reason } : {}),
      ...meta,
    };
  }

  // ── Static factory ─────────────────────────────────

  static fromRecord(record: TTeamDomainModel): TeamAggregateRoot {
    return new TeamAggregateRoot(record);
  }
}
