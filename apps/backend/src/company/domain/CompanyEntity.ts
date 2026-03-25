import { randomUUID } from 'crypto';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TCompanyDomainModel, TService, TServiceId } from '@sh3pherd/shared-types';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';

export class CompanyEntity extends Entity<TCompanyDomainModel> {
  constructor(props: TEntityInput<TCompanyDomainModel>) {
    super(props, 'company');
  }

  addService(name: string): TService {
    const service: TService = { id: `service_${randomUUID()}`, name };
    this.props = { ...this.props, services: [...this.props.services, service] };
    return service;
  }

  removeService(serviceId: TServiceId): void {
    if (!this.props.services.some(s => s.id === serviceId)) {
      throw new DomainError('Service not found', { code: 'SERVICE_NOT_FOUND', context: { serviceId } });
    }
    this.props = { ...this.props, services: this.props.services.filter(s => s.id !== serviceId) };
  }

  rename(name: string): void {
    this.props = { ...this.props, name };
  }

  hasService(serviceId: TServiceId): boolean {
    return this.props.services.some(s => s.id === serviceId);
  }
}
