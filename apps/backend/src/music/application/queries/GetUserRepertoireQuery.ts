import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { TUserId, TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';

export class GetUserRepertoireQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(GetUserRepertoireQuery)
export class GetUserRepertoireHandler implements IQueryHandler<GetUserRepertoireQuery, TMusicRepertoireEntryDomainModel[]> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
  ) {}

  async execute(query: GetUserRepertoireQuery): Promise<TMusicRepertoireEntryDomainModel[]> {
    return this.repRepo.findByUserId(query.userId);
  }
}
