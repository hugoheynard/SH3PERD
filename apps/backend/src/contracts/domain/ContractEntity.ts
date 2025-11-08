import type { TContractDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

/**
 * Contract entity represents a contract between a user and a company.
 */
export class ContractEntity extends Entity<TContractDomainModel>{
  constructor(props: TEntityInput<TContractDomainModel>) {
    super(props, 'contract');
  };

  // ----------- Getters ----------- //
  get startDate(): Date {
    return this.props.startDate;
  };

  get endDate(): Date | undefined {
    return this.props.endDate;
  };

  /*
  get ressourceStatus(): boolean {
    return this.props.ressourceStatus;
  };
   */


  // ----------- Methods ----------- //
  isActive(date?: Date): boolean {
    const dateToCompare = date ? date: new Date();
    return this.startDate <= dateToCompare && this.endDate ? dateToCompare <= this.endDate : true;
  };

  isSignedByUser(): boolean {
    return !!this.props.signedBy?.user;
  };

  isSignedByCompany(): boolean {
    return !!this.props.signedBy?.company;
  };



}