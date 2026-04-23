import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type {
  TAddendumId,
  TContractAddendumRecord,
  TContractId,
  TContractRole,
  TSignatureId,
  TUserId,
} from '@sh3pherd/shared-types';
import { CONTRACT_COMPANY_ROLES } from '@sh3pherd/shared-types';
import { ADDENDUM_REPO, CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import type { IAddendumRepository } from '../../repositories/AddendumMongoRepository.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class SignAddendumCommand {
  constructor(
    public readonly addendumId: TAddendumId,
    public readonly actorId: TUserId,
    public readonly actorRoles: TContractRole[],
  ) {}
}

@CommandHandler(SignAddendumCommand)
export class SignAddendumHandler implements ICommandHandler<
  SignAddendumCommand,
  TContractAddendumRecord
> {
  constructor(
    @Inject(ADDENDUM_REPO) private readonly addendumRepo: IAddendumRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(cmd: SignAddendumCommand): Promise<TContractAddendumRecord> {
    const addendum = await this.addendumRepo.findById(cmd.addendumId);
    if (!addendum)
      throw new BusinessError('Addendum not found', { code: 'ADDENDUM_NOT_FOUND', status: 404 });

    if (addendum.status !== 'draft')
      throw new BusinessError('Addendum is not in draft state', {
        code: 'ADDENDUM_NOT_DRAFT',
        status: 409,
      });

    const signerRole = cmd.actorRoles.some((r) => CONTRACT_COMPANY_ROLES.includes(r))
      ? 'company'
      : 'user';

    if (addendum.signatures?.[signerRole]) {
      throw new BusinessError(`Addendum already signed by ${signerRole}`, {
        code: 'ADDENDUM_ALREADY_SIGNED',
        status: 409,
      });
    }

    let signed_by_contract_id: TContractId | undefined;
    if (signerRole === 'company') {
      const contract = await this.contractRepo.findOne({
        filter: { id: addendum.contract_id },
      });
      if (contract) {
        const signerContract = await this.contractRepo.findOne({
          filter: { user_id: cmd.actorId, company_id: contract.company_id },
        });
        signed_by_contract_id = signerContract?.id;
      }
    }

    const sig = {
      signature_id: `signature_${crypto.randomUUID()}` as TSignatureId,
      signed_at: new Date(),
      signed_by: cmd.actorId,
      signer_role: signerRole,
      signed_by_roles: cmd.actorRoles,
      signed_by_contract_id,
    };

    const newSignatures = { ...addendum.signatures, [signerRole]: sig };
    const isFullySigned = !!newSignatures.user && !!newSignatures.company;

    const updated = await this.addendumRepo.patch({
      filter: { id: cmd.addendumId },
      update: {
        $set: {
          [`signatures.${signerRole}`]: sig,
          ...(isFullySigned ? { status: 'applied' } : {}),
          ...RecordMetadataUtils.update(),
        },
      },
    });

    if (!updated)
      throw new BusinessError('Failed to sign addendum', {
        code: 'ADDENDUM_SIGN_FAILED',
        status: 500,
      });

    // Apply changes to the contract once fully signed
    if (isFullySigned) {
      await this.applyChangesToContract(addendum);
    }

    return updated;
  }

  private async applyChangesToContract(addendum: TContractAddendumRecord): Promise<void> {
    const { changes } = addendum;
    const $set: Record<string, unknown> = { ...RecordMetadataUtils.update() };

    if (changes.template === 'change_remuneration') {
      $set['compensation'] = changes.compensation;
    } else if (changes.template === 'extend_period') {
      $set['endDate'] = changes.endDate;
    } else if (changes.template === 'extend_trial') {
      $set['trial_period_days'] = changes.trial_period_days;
    }

    await this.contractRepo.updateOne({
      filter: { id: addendum.contract_id },
      update: { $set },
      options: { returnDocument: 'after' },
    });
  }
}
