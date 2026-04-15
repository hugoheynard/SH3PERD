import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_AGGREGATE_REPO } from '../../company.tokens.js';
import type { ICompanyAggregateRepository } from '../../repositories/CompanyAggregateRepository.js';

export class UngroupOrgNodeCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly nodeId: TOrgNodeId,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Ungroups a node: moves all children up to the node's parent, then archives the node.
 * The inverse of GroupOrgNodesCommand.
 *
 * Permission check handled by @RequirePermission(P.Company.OrgChart.Write) on controller.
 */
@CommandHandler(UngroupOrgNodeCommand)
export class UngroupOrgNodeHandler implements ICommandHandler<UngroupOrgNodeCommand, void> {
  constructor(
    @Inject(COMPANY_AGGREGATE_REPO) private readonly aggregateRepo: ICompanyAggregateRepository,
  ) {}

  async execute(cmd: UngroupOrgNodeCommand): Promise<void> {
    const aggregate = await this.aggregateRepo.loadByCompanyId(cmd.companyId);
    aggregate.ungroupNode(cmd.nodeId);
    await this.aggregateRepo.save(aggregate, cmd.actorId);
  }
}
