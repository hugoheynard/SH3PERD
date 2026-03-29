
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  IMusicReferenceRepository,
} from '../types/musicReferences.types.js';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';


export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };



  async findAll(): Promise<TMusicReferenceDomainModel[]> {
    return await this.collection.find().toArray();
  }

  async findByIds(ids: TMusicReferenceDomainModel['id'][]): Promise<TMusicReferenceDomainModel[]> {
    if (ids.length === 0) return [];
    return this.collection.find({ id: { $in: ids } } as any).toArray() as Promise<TMusicReferenceDomainModel[]>;
  }

  /**
   * Search music references by text.
   * related to an atlas search index created on the cluster.
   * @param searchValue
   */
  @technicalFailThrows500('MUSIC_REFERENCE_TEXT_SEARCH_ERROR', 'Error while searching music references by text')
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
