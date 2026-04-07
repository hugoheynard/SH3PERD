import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId, TOrgNodeDomainModel, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType } from '@sh3pherd/shared-types';
import { COMPANY_AGGREGATE_REPO } from '../../company.tokens.js';
import type { ICompanyAggregateRepository } from '../../repositories/CompanyAggregateRepository.js';

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
 *
 * Permission check is handled by `@RequirePermission(P.Company.OrgChart.Write)`
 * on the controller — no need to check here.
 *
 * Loads the CompanyAggregate which validates:
 * - Company exists and is active
 * - Parent belongs to same company and is active (if specified)
 * - Max depth not exceeded (based on orgLayers)
 * - Name unique among siblings
 *
 * Returns the created node as a domain model (no metadata).
 */
@CommandHandler(CreateOrgNodeCommand)
export class CreateOrgNodeHandler implements ICommandHandler<CreateOrgNodeCommand, TOrgNodeDomainModel> {
  constructor(
    @Inject(COMPANY_AGGREGATE_REPO) private readonly aggregateRepo: ICompanyAggregateRepository,
  ) {}

  async execute(cmd: CreateOrgNodeCommand): Promise<TOrgNodeDomainModel> {
    const { dto, actorId } = cmd;

    const aggregate = await this.aggregateRepo.loadByCompanyId(dto.company_id);
    const node = aggregate.addOrgNode(dto);

    await this.aggregateRepo.save(aggregate, actorId);

    return node.toDomain;
  }
}
