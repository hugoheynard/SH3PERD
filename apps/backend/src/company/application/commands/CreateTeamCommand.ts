import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId, TOrgNodeRecord, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export type TCreateOrgNodeDTO = {
  company_id: TCompanyId;
  name: string;
  parent_id?: TOrgNodeId;
  type?: TTeamType;
  color?: string;
};

export class CreateOrgNodeCommand {
  constructor(
    public readonly dto: TCreateOrgNodeDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Creates an org node within a company.
 * If `parent_id` is set, validates the parent exists.
 * Root nodes (no parent_id) typically carry a `type`.
 */
@CommandHandler(CreateOrgNodeCommand)
export class CreateOrgNodeHandler implements ICommandHandler<CreateOrgNodeCommand, TOrgNodeRecord> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: CreateOrgNodeCommand): Promise<TOrgNodeRecord> {
    const { dto, actorId } = cmd;

    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, dto.company_id, 'company:orgchart:write');
    if (!canManage) throw new BusinessError('Forbidden', 'ORGNODE_FORBIDDEN', 403);

    // Validate parent exists if specified
    if (dto.parent_id) {
      const parent = await this.orgNodeRepo.findOne({ filter: { id: dto.parent_id } });
      if (!parent) throw new BusinessError('Parent node not found', 'ORGNODE_PARENT_NOT_FOUND', 404);
    }

    const entity = new OrgNodeEntity({
      company_id: dto.company_id,
      name: dto.name,
      parent_id: dto.parent_id,
      type: dto.type,
      color: dto.color,
      communications: [],
      members: [],
      guest_members: [],
      status: 'active',
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const record: TOrgNodeRecord = { ...entity.toDomain, ...metadata };

    const saved = await this.orgNodeRepo.save(record);
    if (!saved) throw new TechnicalError('Failed to create org node', 'ORGNODE_CREATE_FAILED', 500);

    return record;
  }
}
