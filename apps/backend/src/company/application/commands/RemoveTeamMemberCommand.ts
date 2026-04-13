import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { TOrgNodeId, TUserId, TOrgMembershipEventRecord } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO, ORG_MEMBERSHIP_EVENT_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import type { IOrgMembershipEventRepository } from '../../repositories/OrgMembershipEventMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { OrgNodePolicy } from '../../domain/OrgNodePolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export type TRemoveOrgNodeMemberDTO = {
  org_node_id: TOrgNodeId;
  user_id: TUserId;
  reason?: string;
};

export class RemoveOrgNodeMemberCommand {
  constructor(
    public readonly dto: TRemoveOrgNodeMemberDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Removes a member from an org node. Creates an audit event.
 */
@CommandHandler(RemoveOrgNodeMemberCommand)
export class RemoveOrgNodeMemberHandler implements ICommandHandler<
  RemoveOrgNodeMemberCommand,
  TOrgMembershipEventRecord
> {
  private readonly policy = new OrgNodePolicy();

  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    @Inject(ORG_MEMBERSHIP_EVENT_REPO) private readonly eventRepo: IOrgMembershipEventRepository,
  ) {}

  async execute(cmd: RemoveOrgNodeMemberCommand): Promise<TOrgMembershipEventRecord> {
    const { dto, actorId } = cmd;

    const record = await this.orgNodeRepo.findOne({ filter: { id: dto.org_node_id } });
    if (!record)
      throw new BusinessError('Org node not found', { code: 'ORGNODE_NOT_FOUND', status: 404 });

    const entity = new OrgNodeEntity(record);
    this.policy.ensureActive(entity);
    this.policy.ensureCanManageMembers(actorId);

    const leftAt = new Date();
    entity.removeMember(dto.user_id, leftAt);

    const membershipEvent: TOrgMembershipEventRecord = {
      id: `orgevt_${randomUUID()}`,
      org_node_id: entity.id,
      user_id: dto.user_id,
      type: 'member_removed',
      date: leftAt,
      by: actorId,
      ...(dto.reason ? { reason: dto.reason } : {}),
      ...RecordMetadataUtils.create(actorId),
    };

    const [nodeSaved, eventSaved] = await Promise.all([
      this.orgNodeRepo.updateOne({
        filter: { id: dto.org_node_id },
        update: { $set: { ...entity.getDiffProps(), ...RecordMetadataUtils.update() } },
      }),
      this.eventRepo.save(membershipEvent),
    ]);

    if (!nodeSaved || !eventSaved) {
      throw new TechnicalError('Failed to remove member', { code: 'ORGNODE_REMOVE_MEMBER_FAILED' });
    }

    return membershipEvent;
  }
}
