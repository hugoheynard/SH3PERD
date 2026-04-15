import type { TUserId, TContractId, TContractRole } from '@sh3pherd/shared-types';

declare global {
  namespace Express {
    // Declaration merging requires an interface here.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      cookies: Record<string, string>;
      user_id: TUserId;
      contract_id: TContractId;
      contract_roles: TContractRole[];
    }
  }
}

export {};
