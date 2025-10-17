import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicVersionDomainModel, TUserId, TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { ClientSession } from 'mongodb';
import { apiCodes } from '../codes.js';


export interface IMusicVersionRepository {
  saveOne: (document: TMusicVersionDomainModel, session?: ClientSession) => Promise<boolean>;
  findVersionsByUserId: (userId: TUserId) => Promise<TUserMusicLibraryItem[]>;
}

export class MusicVersionRepository
  extends BaseMongoRepository<TMusicVersionDomainModel>
  implements IMusicVersionRepository {

  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };

  @failThrows500(
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.code,
    apiCodes.music.MUSIC_VERSION_CREATION_REPO_FAIL.message
  )
  async saveOne(document: TMusicVersionDomainModel, session?: ClientSession): Promise<boolean> {
    const result = await this.collection.insertOne(document, session);

    if (!result.acknowledged) {
      return false;
    }

    return true;
  };

  async findVersionsByUserId(userId: TUserId): Promise<TUserMusicLibraryItem[]> {
    const result = await this.collection.aggregate<TUserMusicLibraryItem>([
      /**
       * Match versions that are either owned by the user or borrowed through repertoireEntries
       */
      {
        $match: {
          owner_id: userId,
          musicVersion_id: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'music_versions',
          localField: 'musicVersion_id',
          foreignField: 'musicVersion_id',
          as: 'version'
        }
      },
      { $unwind: '$version' },
      {
        $lookup: {
          from: 'music_repertoireEntries',
          let: { versionId: '$musicVersion_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$musicVersion_id', '$$versionId'] },
                    { $eq: ['$user_id', { $literal: userId }] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'repertoireEntry'
        }
      },
      { $unwind: { path: '$repertoireEntry', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'music_references',
          localField: 'musicReference_id',
          foreignField: 'musicReference_id',
          as: 'reference'
        }
      },
      { $unwind: { path: '$reference', preserveNullAndEmptyArrays: true } },
      { $project: {
          version: '$version',
          repertoireEntry: '$repertoireEntry',
          reference: '$reference',
          source: 'owned'
        }
      },
      /**
       * Union with repertoireEntries to include borrowed versions
       * This will add the versions that are borrowed by the user through repertoireEntries
       * and will not duplicate the owned versions.
       */
      {
        $unionWith: {
          coll: 'music_repertoireEntries',
          pipeline: [
            { $match: {
              user_id: userId ,
                musicVersion_id: { $exists: true, $ne: null }
            }
            },
            {
              $lookup: {
                from: 'music_versions',
                localField: 'musicVersion_id',
                foreignField: 'musicVersion_id',
                as: 'version'
              }
            },
            { $unwind: '$version' },
            {
              $match: {
                'version.owner_id': { $ne: userId } // ⛔ Excludes owned versions
              }
            },
            {
              $lookup: {
                from: 'musicReferences',
                localField: 'version.musicReference_id',
                foreignField: 'musicReference_id',
                as: 'musicReference'
              }
            },
            { $unwind: { path: '$musicReference', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                version: {
                  musicVersion_id: '$version.musicVersion_id',
                  title: '$version.title',
                  artist: '$version.artist',
                  bpm: '$version.bpm',
                  pitch: '$version.pitch',
                  genre: '$version.genre',
                  type: '$version.type',
                  musicReference_id: '$version.musicReference_id'
                },
                repertoireEntry: {
                  user_id: '$user_id',
                  energy: '$energy',
                  effort: '$effort',
                  mastery: '$mastery',
                  affinity: '$affinity'
                },
                musicReference: '$musicReference',
                source: 'borrowed'
              }
            }
          ]
        },
      },
      { $unset: ['_id', 'version._id', 'repertoireEntry._id', 'reference._id'] }
    ]).toArray();

    return result;
  };
}