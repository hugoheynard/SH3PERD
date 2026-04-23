import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IStorageService } from '@sh3pherd/storage';
import type { TContractId, TContractDocumentId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO, CONTRACT_STORAGE_SERVICE } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class GetContractDocumentDownloadUrlQuery {
  constructor(
    public readonly contractId: TContractId,
    public readonly documentId: TContractDocumentId,
  ) {}
}

@QueryHandler(GetContractDocumentDownloadUrlQuery)
export class GetContractDocumentDownloadUrlHandler implements IQueryHandler<
  GetContractDocumentDownloadUrlQuery,
  { url: string }
> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    @Inject(CONTRACT_STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute(query: GetContractDocumentDownloadUrlQuery): Promise<{ url: string }> {
    const contract = await this.contractRepo.findOne({ filter: { id: query.contractId } });
    if (!contract) {
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });
    }

    const doc = contract.documents?.find((d) => d.id === query.documentId);
    if (!doc) {
      throw new BusinessError('Document not found', {
        code: 'CONTRACT_DOCUMENT_NOT_FOUND',
        status: 404,
      });
    }

    const url = await this.storage.getSignedDownloadUrl(doc.s3Key, 3600);
    return { url };
  }
}
