import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TMusicVersionDomainModel,
  TMusicVersionId,
  TMusicReferenceId,
  TUserId,
} from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import type { ClientSession, Filter, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb';
import { apiCodes } from '../codes.js';

export type IMusicVersionRepository = {
  saveOne(document: TMusicVersionDomainModel, session?: ClientSession): Promise<boolean>;
  findOneByVersionId(versionId: TMusicVersionId): Promise<TMusicVersionDomainModel | null>;
  updateVersion(
    versionId: TMusicVersionId,
    patch: Record<string, unknown>,
    session?: ClientSession,
  ): Promise<TMusicVersionDomainModel | null>;
  deleteOneByVersionId(versionId: TMusicVersionId, session?: ClientSession): Promise<boolean>;
  findByOwnerId(userId: TUserId): Promise<TMusicVersionDomainModel[]>;
  findByOwnerAndReference(
    userId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<TMusicVersionDomainModel[]>;
  /** Expose a MongoDB client session for cross-repo transactions. */
  startSession(): ClientSession;
};

export class MusicVersionRepository
  extends BaseMongoRepository<TMusicVersionDomainModel>
  implements IMusicVersionRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500(
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.code,
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.message,
  )
  async saveOne(document: TMusicVersionDomainModel, session?: ClientSession): Promise<boolean> {
    const result = await this.collection.insertOne(
      document as OptionalUnlessRequiredId<TMusicVersionDomainModel>,
      { session },
    );
    return result.acknowledged;
  }

  async findOneByVersionId(versionId: TMusicVersionId): Promise<TMusicVersionDomainModel | null> {
    const filter: Filter<TMusicVersionDomainModel> = {
      id: versionId,
    };
    return this.collection.findOne(filter) as Promise<TMusicVersionDomainModel | null>;
  }

  async updateVersion(
    versionId: TMusicVersionId,
    patch: Record<string, unknown>,
    session?: ClientSession,
  ): Promise<TMusicVersionDomainModel | null> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const update: UpdateFilter<TMusicVersionDomainModel> = { $set: patch };
    const result = await this.collection.findOneAndUpdate(filter, update, {
      returnDocument: 'after',
      session,
    });
    return result as TMusicVersionDomainModel | null;
  }

  async deleteOneByVersionId(
    versionId: TMusicVersionId,
    session?: ClientSession,
  ): Promise<boolean> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const result = await this.collection.deleteOne(filter, { session });
    return result.deletedCount === 1;
  }

  async findByOwnerId(userId: TUserId): Promise<TMusicVersionDomainModel[]> {
    const filter: Filter<TMusicVersionDomainModel> = { owner_id: userId };
    return this.collection.find(filter).toArray() as Promise<TMusicVersionDomainModel[]>;
  }

  async findByOwnerAndReference(
    userId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<TMusicVersionDomainModel[]> {
    const filter: Filter<TMusicVersionDomainModel> = {
      owner_id: userId,
      musicReference_id: referenceId,
    };
    return this.collection.find(filter).toArray() as Promise<TMusicVersionDomainModel[]>;
  }
}
