import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import type { TTeamId, TCastMembershipEventRecord, TContractId, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO, CAST_MEMBERSHIP_EVENT_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';
import type { ICastMembershipEventRepository } from '../../repositories/CastMembershipEventMongoRepository.js';
import { TeamAggregateRoot } from '../../domain/TeamAggregateRoot.js';

export type TAddTeamMemberDTO = {
  cast_id: TTeamId;
  user_id: TUserId;
  contract_id: TContractId;
};

@Injectable()
export class AddTeamMemberUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly teamRepo: ITeamRepository,
    @Inject(CAST_MEMBERSHIP_EVENT_REPO) private readonly eventRepo: ICastMembershipEventRepository,
  ) {}

  async execute(dto: TAddTeamMemberDTO, actorId: TUserId): Promise<TCastMembershipEventRecord> {
    const record = await this.teamRepo.findById(dto.cast_id);
    if (!record) {
      throw new DomainError('Team not found', { code: 'TEAM_NOT_FOUND', context: { teamId: dto.cast_id } });
    }

    const ar = TeamAggregateRoot.fromRecord(record);
    const membershipEvent = ar.addMember(actorId, dto.user_id, dto.contract_id);

    // Persist updated team (members array) and the membership event atomically
    const [teamSaved, eventSaved] = await Promise.all([
      this.teamRepo.updateOne({
        filter: { id: dto.cast_id },
        update: { $set: { ...ar.getUpdateObject(), ...RecordMetadataUtils.update() } },
      }),
      this.eventRepo.save(membershipEvent),
    ]);

    if (!teamSaved || !eventSaved) {
      throw new TechnicalError('Failed to add team member', 'TEAM_ADD_MEMBER_FAILED', 500);
    }

    ar.commit();
    return membershipEvent;
  }
}
