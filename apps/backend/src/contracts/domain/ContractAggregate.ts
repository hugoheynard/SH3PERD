import { AggregateRoot } from '@nestjs/cqrs';
import type { ContractEntity } from './ContractEntity.js';


export class ContractAggregate extends AggregateRoot {
  constructor(
    private readonly contract: ContractEntity
  ) {
    super()
  };
}