import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TMusicRepertoireEntryDomainModel,
  TMusicReferenceId,
  TRepertoireEntryId,
  TUserId,
} from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import type { Filter, OptionalUnlessRequiredId } from 'mongodb';

export type IMusicRepertoireRepository = {
  saveOne(entry: TMusicRepertoireEntryDomainModel): Promise<boolean>;
  findOneByEntryId(entryId: TRepertoireEntryId): Promise<TMusicRepertoireEntryDomainModel | null>;
  findByOwnerAndReference(
    ownerId: TUserId,
    refId: TMusicReferenceId,
  ): Promise<TMusicRepertoireEntryDomainModel | null>;
  deleteOneByEntryId(entryId: TRepertoireEntryId): Promise<boolean>;
  findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]>;
};

export class MusicRepertoireMongoRepository
  extends BaseMongoRepository<TMusicRepertoireEntryDomainModel>
  implements IMusicRepertoireRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500('REPERTOIRE_SAVE_FAILED', 'Failed to save repertoire entry')
  async saveOne(entry: TMusicRepertoireEntryDomainModel): Promise<boolean> {
    const result = await this.collection.insertOne(
      entry as OptionalUnlessRequiredId<TMusicRepertoireEntryDomainModel>,
    );
    return result.acknowledged;
  }

  async findOneByEntryId(
    entryId: TRepertoireEntryId,
  ): Promise<TMusicRepertoireEntryDomainModel | null> {
    const filter: Filter<TMusicRepertoireEntryDomainModel> = {
      id: entryId,
    };
    return this.collection.findOne(filter) as Promise<TMusicRepertoireEntryDomainModel | null>;
  }

  async findByOwnerAndReference(
    ownerId: TUserId,
    refId: TMusicReferenceId,
  ): Promise<TMusicRepertoireEntryDomainModel | null> {
    const filter: Filter<TMusicRepertoireEntryDomainModel> = {
      owner_id: ownerId,
      musicReference_id: refId,
    };
    return this.collection.findOne(filter) as Promise<TMusicRepertoireEntryDomainModel | null>;
  }

  async deleteOneByEntryId(entryId: TRepertoireEntryId): Promise<boolean> {
    const filter: Filter<TMusicRepertoireEntryDomainModel> = { id: entryId };
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount === 1;
  }

  async findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]> {
    const filter: Filter<TMusicRepertoireEntryDomainModel> = { owner_id: userId };
    return this.collection.find(filter).toArray() as Promise<TMusicRepertoireEntryDomainModel[]>;
  }
}
