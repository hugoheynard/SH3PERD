import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  IMusicReferenceRepository,
} from '../types/musicReferences.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { ClientSession, Filter } from 'mongodb';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';


export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };

  @failThrows500('MUSIC_REFERENCE_SAVE_ERROR', 'Error while saving music reference')
  async saveOne(document: TMusicReferenceDomainModel, session?: ClientSession): Promise<boolean> {
    const result = await this.collection.insertOne(document, session);

    if (!result.acknowledged) {
      return false;
    }
    return true;
  }

  //FIND METHODS
  @failThrows500('MUSIC_REFERENCE_FIND_ONE_ERROR', 'Error while finding music reference by id')
  async findOne(
    filter: Filter<TMusicReferenceDomainModel>,
  ): Promise<TMusicReferenceDomainModel | null> {
    return await this.findOneDocBy(filter);
  }

  @failThrows500('MUSIC_REFERENCE_FIND_MANY_ERROR', 'Error while finding music reference by filter')
  async findMany(
    filter: Filter<TMusicReferenceDomainModel>,
  ): Promise<TMusicReferenceDomainModel[] | null> {
    return await this.collection.find(filter).toArray();
  }

  async findAll(): Promise<TMusicReferenceDomainModel[]> {
    return await this.collection.find().toArray();
  }

  /**
   * Search music references by text.
   * related to an atlas search index created on the cluster.
   * @param searchValue
   */
  @failThrows500('MUSIC_REFERENCE_TEXT_SEARCH_ERROR', 'Error while searching music references by text')
  async findByTextSearch(searchValue: string): Promise<TMusicReferenceDomainModel[]> {

    return await this.collection
      .aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: searchValue,
              path: ['title', 'artist'],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 1,
                maxExpansions: 50
              },
              matchCriteria: 'any',
              score: { boost: { value: 1 } }
            }
          }
        }
      ])
      .toArray() as TMusicReferenceDomainModel[];
  };
}
