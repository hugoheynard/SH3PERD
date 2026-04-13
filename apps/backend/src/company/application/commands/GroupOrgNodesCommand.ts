import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId, TOrgNodeDomainModel } from '@sh3pherd/shared-types';
import { COMPANY_AGGREGATE_REPO } from '../../company.tokens.js';
import type { ICompanyAggregateRepository } from '../../repositories/CompanyAggregateRepository.js';

export class GroupOrgNodesCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly parentName: string,
    public readonly nodeIds: TOrgNodeId[],
  ) {}
}

/**
 * Groups selected sibling nodes under a new parent node.
 *
 * Creates a new node at the same level as the selected nodes,
 * then re-parents all selected nodes under it.
 *
 * Permission check handled by @RequirePermission(P.Company.OrgChart.Write) on controller.
 */
@CommandHandler(GroupOrgNodesCommand)
export class GroupOrgNodesHandler implements ICommandHandler<
  GroupOrgNodesCommand,
  TOrgNodeDomainModel
> {
  constructor(
    @Inject(COMPANY_AGGREGATE_REPO) private readonly aggregateRepo: ICompanyAggregateRepository,
  ) {}

  async execute(cmd: GroupOrgNodesCommand): Promise<TOrgNodeDomainModel> {
    const aggregate = await this.aggregateRepo.loadByCompanyId(cmd.companyId);
    const newParent = aggregate.groupNodes(cmd.parentName, cmd.nodeIds);

    await this.aggregateRepo.save(aggregate, undefined as any);

    return newParent.toDomain;
  }
}
