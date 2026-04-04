import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TOrgNodeId, TOrgNodeRecord, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType, TOrgNodeCommunication } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export type TUpdateOrgNodeInfoDTO = {
  org_node_id: TOrgNodeId;
  name?: string;
  color?: string;
  type?: TTeamType;
  communications?: TOrgNodeCommunication[];
};

export class UpdateOrgNodeInfoCommand {
  constructor(
    public readonly dto: TUpdateOrgNodeInfoDTO,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(UpdateOrgNodeInfoCommand)
export class UpdateOrgNodeInfoHandler implements ICommandHandler<UpdateOrgNodeInfoCommand, TOrgNodeRecord> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: UpdateOrgNodeInfoCommand): Promise<TOrgNodeRecord> {
    const { dto, actorId } = cmd;

    const existing = await this.orgNodeRepo.findOne({ filter: { id: dto.org_node_id } });
    if (!existing) throw new BusinessError('Org node not found', 'ORGNODE_NOT_FOUND', 404);

    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, existing.company_id, 'company:orgchart:write');
    if (!canManage) throw new BusinessError('Forbidden', 'ORGNODE_FORBIDDEN', 403);

    const stripped = RecordMetadataUtils.stripDocMetadata(existing);
    console.log('[DEBUG UpdateOrgNode] stripped props:', JSON.stringify(stripped, null, 2));
    const entity = new OrgNodeEntity(stripped);

    // Apply only the fields that were provided
    if (dto.name !== undefined) entity.rename(dto.name);
    if (dto.color !== undefined) entity.setColor(dto.color);
    if (dto.type !== undefined) entity.setType(dto.type);
    if (dto.communications !== undefined) entity.setCommunications(dto.communications);

    // Save full entity state
    const updated = await this.orgNodeRepo.updateOne({
      filter: { id: dto.org_node_id },
      update: { $set: { ...entity.toDomain, ...RecordMetadataUtils.update() } } as any,
    });

    return updated!;
  }
}
