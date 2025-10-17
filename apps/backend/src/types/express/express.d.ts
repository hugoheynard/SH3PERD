import type { TUserId } from '@sh3pherd/shared-types';

declare global {
  namespace Express {
    interface Request {
      cookies: Record<string, string>;
      user_id: TUserId;
      contract_id: TContractId;
    }
  }
}

export {};
