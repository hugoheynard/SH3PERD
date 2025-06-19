import type { TUserId } from '../user/types/user.domain.types';

declare global {
  namespace Express {
    interface Request {
      cookies: Record<string, string>;
      user_id?: TUserId;
    }
  }
}

export {};
