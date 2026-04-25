import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type {
  TContractDocumentId,
  TContractId,
  TContractRecord,
  TContractRole,
  TUserId,
} from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { SignerSideResolver } from '../SignerSideResolver.js';

export class SignContractDocumentCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly documentId: TContractDocumentId,
    public readonly actorId: TUserId,
    /** Roles the actor holds on this contract — used to determine company vs user side */
    public readonly actorRoles: TContractRole[],
  ) {}
}

@CommandHandler(SignContractDocumentCommand)
export class SignContractDocumentHandler implements ICommandHandler<
  SignContractDocumentCommand,
  TContractRecord
> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    private readonly signerResolver: SignerSideResolver,
  ) {}

  async execute(cmd: SignContractDocumentCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(record);
    const signature = await this.signerResolver.build({
      contract: entity,
      actorId: cmd.actorId,
      actorRoles: cmd.actorRoles,
    });
    entity.signDocument(cmd.documentId, signature);

    const diff = entity.getDiffProps();
    const updated = await this.contractRepo.updateOne({
      filter: { id: cmd.contractId },
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } },
      options: { returnDocument: 'after' },
    });

    if (!updated)
      throw new BusinessError('Failed to record document signature', {
        code: 'CONTRACT_DOCUMENT_SIGN_FAILED',
        status: 500,
      });
    return updated;
  }
}
