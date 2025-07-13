import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicVersionDomainModel } from '@sh3pherd/shared-types';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { ClientSession } from 'mongodb';
import { apiCodes } from '../codes.js';

export interface IMusicVersionRepository {
  saveOne: (document: TMusicVersionDomainModel, session?: ClientSession) => Promise<boolean>;
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
}