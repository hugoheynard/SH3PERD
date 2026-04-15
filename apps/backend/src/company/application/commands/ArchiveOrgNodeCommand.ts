import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TOrgNodeId, TUserId } from '@sh3pherd/shared-types';
import type { TOrgNodeRecord } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import type { UpdateFilter } from 'mongodb';

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
  constructor(@Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository) {}

  async execute(cmd: ArchiveOrgNodeCommand): Promise<void> {
    const { nodeId } = cmd;

    const existing = await this.orgNodeRepo.findOne({ filter: { id: nodeId } });
    if (!existing)
      throw new BusinessError('Org node not found', { code: 'ORGNODE_NOT_FOUND', status: 404 });

    // Idempotent: archiving an already-archived node is a no-op (avoid 400 in UI race conditions)
    if (existing.status === 'archived') return;

    // Block only on ACTIVE children — archived children are ignored
    const children = await this.orgNodeRepo.findByParentId(nodeId, existing.company_id);
    const activeChildren = children.filter((c) => c.status === 'active');
    if (activeChildren.length > 0) {
      throw new BusinessError('Cannot archive node with children', {
        code: 'ORGNODE_HAS_CHILDREN',
        status: 400,
      });
    }

    const entity = new OrgNodeEntity(RecordMetadataUtils.stripDocMetadata(existing));
    entity.archive();

    const update: UpdateFilter<TOrgNodeRecord> = {
      $set: { ...entity.toDomain, ...RecordMetadataUtils.update() },
    };

    await this.orgNodeRepo.updateOne({
      filter: { id: nodeId },
      update,
    });
  }
}
