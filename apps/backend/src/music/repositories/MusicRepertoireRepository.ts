import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicRepertoireEntryDomainModel } from '../types/music.domain.types.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type {
  IMusicRepertoireRepository,
  TFindMusicRepertoireByUserIdFn,
  TMusicRepertoireByUserIdPipelineResult,
} from '../types/musicRepertoire.core.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';


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

    const result = this.collection.aggregate<TMusicRepertoireByUserIdPipelineResult>([
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
          from: 'music_references',
          localField: 'version.musicReference_id',
          foreignField: 'musicReference_id',
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
            music_id: '$music.musicReference_id',
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

}
