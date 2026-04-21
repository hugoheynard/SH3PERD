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
import type { ClientSession, OptionalUnlessRequiredId } from 'mongodb';

export type IMusicRepertoireRepository = {
  saveOne(entry: TMusicRepertoireEntryDomainModel, session?: ClientSession): Promise<boolean>;
  findOneByEntryId(entryId: TRepertoireEntryId): Promise<TMusicRepertoireEntryDomainModel | null>;
  findByOwnerAndReference(
    ownerId: TUserId,
    refId: TMusicReferenceId,
  ): Promise<TMusicRepertoireEntryDomainModel | null>;
  deleteOneByEntryId(entryId: TRepertoireEntryId, session?: ClientSession): Promise<boolean>;
  findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]>;
  /** Expose a MongoDB client session for cross-repo transactions. */
  startSession(): ClientSession;
};

export class MusicRepertoireMongoRepository
  extends BaseMongoRepository<TMusicRepertoireEntryDomainModel>
  implements IMusicRepertoireRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(
    entry: TMusicRepertoireEntryDomainModel,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.collection.insertOne(
      entry as OptionalUnlessRequiredId<TMusicRepertoireEntryDomainModel>,
      { session },
    );
    return result.acknowledged;
  }

  async findOneByEntryId(
    entryId: TRepertoireEntryId,
  ): Promise<TMusicRepertoireEntryDomainModel | null> {
    return this.findOne({ filter: { id: entryId } });
  }

  async findByOwnerAndReference(
    ownerId: TUserId,
    refId: TMusicReferenceId,
  ): Promise<TMusicRepertoireEntryDomainModel | null> {
    return this.findOne({ filter: { owner_id: ownerId, musicReference_id: refId } });
  }

  async deleteOneByEntryId(entryId: TRepertoireEntryId, session?: ClientSession): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: entryId }, { session });
    return result.deletedCount === 1;
  }

  async findByUserId(userId: TUserId): Promise<TMusicRepertoireEntryDomainModel[]> {
    return this.findMany({ filter: { owner_id: userId } });
  }
}
