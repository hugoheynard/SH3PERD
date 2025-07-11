import { z } from 'zod';

export type TUserId = z.infer<typeof SUserId>;

export const SUserId = z.string().regex(
  /^user_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid user_id format' }
);