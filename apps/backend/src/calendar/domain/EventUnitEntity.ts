import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TEventUnitDomainModel, TContractId } from '@sh3pherd/shared-types';

export class EventUnitEntity extends Entity<TEventUnitDomainModel> {
  constructor(props: TEntityInput<TEventUnitDomainModel>) {
    super(props, 'eventUnit');

    if (this.endDate < this.startDate) {
      throw new Error('End date cannot be before start date');
    }
  };

  // --- Methods --- //
  addParticipants(contract_ids: TContractId[]): void {
    this.participants.push(...contract_ids);
  };

  // --- Getters --- //
  get startDate(): Date {
    return this.props.startDate;
  };

  get endDate(): Date {
    return this.props.endDate;
  };

  get participants(): TContractId[] {
    return this.props.participants;
  };
}