import type { TContractId } from '@sh3pherd/shared-types';
import type { TPermissionKey } from '../permissionsRegistry.js';

export type TPermissionServiceDeps = {
  findContractPermissionsFn: (contract_id: TContractId) => Promise<Record<TPermissionKey, boolean> | null>;
}


export class PermissionService {
  constructor(private readonly deps: TPermissionServiceDeps) {};

  /**
   * Check if a contract has a specific permission.
   * @param contract_id
   * @param permission
   */
  async hasPermission(contract_id: TContractId, permission: TPermissionKey): Promise<boolean> {
    const contractPermissions = await this.deps.findContractPermissionsFn(contract_id);

    if (!contractPermissions) {
      return false;
    }

    return contractPermissions[permission];
  };
}