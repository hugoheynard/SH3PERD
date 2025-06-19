import { autoBind } from '../../utils/classUtils/autoBind.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicRepertoireEntryDomainModel } from '../types/music.domain.types.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { TUserId } from '../../user/types/user.domain.types.js';
import type {
  IMusicRepertoireRepository,
  TFindMusicRepertoireByUserIdFn,
  TMusicRepertoireByUserIdPipelineResult,
} from '../types/musicRepertoire.core.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';

@autoBind
export class MusicRepertoireMongoRepository
  extends BaseMongoRepository<TMusicRepertoireEntryDomainModel>
  implements IMusicRepertoireRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @failThrows500(
    'FIND_MUSIC_REPERTOIRE_BY_USER_ID_FAILED',
    'Failed to find music repertoire by user_id',
  )
  async findRepertoireByUserId(
    input: Parameters<TFindMusicRepertoireByUserIdFn>[0],
  ): ReturnType<TFindMusicRepertoireByUserIdFn> {
    const targetUserIds = Array.isArray(input.user_id) ? input.user_id : [input.user_id];

    const result = await this.collection.aggregate<TMusicRepertoireByUserIdPipelineResult>([
      // Step 1 : filter by user
      { $match: { user_id: { $in: targetUserIds } } },
      // Step 2 : join versions
      {
        $lookup: {
          from: 'music_versions',
          localField: 'musicVersion_id',
          foreignField: 'musicVersion_id',
          as: 'version',
        },
      },
      { $unwind: '$version' },
      // Step 3 : join music
      {
        $lookup: {
          from: 'music_library',
          localField: 'version.music_id',
          foreignField: 'music_id',
          as: 'music',
        },
      },
      { $unwind: '$music' },
      // Step 4 : projection
      {
        $project: {
          _id: 0,
          user_id: 1,
          item: {
            music_id: '$music.music_id',
            musicVersion_id: '$version.musicVersion_id',
            title: '$music.title',
            artist: '$music.artist',
            title_override: '$version.title_override',
            artist_override: '$version.artist_override',
            type: '$version.type',
            genre: '$version.genre',
            duration: '$version.duration',
            key: '$version.key',
            pitch: '$version.pitch',
            bpm: '$version.bpm',
            energy: '$energy',
            effort: '$effort',
            mastery: '$mastery',
          },
        },
      },
      //step 5 group by user_id
      {
        $group: {
          _id: '$user_id',
          repertoire: { $push: '$item' },
        },
      },
      // Step 6 : final projection
      {
        $project: {
          user_id: '$_id',
          repertoire: 1,
          _id: 0,
        },
      },
    ]);
    return result.toArray();
  }

  findSharedRepertoireByUserIds(userIds: TUserId[]): Promise<any[]> {
    const result = this.collection.aggregate([
      // 1. Repertoire des deux users
      { $match: { user_id: { $in: userIds } } },

      // 2. Join version pour accéder à music_id
      {
        $lookup: {
          from: 'musicVersions',
          localField: 'musicVersion_id',
          foreignField: 'musicVersion_id',
          as: 'version',
        },
      },
      { $unwind: '$version' },

      // 3. Grouper par music_id et collecter les utilisateurs
      {
        $group: {
          _id: '$version.music_id',
          userIds: { $addToSet: '$user_id' },
        },
      },

      // 4. Filtrer les morceaux en commun
      {
        $match: {
          user_id: { $all: userIds },
        },
      },

      // 5. Récupérer les music_id communs
      {
        $project: {
          music_id: '$_id',
        },
      },

      // 6. Rejoindre avec userRepertoire pour ces music_id
      {
        $lookup: {
          from: 'userRepertoire',
          let: { musicId: '$music_id' },
          pipeline: [
            {
              $lookup: {
                from: 'musicVersions',
                localField: 'musicVersion_id',
                foreignField: 'musicVersion_id',
                as: 'version',
              },
            },
            { $unwind: '$version' },
            {
              $match: {
                $expr: {
                  $eq: ['$version.music_id', '$$musicId'],
                },
              },
            },
            {
              $lookup: {
                from: 'music',
                localField: 'version.music_id',
                foreignField: 'music_id',
                as: 'music',
              },
            },
            { $unwind: '$music' },
            {
              $project: {
                musicVersionId: '$version.musicVersion_id',
                musicTitle: '$music.title',
                musicArtist: '$music.artist',
                versionType: '$version.type',
                genre: '$version.genre',
                key: '$version.key',
                pitch: '$version.pitch',
                bpm: '$version.bpm',
                energy: '$version.energy',
                effort: 1,
                mastery: 1,
                createdAt: '$version.created_at',
                updatedAt: '$version.updated_at',
                performer_id: 1,
              },
            },
          ],
          as: 'entries',
        },
      },

      { $unwind: '$entries' },

      // 7. Final projection (structure plate comme pour le front)
      {
        $replaceRoot: { newRoot: '$entries' },
      },
    ]);

    return result.toArray();
  }
}
