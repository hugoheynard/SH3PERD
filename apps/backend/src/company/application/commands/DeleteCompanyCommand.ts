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

    const record = await this.companyRepo.findOne({ filter: { id: companyId } });
    if (!record) throw new BusinessError('Company not found', { code: 'COMPANY_NOT_FOUND', status: 404 });
    if (record.owner_id !== actorId) throw new BusinessError('Only the owner can delete', { code: 'COMPANY_NOT_OWNED', status: 403 });

    await this.companyRepo.deleteOne({ id: companyId } as any);
  }
}
