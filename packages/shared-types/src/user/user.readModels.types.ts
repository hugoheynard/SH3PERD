import { z } from 'zod';
import { SUserPreferencesDomainModel, type TUserPreferencesDomainModel } from './user-preferences.js';
import { SUserProfileDomainModel, type TUserProfileDomainModel } from './user-profile.js';
import { SUserId, type TUserId } from './user.domain.js';


/**
 * View model for the current user's profile and preferences.
 */
export const SUserMeViewModel = z.object({
  id: SUserId,
  profile: SUserProfileDomainModel.omit({ id: true, user_id: true }),
  preferences: SUserPreferencesDomainModel.omit({ id: true, user_id: true }),
});

export type TUserMeViewModel =
  { id: TUserId }
  & { profile: Omit<TUserProfileDomainModel, 'user_id'> }
  & { preferences: Omit<TUserPreferencesDomainModel, 'user_id'> };

/**
 * Lightweight user result returned by email search or invite.
 */
export type TUserSearchResult = {
  user_id: TUserId;
  email:   string;
  first_name?: string;
  last_name?:  string;
};


