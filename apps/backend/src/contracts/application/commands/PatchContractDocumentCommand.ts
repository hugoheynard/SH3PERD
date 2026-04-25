import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractDocumentId, TContractId, TContractRecord } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { ContractPolicy } from '../../domain/ContractPolicy.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export class PatchContractDocumentCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly documentId: TContractDocumentId,
    public readonly patch: { requiresSignature?: boolean },
  ) {}
}

@CommandHandler(PatchContractDocumentCommand)
export class PatchContractDocumentHandler implements ICommandHandler<
  PatchContractDocumentCommand,
  TContractRecord
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async execute(cmd: PatchContractDocumentCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });
    ContractPolicy.ensureEditable(new ContractEntity(record));

    const $set: Record<string, unknown> = { ...RecordMetadataUtils.update() };

    if (cmd.patch.requiresSignature !== undefined) {
      $set['documents.$[doc].requiresSignature'] = cmd.patch.requiresSignature;
    }

    const updated = await this.contractRepo.updateOne({
      filter: { id: cmd.contractId },
      update: { $set } as never,
      options: {
        returnDocument: 'after',
        arrayFilters: [{ 'doc.id': cmd.documentId }],
      } as never,
    });

    if (!updated)
      throw new BusinessError('Document not found or update failed', {
        code: 'CONTRACT_DOCUMENT_PATCH_FAILED',
        status: 404,
      });
    return updated;
  }
}
