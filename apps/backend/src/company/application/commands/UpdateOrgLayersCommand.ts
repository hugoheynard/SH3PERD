import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgLayers, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { CompanyPolicy } from '../../domain/CompanyPolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export class UpdateOrgLayersCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly orgLayers: string[],
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Updates the company's org layer labels (e.g. ["Direction", "Pole", "Equipe"]).
 *
 * Flow:
 * 1. Verify the actor has `company:settings:write` permission.
 * 2. Load the company record from the repository.
 * 3. Reconstitute the entity and apply the mutation (entity validates non-empty, no blank labels).
 * 4. Persist the full entity state.
 * 5. Return the updated TOrgLayers projection.
 *
 * @throws BusinessError COMPANY_NOT_FOUND (404) — company does not exist.
 * @throws BusinessError COMPANY_FORBIDDEN (403) — actor lacks permission (via policy).
 * @throws Error COMPANY_ORG_LAYERS_EMPTY — array is empty (via entity).
 * @throws Error COMPANY_ORG_LAYER_BLANK — a label is blank after trimming (via entity).
 * @throws TechnicalError COMPANY_UPDATE_FAILED (500) — repository write failed.
 */
@CommandHandler(UpdateOrgLayersCommand)
export class UpdateOrgLayersHandler implements ICommandHandler<UpdateOrgLayersCommand, TOrgLayers> {
  private readonly policy = new CompanyPolicy();

  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: UpdateOrgLayersCommand): Promise<TOrgLayers> {
    await this.policy.ensureCanManageSettings(cmd.actorId, cmd.companyId, this.permissionResolver);

    const record = await this.companyRepo.findOne({ filter: { id: cmd.companyId } });
    if (!record) {
      throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);
    }

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.updateOrgLayers(cmd.orgLayers);

    const updated = await this.companyRepo.updateOne({
      filter: { id: cmd.companyId },
      update: { $set: { ...entity.toDomain, ...RecordMetadataUtils.update() } } as any,
    });

    if (!updated) {
      throw new TechnicalError('Failed to update company', 'COMPANY_UPDATE_FAILED', 500);
    }

    return entity.orgLayersInfo;
  }
}
