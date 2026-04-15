import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { TOrgNodeId, TOrgNodeGuestMember, TUserId } from '@sh3pherd/shared-types';
import type { TTeamRole } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import type { TOrgNodeRecord } from '@sh3pherd/shared-types';
import type { UpdateFilter } from 'mongodb';

// ── Add Guest Member ─────────────────────────────────────

export type TAddGuestMemberDTO = {
  org_node_id: TOrgNodeId;
  display_name: string;
  title?: string;
  team_role: TTeamRole;
};

export class AddGuestMemberCommand {
  constructor(
    public readonly dto: TAddGuestMemberDTO,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(AddGuestMemberCommand)
export class AddGuestMemberHandler implements ICommandHandler<
  AddGuestMemberCommand,
  TOrgNodeGuestMember
> {
  constructor(@Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository) {}

  async execute(cmd: AddGuestMemberCommand): Promise<TOrgNodeGuestMember> {
    const { dto } = cmd;

    const record = await this.orgNodeRepo.findOne({ filter: { id: dto.org_node_id } });
    if (!record)
      throw new BusinessError('Org node not found', { code: 'ORGNODE_NOT_FOUND', status: 404 });

    const guest: TOrgNodeGuestMember = {
      id: `guest_${randomUUID()}`,
      display_name: dto.display_name,
      title: dto.title,
      team_role: dto.team_role,
    };

    const update: UpdateFilter<TOrgNodeRecord> = {
      $push: { guest_members: guest },
      $set: { ...RecordMetadataUtils.update() },
    };

    const saved = await this.orgNodeRepo.updateOne({
      filter: { id: dto.org_node_id },
      update,
    });

    if (!saved)
      throw new TechnicalError('Failed to add guest member', { code: 'ORGNODE_ADD_GUEST_FAILED' });
    return guest;
  }
}

// ── Remove Guest Member ──────────────────────────────────

export type TRemoveGuestMemberDTO = {
  org_node_id: TOrgNodeId;
  guest_id: string;
};

export class RemoveGuestMemberCommand {
  constructor(
    public readonly dto: TRemoveGuestMemberDTO,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(RemoveGuestMemberCommand)
export class RemoveGuestMemberHandler implements ICommandHandler<
  RemoveGuestMemberCommand,
  boolean
> {
  constructor(@Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository) {}

  async execute(cmd: RemoveGuestMemberCommand): Promise<boolean> {
    const { dto } = cmd;

    const update: UpdateFilter<TOrgNodeRecord> = {
      $pull: { guest_members: { id: dto.guest_id } },
      $set: { ...RecordMetadataUtils.update() },
    };

    const saved = await this.orgNodeRepo.updateOne({
      filter: { id: dto.org_node_id },
      update,
    });

    if (!saved)
      throw new TechnicalError('Failed to remove guest member', {
        code: 'ORGNODE_REMOVE_GUEST_FAILED',
      });
    return true;
  }
}
