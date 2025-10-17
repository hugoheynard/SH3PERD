import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { TContractId, TEventUnitDomainModel } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface IEventUnitRepository extends IBaseCRUD<TEventUnitDomainModel> {

}


export class EventUnitMongoRepository
  extends BaseMongoRepository<TEventUnitDomainModel>
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @failThrows500('FIND_EVENT_UNIT_FAILED', 'Error while finding event unit')
  async getEventUnits(input: {
    user_ids: TContractId[];
    startDate: Date;
    endDate: Date;
  }): Promise<TEventUnitDomainModel[]> {
    const { user_ids, startDate, endDate } = input;

    return await this.collection
      .find({
        participants: { $in: user_ids },
        start: { $lt: endDate },
        end: { $gt: startDate },
      })
      .toArray();
  }
}