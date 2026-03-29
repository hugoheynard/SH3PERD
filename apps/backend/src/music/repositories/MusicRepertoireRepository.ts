import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TMusicRepertoireEntryDomainModel,
  TRepertoireEntryId,
  TUserId,
} from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';


export interface IMusicRepertoireRepository {
  saveOne(entry: TMusicRepertoireEntryDomainModel): Promise<boolean>;
  deleteOneByEntryId(entryId: TRepertoireEntryId): Promise<boolean>;
  findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]>;
}

export class MusicRepertoireMongoRepository
  extends BaseMongoRepository<TMusicRepertoireEntryDomainModel>
  implements IMusicRepertoireRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500(
    'REPERTOIRE_SAVE_FAILED',
    'Failed to save repertoire entry',
  )
  async saveOne(entry: TMusicRepertoireEntryDomainModel): Promise<boolean> {
    const result = await this.collection.insertOne(entry as any);
    return result.acknowledged;
  }

  async deleteOneByEntryId(entryId: TRepertoireEntryId): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: entryId } as any);
    return result.deletedCount === 1;
  }

  async findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]> {
    return this.collection.find({ user_id: userId } as any).toArray() as Promise<TMusicRepertoireEntryDomainModel[]>;
  }
}
