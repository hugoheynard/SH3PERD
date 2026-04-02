import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export class DeleteCompanyCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Deletes a company. Only the owner can delete.
 */
@CommandHandler(DeleteCompanyCommand)
export class DeleteCompanyHandler implements ICommandHandler<DeleteCompanyCommand, void> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(cmd: DeleteCompanyCommand): Promise<void> {
    const { companyId, actorId } = cmd;

    const company = await this.companyRepo.findOne({ filter: { id: companyId } });
    if (!company) throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);
    if (company.owner_id !== actorId) throw new BusinessError('Only the owner can delete', 'COMPANY_DELETE_FORBIDDEN', 403);

    await this.companyRepo.deleteOne({ id: companyId } as any);
  }
}
