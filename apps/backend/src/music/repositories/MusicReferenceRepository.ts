import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IMusicReferenceRepository } from '../types/musicReferences.types.js';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import type { TMusicReferenceDomainModel, TMusicReferenceId } from '@sh3pherd/shared-types';

export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findAll(): Promise<TMusicReferenceDomainModel[]> {
    return this.collection.find().toArray() as Promise<TMusicReferenceDomainModel[]>;
  }

  async findByExactTitleAndArtist(title: string, artist: string): Promise<TMusicReferenceDomainModel | null> {
    return this.collection.findOne({ title, artist } as any) as Promise<TMusicReferenceDomainModel | null>;
  }

  async findByIds(ids: TMusicReferenceId[]): Promise<TMusicReferenceDomainModel[]> {
    if (ids.length === 0) return [];
    return this.collection
      .find({ id: { $in: ids } } as any)
      .toArray() as Promise<TMusicReferenceDomainModel[]>;
  }

  /**
   * Fuzzy text search via Atlas Search index.
   * Index 'default' must exist on the collection with paths ['title', 'artist'].
   */
  @technicalFailThrows500('MUSIC_REFERENCE_TEXT_SEARCH_ERROR', 'Error while searching music references by text')
  async findByTextSearch(searchValue: string): Promise<TMusicReferenceDomainModel[]> {
    return this.collection
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
                maxExpansions: 50,
              },
            },
          },
        },
        { $limit: 20 },
        { $project: { _id: 0 } },
      ])
      .toArray() as Promise<TMusicReferenceDomainModel[]>;
  }
}
