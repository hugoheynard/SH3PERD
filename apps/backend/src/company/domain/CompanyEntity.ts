import { randomUUID } from 'crypto';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TCompanyAddress, TCompanyDomainModel, TCompanyAdmin, TService, TServiceId, TServiceCommunication, TUserId } from '@sh3pherd/shared-types';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';


export class CompanyEntity extends Entity<TCompanyDomainModel> {
  constructor(props: TEntityInput<TCompanyDomainModel>) {
    super(props, 'company');
  }

  addService(name: string, color?: string): TService {
    const service: TService = { id: `service_${randomUUID()}` as TServiceId, name, ...(color ? { color } : {}) };
    this.props = { ...this.props, services: [...this.props.services, service] };
    return service;
  }

  removeService(serviceId: TServiceId): void {
    if (!this.props.services.some(s => s.id === serviceId)) {
      throw new DomainError('Service not found', { code: 'SERVICE_NOT_FOUND', context: { serviceId } });
    }
    this.props = { ...this.props, services: this.props.services.filter(s => s.id !== serviceId) };
  }

  updateService(serviceId: TServiceId, fields: { name?: string; color?: string; communication?: TServiceCommunication | null }): TService {
    const idx = this.props.services.findIndex(s => s.id === serviceId);
    if (idx === -1) {
      throw new DomainError('Service not found', { code: 'SERVICE_NOT_FOUND', context: { serviceId } });
    }
    const { communication, ...rest } = fields;
    // null explicitly removes the communication link; undefined leaves it unchanged
    const updated: TService = {
      ...this.props.services[idx],
      ...rest,
      ...(communication === null
        ? { communication: undefined }
        : communication !== undefined
          ? { communication }
          : {}),
    };
    const services = [...this.props.services];
    services[idx] = updated;
    this.props = { ...this.props, services };
    return updated;
  }

  rename(name: string): void {
    this.props = { ...this.props, name };
  }

  updateInfo(fields: { name?: string; description?: string; address?: TCompanyAddress }): void {
    this.props = { ...this.props, ...fields };
  }

  addAdmin(userId: TUserId, role: TCompanyAdmin['role']): void {
    if (this.props.admins.some(s => s.user_id === userId)) {
      throw new DomainError('User is already an admin', { code: 'ADMIN_ALREADY_EXISTS', context: { userId } });
    }
    const member: TCompanyAdmin = { user_id: userId, role, joinedAt: new Date() };
    this.props = { ...this.props, admins: [...this.props.admins, member] };
  }

  removeAdmin(userId: TUserId): void {
    if (!this.props.admins.some(s => s.user_id === userId)) {
      throw new DomainError('Admin not found', { code: 'ADMIN_NOT_FOUND', context: { userId } });
    }
    this.props = { ...this.props, admins: this.props.admins.filter(s => s.user_id !== userId) };
  }

  updateStatus(status: TCompanyDomainModel['status']): void {
    this.props = { ...this.props, status };
  }

  hasService(serviceId: TServiceId): boolean {
    return this.props.services.some(s => s.id === serviceId);
  }
}
