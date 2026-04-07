import type { TUserId, TContractId, TContractRole } from '@sh3pherd/shared-types';

declare global {
  namespace Express {
    interface Request {
      cookies: Record<string, string>;
      user_id: TUserId;
      contract_id: TContractId;
      contract_roles: TContractRole[];
    }
  }
}

export {};
