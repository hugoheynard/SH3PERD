import type { TContractId } from '../contracts.domain.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import { z } from 'zod';
import type { TUserId } from './user.domain.js';

//ID
export const SUserPreferencesId = z.string().regex(/^userPreferences_[a-zA-Z0-9_-]+$/, { message: 'Invalid userPreferences_id format' });
export type TUserPreferencesId = `userPreferences_${string}` | z.infer<typeof SUserPreferencesId>;


export type TUserPreferencesDomainModel = {
  userPreferences_id: TUserPreferencesId;
  user_id: TUserId;
  preferences: {
    theme: 'light' | 'dark';
    contract_workspace: TContractId;
  }
};

export type TUserPreferencesRecord = TUserPreferencesDomainModel & TRecordMetadata;


//DTO
export type TUpdateUserPreferencesDTO = Partial<TUserPreferencesDomainModel>
