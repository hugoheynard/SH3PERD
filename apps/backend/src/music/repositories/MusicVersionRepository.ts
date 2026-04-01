import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
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
import type { ClientSession } from 'mongodb';
import { apiCodes } from '../codes.js';


export interface IMusicVersionRepository {
  saveOne(document: TMusicVersionDomainModel, session?: ClientSession): Promise<boolean>;
  findOneByVersionId(versionId: TMusicVersionId): Promise<TMusicVersionDomainModel | null>;
  updateVersion(versionId: TMusicVersionId, patch: Record<string, unknown>): Promise<TMusicVersionDomainModel | null>;
  deleteOneByVersionId(versionId: TMusicVersionId): Promise<boolean>;
  pushTrack(versionId: TMusicVersionId, track: TVersionTrackDomainModel): Promise<boolean>;
  pullTrack(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean>;
  setTrackFavorite(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean>;
  setTrackAnalysis(versionId: TMusicVersionId, trackId: TVersionTrackId, analysis: TAudioAnalysisSnapshot): Promise<boolean>;
  findByOwnerId(userId: TUserId): Promise<TMusicVersionDomainModel[]>;
  findByOwnerAndReference(userId: TUserId, referenceId: TMusicReferenceId): Promise<TMusicVersionDomainModel[]>;
}

export class MusicVersionRepository
  extends BaseMongoRepository<TMusicVersionDomainModel>
  implements IMusicVersionRepository {

  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500(
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.code,
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.message,
  )
  async saveOne(document: TMusicVersionDomainModel, session?: ClientSession): Promise<boolean> {
    const result = await this.collection.insertOne(document as any, { session });
    return result.acknowledged;
  }

  async findOneByVersionId(versionId: TMusicVersionId): Promise<TMusicVersionDomainModel | null> {
    return this.collection.findOne({ id: versionId } as any) as Promise<TMusicVersionDomainModel | null>;
  }

  async updateVersion(
    versionId: TMusicVersionId,
    patch: Record<string, unknown>,
  ): Promise<TMusicVersionDomainModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { id: versionId } as any,
      { $set: patch },
      { returnDocument: 'after' },
    );
    return result as TMusicVersionDomainModel | null;
  }

  async deleteOneByVersionId(versionId: TMusicVersionId): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: versionId } as any);
    return result.deletedCount === 1;
  }

  /* ── Track subdocument operations ── */

  async pushTrack(versionId: TMusicVersionId, track: TVersionTrackDomainModel): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id: versionId } as any,
      {
        $push: { tracks: track as any },
        $set: { 'metadata.updated_at': new Date() },
      },
    );
    return result.modifiedCount === 1;
  }

  async pullTrack(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id: versionId } as any,
      {
        $pull: { tracks: { id: trackId } as any },
        $set: { 'metadata.updated_at': new Date() },
      },
    );
    return result.modifiedCount === 1;
  }

  /**
   * Sets a track as favorite and unsets all others.
   * Two-step: first unset all, then set the target.
   */
  async setTrackFavorite(versionId: TMusicVersionId, trackId: TVersionTrackId): Promise<boolean> {
    // Step 1: unset all favorites
    await this.collection.updateOne(
      { id: versionId } as any,
      { $set: { 'tracks.$[].favorite': false } },
    );
    // Step 2: set target favorite
    const result = await this.collection.updateOne(
      { id: versionId, 'tracks.id': trackId } as any,
      {
        $set: {
          'tracks.$.favorite': true,
          'metadata.updated_at': new Date(),
        },
      },
    );
    return result.modifiedCount === 1;
  }

  /** Persist audio analysis results on a specific track. */
  async setTrackAnalysis(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    analysis: TAudioAnalysisSnapshot,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id: versionId, 'tracks.id': trackId } as any,
      {
        $set: {
          'tracks.$.analysisResult': analysis,
          'metadata.updated_at': new Date(),
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async findByOwnerId(userId: TUserId): Promise<TMusicVersionDomainModel[]> {
    return this.collection.find({ owner_id: userId } as any).toArray() as Promise<TMusicVersionDomainModel[]>;
  }

  async findByOwnerAndReference(userId: TUserId, referenceId: TMusicReferenceId): Promise<TMusicVersionDomainModel[]> {
    return this.collection.find({ owner_id: userId, musicReference_id: referenceId } as any).toArray() as Promise<TMusicVersionDomainModel[]>;
  }
}
