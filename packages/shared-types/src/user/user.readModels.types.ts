import { z } from 'zod';
import { SUserPreferencesDomainModel, type TUserPreferencesDomainModel } from './user-preferences.js';
import { SUserProfileDomainModel, type TUserProfileDomainModel } from './user-profile.js';
import { SUserId, type TUserId } from './user.domain.js';
import { createApiResponseSchema } from '../api.types.js';


/**
 * View model for the current user's profile and preferences.
 */
export const SUserMeViewModel = z.object({
  user_id: SUserId,
  profil: SUserProfileDomainModel.omit({ id: true, user_id: true }),
  preferences: SUserPreferencesDomainModel.omit({ id: true, user_id: true }),
});

export type TUserMeViewModel =
  { user_id: TUserId }
  & { profil: Omit<TUserProfileDomainModel, 'user_id'> }
  & { preferences: Omit<TUserPreferencesDomainModel, 'user_id'> };


export const SGetUserMeResponseDTO = createApiResponseSchema(SUserMeViewModel);