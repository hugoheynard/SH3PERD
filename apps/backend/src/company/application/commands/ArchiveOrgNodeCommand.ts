import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TOrgNodeId, TUserId } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export class ArchiveOrgNodeCommand {
  constructor(
    public readonly nodeId: TOrgNodeId,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Archives an org node (soft-delete).
 * The node stays in DB but is marked as archived.
 * Archived nodes cannot be modified.
 */
@CommandHandler(ArchiveOrgNodeCommand)
export class ArchiveOrgNodeHandler implements ICommandHandler<ArchiveOrgNodeCommand, void> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: ArchiveOrgNodeCommand): Promise<void> {
    const { nodeId, actorId } = cmd;

    const existing = await this.orgNodeRepo.findOne({ filter: { id: nodeId } });
    if (!existing) throw new BusinessError('Org node not found', 'ORGNODE_NOT_FOUND', 404);

    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, existing.company_id, 'company:orgchart:write');
    if (!canManage) throw new BusinessError('Forbidden', 'ORGNODE_FORBIDDEN', 403);

    // Check no children
    const children = await this.orgNodeRepo.findByParentId(nodeId, existing.company_id);
    if (children.length > 0) throw new BusinessError('Cannot archive node with children', 'ORGNODE_HAS_CHILDREN', 400);

    const entity = new OrgNodeEntity(RecordMetadataUtils.stripDocMetadata(existing));
    entity.archive();

    await this.orgNodeRepo.updateOne({
      filter: { id: nodeId },
      update: { $set: { ...entity.toDomain, ...RecordMetadataUtils.update() } } as any,
    });
  }
}
