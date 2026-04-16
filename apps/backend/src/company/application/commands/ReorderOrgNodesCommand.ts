import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId } from '@sh3pherd/shared-types';
import type { TOrgNodeRecord } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import type { Filter, UpdateFilter } from 'mongodb';

export class ReorderOrgNodesCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly parentId: TOrgNodeId | undefined,
    public readonly orderedIds: TOrgNodeId[],
  ) {}
}

/**
 * Reorders org nodes within the same parent.
 *
 * Receives the full ordered list of sibling IDs after a drag & drop.
 * Validates that the IDs match the actual siblings, then assigns
 * `position = index` for each node.
 *
 * Permission check handled by @RequirePermission(P.Company.OrgChart.Write) on controller.
 */
@CommandHandler(ReorderOrgNodesCommand)
export class ReorderOrgNodesHandler implements ICommandHandler<ReorderOrgNodesCommand, void> {
  constructor(@Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository) {}

  async execute(cmd: ReorderOrgNodesCommand): Promise<void> {
    const { companyId, parentId, orderedIds } = cmd;

    // Load all active siblings for this parent.
    // Root nodes may have `parent_id` absent OR explicitly stored as `null`
    // in legacy documents — match both defensively.
    const parentFilter: Filter<TOrgNodeRecord> = parentId
      ? { parent_id: parentId }
      : ({
          $or: [{ parent_id: { $exists: false } }, { parent_id: null }],
        } as Filter<TOrgNodeRecord>);
    const filter: Filter<TOrgNodeRecord> = {
      company_id: companyId,
      ...parentFilter,
      status: 'active',
    };
    const allNodes = await this.orgNodeRepo.findMany({
      filter,
    });

    const siblings = allNodes ?? [];

    // Validate: orderedIds must contain exactly the same IDs as siblings
    const siblingIds = new Set(siblings.map((n) => n.id));
    const orderedSet = new Set(orderedIds);

    if (siblingIds.size !== orderedSet.size || ![...siblingIds].every((id) => orderedSet.has(id))) {
      throw new BusinessError('Ordered IDs do not match siblings', {
        code: 'REORDER_IDS_MISMATCH',
        status: 400,
      });
    }

    // Batch update positions
    const updates = orderedIds.map((id, index) => {
      const update: UpdateFilter<TOrgNodeRecord> = {
        $set: { position: index, ...RecordMetadataUtils.update() },
      };
      return this.orgNodeRepo.updateOne({
        filter: { id },
        update,
      });
    });

    await Promise.all(updates);
  }
}
