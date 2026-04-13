import { z } from 'zod';
import type { TUserId } from './user/user.domain.js';

// ─── Domain model ──────────────────────────────────────────

export type TPasswordResetTokenRecord = {
  id: string;
  /** SHA-256 hash of the raw token (raw token is sent via email/console) */
  token: string;
  user_id: TUserId;
  expiresAt: Date;
  createdAt: Date;
  /** Set when the token is consumed — prevents reuse */
  usedAt: Date | null;
};

// ─── Request DTOs ──────────────────────────────────────────

export const SForgotPasswordRequestDTO = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
});
export type TForgotPasswordRequestDTO = z.infer<typeof SForgotPasswordRequestDTO>;

export const SResetPasswordRequestDTO = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});
export type TResetPasswordRequestDTO = z.infer<typeof SResetPasswordRequestDTO>;
