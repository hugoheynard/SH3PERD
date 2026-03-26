import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TTeamRecord, TCompanyId, TServiceId, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';
import { TeamAggregateRoot } from '../../domain/TeamAggregateRoot.js';

export type TCreateTeamDTO = {
  company_id: TCompanyId;
  name: string;
  service_id?: TServiceId;
};

@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly teamRepo: ITeamRepository,
  ) {}

  async execute(dto: TCreateTeamDTO, actorId: TUserId): Promise<TTeamRecord> {
    const ar = new TeamAggregateRoot({
      company_id: dto.company_id,
      name: dto.name,
      service_id: dto.service_id,
      members: [],
      status: 'active',
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const record: TTeamRecord = { ...ar.snapshot, ...metadata };

    const saved = await this.teamRepo.save(record);
    if (!saved) {
      throw new TechnicalError('Failed to create team', 'TEAM_CREATE_FAILED', 500);
    }
    ar.commit();
    return record;
  }
}
