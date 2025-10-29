import { z } from 'zod';
import type { TUserPreferencesDomainModel } from './user-preferences.js';
import type { TUserProfileDomainModel } from './user-profile.js';
import { createIdSchema } from '../utils/createIdSchema.js';

// USER ID
export const SUserId = createIdSchema('user');
export type TUserId = `user_${string}` | z.infer<typeof SUserId>;


/**
 * View model for the current user's profile and preferences.
 */
export type TUserMeViewModel =
  { user_id: TUserId }
& { profil: Omit<TUserProfileDomainModel, 'user_id'> }
& { preferences: Omit<TUserPreferencesDomainModel, 'user_id'> }








