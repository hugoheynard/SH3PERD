import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type {
  TContractDocumentId,
  TContractId,
  TContractRecord,
  TContractRole,
  TSignatureId,
  TUserId,
} from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

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
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async execute(cmd: SignContractDocumentCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(record);
    const signerRole = entity.resolveSignerRole(cmd.actorRoles);

    let signed_by_contract_id: string | undefined;
    if (signerRole === 'company') {
      const signerContract = await this.contractRepo.findOne({
        filter: { user_id: cmd.actorId, company_id: record.company_id },
      });
      signed_by_contract_id = signerContract?.id;
    }

    entity.signDocument(cmd.documentId, {
      signature_id: `signature_${crypto.randomUUID()}` as TSignatureId,
      signed_at: new Date(),
      signed_by: cmd.actorId,
      signer_role: signerRole,
      signed_by_roles: cmd.actorRoles,
      signed_by_contract_id: signed_by_contract_id as TContractId | undefined,
    });

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
