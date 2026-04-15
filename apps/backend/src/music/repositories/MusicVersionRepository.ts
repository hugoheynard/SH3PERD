import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TMusicVersionDomainModel,
  TMusicVersionId,
  TMusicReferenceId,
  TVersionTrackDomainModel,
  TVersionTrackId,
  TAudioAnalysisSnapshot,
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
  ): Promise<TMusicVersionDomainModel | null>;
  deleteOneByVersionId(versionId: TMusicVersionId): Promise<boolean>;
  pushTrack(versionId: TMusicVersionId, track: TVersionTrackDomainModel): Promise<boolean>;
  pullTrack(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean>;
  setTrackFavorite(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean>;
  setTrackAnalysis(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    analysis: TAudioAnalysisSnapshot,
  ): Promise<boolean>;
  findByOwnerId(userId: TUserId): Promise<TMusicVersionDomainModel[]>;
  findByOwnerAndReference(
    userId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<TMusicVersionDomainModel[]>;
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
  ): Promise<TMusicVersionDomainModel | null> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const update: UpdateFilter<TMusicVersionDomainModel> = { $set: patch };
    const result = await this.collection.findOneAndUpdate(filter, update, {
      returnDocument: 'after',
    });
    return result as TMusicVersionDomainModel | null;
  }

  async deleteOneByVersionId(versionId: TMusicVersionId): Promise<boolean> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount === 1;
  }

  /* ── Track subdocument operations ── */

  async pushTrack(versionId: TMusicVersionId, track: TVersionTrackDomainModel): Promise<boolean> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const update: UpdateFilter<TMusicVersionDomainModel> = {
      $push: { tracks: track },
      $set: { 'metadata.updated_at': new Date() },
    };
    const result = await this.collection.updateOne(filter, update);
    return result.modifiedCount === 1;
  }

  async pullTrack(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean> {
    const filter: Filter<TMusicVersionDomainModel> = { id: versionId };
    const update: UpdateFilter<TMusicVersionDomainModel> = {
      $pull: { tracks: { id: trackId } },
      $set: { 'metadata.updated_at': new Date() },
    };
    const result = await this.collection.updateOne(filter, update);
    return result.modifiedCount === 1;
  }

  /**
   * Sets a track as favorite and unsets all others.
   * Two-step: first unset all, then set the target.
   */
  async setTrackFavorite(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean> {
    const versionFilter: Filter<TMusicVersionDomainModel> = { id: versionId };
    // Step 1: unset all favorites
    await this.collection.updateOne(versionFilter, {
      $set: { 'tracks.$[].favorite': false },
    } as UpdateFilter<TMusicVersionDomainModel>);

    const trackFilter: Filter<TMusicVersionDomainModel> = {
      id: versionId,
      'tracks.id': trackId,
    };
    // Step 2: set target favorite
    const result = await this.collection.updateOne(trackFilter, {
      $set: {
        'tracks.$.favorite': true,
        'metadata.updated_at': new Date(),
      },
    } as UpdateFilter<TMusicVersionDomainModel>);
    return result.modifiedCount === 1;
  }

  /** Persist audio analysis results on a specific track. */
  async setTrackAnalysis(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    analysis: TAudioAnalysisSnapshot,
  ): Promise<boolean> {
    const filter: Filter<TMusicVersionDomainModel> = {
      id: versionId,
      'tracks.id': trackId,
    };
    const update: UpdateFilter<TMusicVersionDomainModel> = {
      $set: {
        'tracks.$.analysisResult': analysis,
        'metadata.updated_at': new Date(),
      },
    };
    const result = await this.collection.updateOne(filter, update);
    return result.modifiedCount === 1;
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
