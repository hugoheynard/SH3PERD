import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TCastRecord, TCompanyId, TServiceId, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO } from '../../company.tokens.js';
import type { ICastRepository } from '../../repositories/CastMongoRepository.js';
import { CastAggregateRoot } from '../../domain/CastAggregateRoot.js';

export type TCreateCastDTO = {
  company_id: TCompanyId;
  name: string;
  service_id?: TServiceId;
};

@Injectable()
export class CreateCastUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly castRepo: ICastRepository,
  ) {}

  async execute(dto: TCreateCastDTO, actorId: TUserId): Promise<TCastRecord> {
    const ar = new CastAggregateRoot({
      company_id: dto.company_id,
      name: dto.name,
      service_id: dto.service_id,
      members: [],
      status: 'active',
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const record: TCastRecord = { ...ar.snapshot, ...metadata };

    const saved = await this.castRepo.save(record);
    if (!saved) {
      throw new TechnicalError('Failed to create cast', 'CAST_CREATE_FAILED', 500);
    }
    ar.commit();
    return record;
  }
}
