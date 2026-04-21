import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IMusicReferenceRepository } from '../types/musicReferences.types.js';
import type { TMusicReferenceDomainModel, TMusicReferenceId } from '@sh3pherd/shared-types';

export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findAll(): Promise<TMusicReferenceDomainModel[]> {
    return this.findMany({ filter: {} });
  }

  async findByExactTitleAndArtist(
    title: string,
    artist: string,
  ): Promise<TMusicReferenceDomainModel | null> {
    return this.findOne({ filter: { title, artist } });
  }

  async findByIds(ids: TMusicReferenceId[]): Promise<TMusicReferenceDomainModel[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.findMany({ filter: { id: { $in: ids } } });
  }

  /**
   * Fuzzy text search via Atlas Search index.
   * Index 'default' must exist on the collection with paths ['title', 'artist'].
   */
  async findByTextSearch(searchValue: string): Promise<TMusicReferenceDomainModel[]> {
    return this.collection
      .aggregate<TMusicReferenceDomainModel>([
        {
          $search: {
            index: 'default',
            text: {
              query: searchValue,
              path: ['title', 'artist'],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 1,
                maxExpansions: 50,
              },
            },
          },
        },
        { $limit: 20 },
        { $project: { _id: 0 } },
      ])
      .toArray();
  }
}
