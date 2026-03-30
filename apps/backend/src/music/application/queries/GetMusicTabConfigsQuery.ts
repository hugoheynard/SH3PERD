import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_TAB_CONFIGS_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicTabConfigsRepository } from '../../repositories/MusicTabConfigsRepository.js';
import type { TUserId, TMusicTabConfigsDomainModel } from '@sh3pherd/shared-types';

export class GetMusicTabConfigsQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(GetMusicTabConfigsQuery)
export class GetMusicTabConfigsHandler implements IQueryHandler<GetMusicTabConfigsQuery, TMusicTabConfigsDomainModel | null> {
  constructor(
    @Inject(MUSIC_TAB_CONFIGS_REPO) private readonly repo: IMusicTabConfigsRepository,
  ) {}

  async execute(query: GetMusicTabConfigsQuery): Promise<TMusicTabConfigsDomainModel | null> {
    return this.repo.findByUserId(query.userId);
  }
}
