import type { TContractDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

/**
 * Contract entity — represents a binding agreement between a user and a company.
 */
export class ContractEntity extends Entity<TContractDomainModel> {
  constructor(props: TEntityInput<TContractDomainModel>) {
    super(props, 'contract');
  }

  isActive(date?: Date): boolean {
    const d = date ?? new Date();
    return this.props.startDate <= d && (this.props.endDate ? d <= this.props.endDate : true);
  }

  isSignedByUser(): boolean {
    return !!this.props.signatures?.user;
  }

  isSignedByCompany(): boolean {
    return !!this.props.signatures?.company;
  }

  getSnapshot() {
    return {
      contract_id: this.props.id,
      user_id:     this.props.user_id,
    };
  }
}
