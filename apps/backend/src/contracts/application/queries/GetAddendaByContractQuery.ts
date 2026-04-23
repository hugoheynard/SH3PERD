import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractAddendumDomainModel, TContractId } from '@sh3pherd/shared-types';
import { ADDENDUM_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IAddendumRepository } from '../../repositories/AddendumMongoRepository.js';

export class GetAddendaByContractQuery {
  constructor(public readonly contractId: TContractId) {}
}

@QueryHandler(GetAddendaByContractQuery)
export class GetAddendaByContractHandler implements IQueryHandler<
  GetAddendaByContractQuery,
  TContractAddendumDomainModel[]
> {
  constructor(@Inject(ADDENDUM_REPO) private readonly addendumRepo: IAddendumRepository) {}

  async execute(query: GetAddendaByContractQuery): Promise<TContractAddendumDomainModel[]> {
    return this.addendumRepo.findByContractId(query.contractId);
  }
}
