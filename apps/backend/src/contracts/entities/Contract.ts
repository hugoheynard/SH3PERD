import type { TContractDomainModel, TContractId } from '@sh3pherd/shared-types';

/**
 * Contract entity represents a contract between a user and a company.
 */
export class Contract {
  constructor(private _props: TContractDomainModel) {}

  // ----------- Methods ----------- //

  isActive(date?: Date): boolean {
    const dateToCompare = date ? date: new Date();
    return this.startDate <= dateToCompare
    && this.endDate ? dateToCompare <= this.endDate : true;
  };

  isSignedByUser(): boolean {
    return !!this.props.signedBy?.user;
  };

  isSignedByCompany(): boolean {
    return !!this.props.signedBy?.company;
  };


  // ----------- Getters ----------- //

  get contract_id(): TContractId {
    return this.props.contract_id;
  };

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

  get props(): TContractDomainModel {
    return this._props;
  };

}