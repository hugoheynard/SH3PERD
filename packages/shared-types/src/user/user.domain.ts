import { z } from 'zod';
import type { TUserPreferencesDomainModel } from './user-preferences.js';
import type { TUserProfileDomainModel } from './user-profile.js';

// USER ID
export const SUserId = z.string().regex(/^user_[a-zA-Z0-9_-]+$/, { message: 'Invalid user_id format' });
export type TUserId = `user_${string}` | z.infer<typeof SUserId>;


/**
 * View model for the current user's profile and preferences.
 */
export type TUserMeViewModel =
  { user_id: TUserId }
& { profil: Omit<TUserProfileDomainModel, 'user_id'> }
& { preferences: Omit<TUserPreferencesDomainModel, 'user_id'> }







export const SUserGroupId = z.string().regex(/^userGroup_[a-zA-Z0-9_-]+$/, { message: 'Invalid userGroup_id format' } );


