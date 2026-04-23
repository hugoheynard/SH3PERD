import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IStorageService } from '@sh3pherd/storage';
import type {
  TContractId,
  TUserId,
  TContractDocument,
  TContractDocumentId,
} from '@sh3pherd/shared-types';
import { CONTRACT_REPO, CONTRACT_STORAGE_SERVICE } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class UploadContractDocumentCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly actorId: TUserId,
    public readonly file: Buffer,
    public readonly fileName: string,
    public readonly mimeType: string,
  ) {}
}

function buildContractDocumentS3Key(
  contractId: TContractId,
  documentId: TContractDocumentId,
  fileName: string,
): string {
  return `contracts/${contractId}/documents/${documentId}/${fileName}`;
}

@CommandHandler(UploadContractDocumentCommand)
export class UploadContractDocumentHandler implements ICommandHandler<
  UploadContractDocumentCommand,
  TContractDocument
> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    @Inject(CONTRACT_STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute(cmd: UploadContractDocumentCommand): Promise<TContractDocument> {
    const contract = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!contract) {
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });
    }

    const documentId = `contractDoc_${crypto.randomUUID()}` as TContractDocumentId;
    const s3Key = buildContractDocumentS3Key(cmd.contractId, documentId, cmd.fileName);

    await this.storage.upload(s3Key, cmd.file, cmd.mimeType);

    const document: TContractDocument = {
      id: documentId,
      fileName: cmd.fileName,
      mimeType: cmd.mimeType,
      sizeBytes: cmd.file.length,
      s3Key,
      uploadedAt: new Date(),
      uploadedBy: cmd.actorId,
    };

    const updated = await this.contractRepo.updateOne({
      filter: { id: cmd.contractId },
      update: { $push: { documents: document } } as never,
      options: { returnDocument: 'after' },
    });

    if (!updated) {
      await this.storage.delete(s3Key).catch(() => {});
      throw new BusinessError('Failed to save document metadata', {
        code: 'CONTRACT_DOCUMENT_SAVE_FAILED',
        status: 500,
      });
    }

    return document;
  }
}
