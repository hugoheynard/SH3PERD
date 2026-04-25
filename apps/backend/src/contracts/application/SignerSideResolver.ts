import { Inject, Injectable } from '@nestjs/common';
import type {
  TContractId,
  TContractRole,
  TContractSignature,
  TSignatureId,
  TUserId,
} from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../domain/ContractEntity.js';

/**
 * Builds a `TContractSignature` from an actor + a contract.
 *
 * Both `SignContractCommand` and `SignContractDocumentCommand` need
 * the exact same machinery: resolve the signer side from the actor's
 * roles on the contract, look up the actor's own contract in the
 * company when signing on the company side (so `signed_by_contract_id`
 * captures *which* admin acted), and stamp a fresh signature id.
 *
 * Keeping this in one place ensures the sign flow stays identical
 * across whatever signable thing we add next (addendum signature
 * already has its own analogous logic; consolidating it is a
 * follow-up).
 */
@Injectable()
export class SignerSideResolver {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async build(input: {
    contract: ContractEntity;
    actorId: TUserId;
    actorRoles: TContractRole[];
  }): Promise<TContractSignature> {
    const signerRole = input.contract.resolveSignerRole(input.actorRoles);

    let signed_by_contract_id: TContractId | undefined;
    if (signerRole === 'company') {
      const ownContract = await this.contractRepo.findOne({
        filter: {
          user_id: input.actorId,
          company_id: input.contract.toDomain.company_id,
        },
      });
      signed_by_contract_id = ownContract?.id;
    }

    return {
      signature_id: `signature_${crypto.randomUUID()}` as TSignatureId,
      signed_at: new Date(),
      signed_by: input.actorId,
      signer_role: signerRole,
      signed_by_roles: input.actorRoles,
      signed_by_contract_id,
    };
  }
}
