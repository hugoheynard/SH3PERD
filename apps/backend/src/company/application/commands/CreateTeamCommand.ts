import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeId, TOrgNodeRecord, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType } from '@sh3pherd/shared-types';
import { COMPANY_AGGREGATE_REPO } from '../../company.tokens.js';
import type { ICompanyAggregateRepository } from '../../repositories/CompanyAggregateRepository.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

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
 * Loads the CompanyAggregate which validates:
 * - Company exists and is active
 * - Parent belongs to same company and is active (if specified)
 * - Max depth not exceeded (based on orgLayers)
 * - Name unique among siblings
 */
@CommandHandler(CreateOrgNodeCommand)
export class CreateOrgNodeHandler implements ICommandHandler<CreateOrgNodeCommand, TOrgNodeRecord> {
  constructor(
    @Inject(COMPANY_AGGREGATE_REPO) private readonly aggregateRepo: ICompanyAggregateRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: CreateOrgNodeCommand): Promise<TOrgNodeRecord> {
    const { dto, actorId } = cmd;

    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, dto.company_id, 'company:orgchart:write');
    if (!canManage) throw new BusinessError('Forbidden', 'ORGNODE_FORBIDDEN', 403);

    const aggregate = await this.aggregateRepo.loadByCompanyId(dto.company_id);
    const node = aggregate.addOrgNode(dto);

    await this.aggregateRepo.save(aggregate, actorId);

    const metadata = RecordMetadataUtils.create(actorId);
    return { ...node.toDomain, ...metadata };
  }
}
