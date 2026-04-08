import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { TOrgNodeId, TContractId, TUserId, TOrgMembershipEventRecord } from '@sh3pherd/shared-types';
import type { TTeamRole } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO, ORG_MEMBERSHIP_EVENT_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import type { IOrgMembershipEventRepository } from '../../repositories/OrgMembershipEventMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { OrgNodePolicy } from '../../domain/OrgNodePolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export type TAddOrgNodeMemberDTO = {
  org_node_id: TOrgNodeId;
  user_id: TUserId;
  contract_id: TContractId;
  team_role?: TTeamRole;
};

export class AddOrgNodeMemberCommand {
  constructor(
    public readonly dto: TAddOrgNodeMemberDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Adds a member to an org node. Creates an audit event.
 * Pattern: repo.findOne -> OrgNodeEntity -> policy check -> entity.addMember -> repo.updateOne
 */
@CommandHandler(AddOrgNodeMemberCommand)
export class AddOrgNodeMemberHandler implements ICommandHandler<AddOrgNodeMemberCommand, TOrgMembershipEventRecord> {
  private readonly policy = new OrgNodePolicy();

  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    @Inject(ORG_MEMBERSHIP_EVENT_REPO) private readonly eventRepo: IOrgMembershipEventRepository,
  ) {}

  async execute(cmd: AddOrgNodeMemberCommand): Promise<TOrgMembershipEventRecord> {
    const { dto, actorId } = cmd;

    const record = await this.orgNodeRepo.findOne({ filter: { id: dto.org_node_id } });
    if (!record) throw new BusinessError('Org node not found', { code: 'ORGNODE_NOT_FOUND', status: 404 });

    const entity = new OrgNodeEntity(record);
    this.policy.ensureActive(entity);
    this.policy.ensureCanManageMembers(actorId);

    const member = entity.addMember(dto.user_id, dto.contract_id, dto.team_role ?? 'member');

    const membershipEvent: TOrgMembershipEventRecord = {
      id: `orgevt_${randomUUID()}`,
      org_node_id: entity.id,
      user_id: dto.user_id,
      type: 'member_added',
      date: member.joinedAt,
      by: actorId,
      ...RecordMetadataUtils.create(actorId),
    };

    const [nodeSaved, eventSaved] = await Promise.all([
      this.orgNodeRepo.updateOne({
        filter: { id: dto.org_node_id },
        update: {
          $push: { members: member } as any,
          $set: { ...RecordMetadataUtils.update() },
        },
      }),
      this.eventRepo.save(membershipEvent),
    ]);

    if (!nodeSaved || !eventSaved) {
      throw new TechnicalError('Failed to add member', { code: 'ORGNODE_ADD_MEMBER_FAILED' });
    }

    return membershipEvent;
  }
}
