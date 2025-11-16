import type { TContractDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

/**
 * Contract entity represents a contract between a user and a company.
 */
export class ContractEntity extends Entity<TContractDomainModel>{
  constructor(props: TEntityInput<TContractDomainModel>) {
    super(props, 'contract');
  };

  /*
  get ressourceStatus(): boolean {
    return this.props.ressourceStatus;
  };
   */


  // ----------- Methods ----------- //
  isActive(date?: Date): boolean {
    const dateToCompare = date ? date: new Date();
    return this.props.startDate <= dateToCompare && this.props.endDate ? dateToCompare <= this.props.endDate : true;
  };

  isSignedByUser(): boolean {
    return !!this.props.signedBy?.user;
  };

  isSignedByCompany(): boolean {
    return !!this.props.signedBy?.company;
  };

  getSnapshot() {

    return {
      contract_id: this.props.id,
      user_id: this.props.user_id
    };
  }



}