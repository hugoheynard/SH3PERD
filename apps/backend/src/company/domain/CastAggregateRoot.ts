import { randomUUID } from 'crypto';
import { AggregateRoot } from '@nestjs/cqrs';
import type {
  TCastDomainModel,
  TCastId,
  TCastMember,
  TCastMembershipEventRecord,
  TContractId,
  TUserId,
} from '@sh3pherd/shared-types';
import type { TEntityInput } from '../../utils/entities/Entity.js';
import { CastEntity } from './CastEntity.js';
import { CastPolicy } from './CastPolicy.js';
import { CastMemberAddedEvent } from './events/CastMemberAddedEvent.js';
import { CastMemberRemovedEvent } from './events/CastMemberRemovedEvent.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';

export class CastAggregateRoot extends AggregateRoot {
  private readonly cast: CastEntity;
  private readonly policy: CastPolicy;

  constructor(props: TEntityInput<TCastDomainModel>, policy = new CastPolicy()) {
    super();
    this.cast = new CastEntity(props);
    this.policy = policy;
  }

  // ── Commands ───────────────────────────────────────

  addMember(
    actorId: TUserId,
    userId: TUserId,
    contractId: TContractId,
  ): TCastMembershipEventRecord {
    this.policy.ensureActive(this.cast);
    this.policy.ensureCanManageMembers(actorId);

    const member = this.cast.addMember(userId, contractId);

    const evt: TCastMembershipEventRecord = this.buildMembershipEvent({
      type: 'member_added',
      userId,
      date: member.joinedAt,
      by: actorId,
      actorId,
    });

    this.apply(new CastMemberAddedEvent(this.cast.id as TCastId, userId, contractId, member.joinedAt));
    return evt;
  }

  removeMember(
    actorId: TUserId,
    userId: TUserId,
    reason?: string,
  ): TCastMembershipEventRecord {
    this.policy.ensureActive(this.cast);
    this.policy.ensureCanManageMembers(actorId);

    const leftAt = new Date();
    this.cast.removeMember(userId, leftAt);

    const evt: TCastMembershipEventRecord = this.buildMembershipEvent({
      type: 'member_removed',
      userId,
      date: leftAt,
      by: actorId,
      actorId,
      reason,
    });

    this.apply(new CastMemberRemovedEvent(this.cast.id as TCastId, userId, leftAt));
    return evt;
  }

  archive(actorId: TUserId): void {
    this.policy.ensureCanManageMembers(actorId);
    this.cast.archive();
  }

  // ── Queries ────────────────────────────────────────

  getMembersAt(date: Date): TCastMember[] {
    return this.cast.getMembersAt(date);
  }

  getActiveMembers(): TCastMember[] {
    return this.cast.getActiveMembers();
  }

  // ── Snapshot / diff ────────────────────────────────

  get snapshot(): TCastDomainModel {
    return this.cast.toDomain;
  }

  getUpdateObject(): Record<string, unknown> {
    return this.cast.getDiffProps();
  }

  get id(): TCastId {
    return this.cast.id as TCastId;
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
      cast_id: this.cast.id,
      user_id: input.userId,
      type: input.type,
      date: input.date,
      by: input.by,
      ...(input.reason ? { reason: input.reason } : {}),
      ...meta,
    };
  }

  // ── Static factory ─────────────────────────────────

  static fromRecord(record: TCastDomainModel): CastAggregateRoot {
    return new CastAggregateRoot(record);
  }
}
