import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractId, TContractRecord, TContractRole, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { SignerSideResolver } from '../SignerSideResolver.js';
import { ContractSentEvent } from '../events/ContractSentEvent.js';
import { ContractActivatedEvent } from '../events/ContractActivatedEvent.js';

export class SignContractCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly actorId: TUserId,
    /** Roles the actor holds on this contract — used to determine company vs user side */
    public readonly actorRoles: TContractRole[],
    /** If true, the other party should be notified by email */
    public readonly notify: boolean,
  ) {}
}

@CommandHandler(SignContractCommand)
export class SignContractHandler implements ICommandHandler<SignContractCommand, TContractRecord> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    private readonly signerResolver: SignerSideResolver,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: SignContractCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(record);
    const signature = await this.signerResolver.build({
      contract: entity,
      actorId: cmd.actorId,
      actorRoles: cmd.actorRoles,
    });
    const signerRole = signature.signer_role;
    entity.addSignature(signature);

    if (entity.isFullySigned()) {
      entity.promoteToActive();
    }

    // TODO: if cmd.notify — send email to counterparty via MailerService

    const diff = entity.getDiffProps();
    const updated = await this.contractRepo.updateOne({
      filter: { id: cmd.contractId },
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } },
      options: { returnDocument: 'after' },
    });

    if (!updated)
      throw new BusinessError('Failed to record signature', {
        code: 'CONTRACT_SIGN_FAILED',
        status: 500,
      });

    // Publish events only after the persist succeeded — listeners
    // (notifications, analytics) must never observe a state the DB
    // does not also reflect.
    if (signerRole === 'company') {
      this.eventBus.publish(
        new ContractSentEvent(updated.id, updated.company_id, updated.user_id, cmd.actorId),
      );
    }

    if (signerRole === 'user' && updated.status === 'active') {
      const companySignerId = updated.signatures?.company?.signed_by;
      if (companySignerId) {
        this.eventBus.publish(
          new ContractActivatedEvent(updated.id, updated.company_id, companySignerId, cmd.actorId),
        );
      }
    }

    return updated;
  }
}
