import { Injectable } from '@nestjs/common';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TPlatformContractDomainModel } from '@sh3pherd/shared-types';
import type { TUserId } from '@sh3pherd/shared-types';

export interface IPlatformContractRepository extends IBaseCRUD<TPlatformContractDomainModel> {
  /** Find the platform contract for a user. One per user, returns null if not found. */
  findByUserId(userId: TUserId): Promise<TPlatformContractDomainModel | null>;
}

@Injectable()
export class PlatformContractMongoRepository
  extends BaseMongoRepository<TPlatformContractDomainModel>
  implements IPlatformContractRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findByUserId(userId: TUserId): Promise<TPlatformContractDomainModel | null> {
    return this.findOne({ filter: { user_id: userId } as any });
  }
}
