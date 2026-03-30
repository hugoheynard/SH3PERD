import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TMusicRepertoireEntryDomainModel,
  TMusicReferenceId,
  TRepertoireEntryId,
  TUserId,
} from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';


export interface IMusicRepertoireRepository {
  saveOne(entry: TMusicRepertoireEntryDomainModel): Promise<boolean>;
  findOneByEntryId(entryId: TRepertoireEntryId): Promise<TMusicRepertoireEntryDomainModel | null>;
  findByOwnerAndReference(ownerId: TUserId, refId: TMusicReferenceId): Promise<TMusicRepertoireEntryDomainModel | null>;
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

  async findOneByEntryId(entryId: TRepertoireEntryId): Promise<TMusicRepertoireEntryDomainModel | null> {
    return this.collection.findOne({ id: entryId } as any) as Promise<TMusicRepertoireEntryDomainModel | null>;
  }

  async findByOwnerAndReference(ownerId: TUserId, refId: TMusicReferenceId): Promise<TMusicRepertoireEntryDomainModel | null> {
    return this.collection.findOne({ owner_id: ownerId, musicReference_id: refId } as any) as Promise<TMusicRepertoireEntryDomainModel | null>;
  }

  async deleteOneByEntryId(entryId: TRepertoireEntryId): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: entryId } as any);
    return result.deletedCount === 1;
  }

  async findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]> {
    return this.collection.find({ owner_id: userId } as any).toArray() as Promise<TMusicRepertoireEntryDomainModel[]>;
  }
}
