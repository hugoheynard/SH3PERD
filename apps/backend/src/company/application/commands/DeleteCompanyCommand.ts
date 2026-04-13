import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class DeleteCompanyCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly actorId: TUserId,
  ) {}
}

/** Return type for the delete command. */
export type TDeleteCompanyResult = { id: TCompanyId };

/**
 * Deletes a company.
 *
 * Permission check is handled by @RequirePermission(P.Company.Settings.Delete) on the controller.
 * The handler still validates ownership as a domain-level safeguard.
 *
 * @throws BusinessError COMPANY_NOT_FOUND (404)
 * @throws BusinessError COMPANY_NOT_OWNED (403) — actor is not the owner
 */
@CommandHandler(DeleteCompanyCommand)
export class DeleteCompanyHandler implements ICommandHandler<
  DeleteCompanyCommand,
  TDeleteCompanyResult
> {
  constructor(@Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository) {}

  async execute(cmd: DeleteCompanyCommand): Promise<TDeleteCompanyResult> {
    const { companyId, actorId } = cmd;

    const record = await this.companyRepo.findOne({ filter: { id: companyId } });
    if (!record) {
      throw new BusinessError('Company not found', { code: 'COMPANY_NOT_FOUND', status: 404 });
    }
    if (record.owner_id !== actorId) {
      throw new BusinessError('Only the owner can delete', {
        code: 'COMPANY_NOT_OWNED',
        status: 403,
      });
    }

    await this.companyRepo.deleteOne({ id: companyId });

    return { id: companyId };
  }
}
