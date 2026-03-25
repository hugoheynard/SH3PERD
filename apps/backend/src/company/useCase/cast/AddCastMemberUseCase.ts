import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import type { TCastId, TCastMembershipEventRecord, TContractId, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO, CAST_MEMBERSHIP_EVENT_REPO } from '../../company.tokens.js';
import type { ICastRepository } from '../../repositories/CastMongoRepository.js';
import type { ICastMembershipEventRepository } from '../../repositories/CastMembershipEventMongoRepository.js';
import { CastAggregateRoot } from '../../domain/CastAggregateRoot.js';

export type TAddCastMemberDTO = {
  cast_id: TCastId;
  user_id: TUserId;
  contract_id: TContractId;
};

@Injectable()
export class AddCastMemberUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly castRepo: ICastRepository,
    @Inject(CAST_MEMBERSHIP_EVENT_REPO) private readonly eventRepo: ICastMembershipEventRepository,
  ) {}

  async execute(dto: TAddCastMemberDTO, actorId: TUserId): Promise<TCastMembershipEventRecord> {
    const record = await this.castRepo.findById(dto.cast_id);
    if (!record) {
      throw new DomainError('Cast not found', { code: 'CAST_NOT_FOUND', context: { castId: dto.cast_id } });
    }

    const ar = CastAggregateRoot.fromRecord(record);
    const membershipEvent = ar.addMember(actorId, dto.user_id, dto.contract_id);

    // Persist updated cast (members array) and the membership event atomically
    const [castSaved, eventSaved] = await Promise.all([
      this.castRepo.updateOne({
        filter: { id: dto.cast_id },
        update: { $set: { ...ar.getUpdateObject(), ...RecordMetadataUtils.update() } },
      }),
      this.eventRepo.save(membershipEvent),
    ]);

    if (!castSaved || !eventSaved) {
      throw new TechnicalError('Failed to add cast member', 'CAST_ADD_MEMBER_FAILED', 500);
    }

    ar.commit();
    return membershipEvent;
  }
}
