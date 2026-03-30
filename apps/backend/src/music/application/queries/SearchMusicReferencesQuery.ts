import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REFERENCE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicReferenceRepository } from '../../types/musicReferences.types.js';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';

export class SearchMusicReferencesQuery {
  constructor(public readonly searchValue: string) {}
}

@QueryHandler(SearchMusicReferencesQuery)
export class SearchMusicReferencesHandler implements IQueryHandler<SearchMusicReferencesQuery, TMusicReferenceDomainModel[]> {
  constructor(
    @Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository,
  ) {}

  async execute(query: SearchMusicReferencesQuery): Promise<TMusicReferenceDomainModel[]> {
    const q = query.searchValue?.trim().toLowerCase();
    if (!q) return [];
    return this.refRepo.findByTextSearch(q);
  }
}
