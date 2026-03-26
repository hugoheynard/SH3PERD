import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import type { TTeamId, TTeamMemberViewModel } from '@sh3pherd/shared-types';
import { CAST_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';
import { TeamAggregateRoot } from '../../domain/TeamAggregateRoot.js';

export type TGetTeamMembersDTO = {
  cast_id: TTeamId;
  /** Optional: resolve membership at a specific point in time. Defaults to now. */
  at?: Date;
};

@Injectable()
export class GetTeamMembersUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly teamRepo: ITeamRepository,
  ) {}

  async execute(dto: TGetTeamMembersDTO): Promise<TTeamMemberViewModel[]> {
    const record = await this.teamRepo.findById(dto.cast_id);
    if (!record) {
      throw new DomainError('Team not found', { code: 'TEAM_NOT_FOUND', context: { teamId: dto.cast_id } });
    }

    const ar = TeamAggregateRoot.fromRecord(record);
    const members = dto.at ? ar.getMembersAt(dto.at) : ar.getActiveMembers();

    return members.map(m => ({
      user_id: m.user_id,
      contract_id: m.contract_id,
      joinedAt: m.joinedAt,
      leftAt: m.leftAt,
    })) as TTeamMemberViewModel[];
  }
}
