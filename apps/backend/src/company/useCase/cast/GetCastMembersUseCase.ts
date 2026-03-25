import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import type { TCastId, TCastMemberViewModel } from '@sh3pherd/shared-types';
import { CAST_REPO } from '../../company.tokens.js';
import type { ICastRepository } from '../../repositories/CastMongoRepository.js';
import { CastAggregateRoot } from '../../domain/CastAggregateRoot.js';

export type TGetCastMembersDTO = {
  cast_id: TCastId;
  /** Optional: resolve membership at a specific point in time. Defaults to now. */
  at?: Date;
};

@Injectable()
export class GetCastMembersUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly castRepo: ICastRepository,
  ) {}

  async execute(dto: TGetCastMembersDTO): Promise<TCastMemberViewModel[]> {
    const record = await this.castRepo.findById(dto.cast_id);
    if (!record) {
      throw new DomainError('Cast not found', { code: 'CAST_NOT_FOUND', context: { castId: dto.cast_id } });
    }

    const ar = CastAggregateRoot.fromRecord(record);
    const members = dto.at ? ar.getMembersAt(dto.at) : ar.getActiveMembers();

    return members.map(m => ({
      user_id: m.user_id,
      contract_id: m.contract_id,
      joinedAt: m.joinedAt,
      leftAt: m.leftAt,
    })) as TCastMemberViewModel[];
  }
}
