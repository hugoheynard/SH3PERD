import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import type { TCastId, TCastMembershipEventRecord, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO, CAST_MEMBERSHIP_EVENT_REPO } from '../../company.tokens.js';
import type { ICastRepository } from '../../repositories/CastMongoRepository.js';
import type { ICastMembershipEventRepository } from '../../repositories/CastMembershipEventMongoRepository.js';
import { CastAggregateRoot } from '../../domain/CastAggregateRoot.js';

export type TRemoveCastMemberDTO = {
  cast_id: TCastId;
  user_id: TUserId;
  reason?: string;
};

@Injectable()
export class RemoveCastMemberUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly castRepo: ICastRepository,
    @Inject(CAST_MEMBERSHIP_EVENT_REPO) private readonly eventRepo: ICastMembershipEventRepository,
  ) {}

  async execute(dto: TRemoveCastMemberDTO, actorId: TUserId): Promise<TCastMembershipEventRecord> {
    const record = await this.castRepo.findById(dto.cast_id);
    if (!record) {
      throw new DomainError('Cast not found', { code: 'CAST_NOT_FOUND', context: { castId: dto.cast_id } });
    }

    const ar = CastAggregateRoot.fromRecord(record);
    const membershipEvent = ar.removeMember(actorId, dto.user_id, dto.reason);

    const [castSaved, eventSaved] = await Promise.all([
      this.castRepo.updateOne({
        filter: { id: dto.cast_id },
        update: { $set: { ...ar.getUpdateObject(), ...RecordMetadataUtils.update() } },
      }),
      this.eventRepo.save(membershipEvent),
    ]);

    if (!castSaved || !eventSaved) {
      throw new TechnicalError('Failed to remove cast member', 'CAST_REMOVE_MEMBER_FAILED', 500);
    }

    ar.commit();
    return membershipEvent;
  }
}
