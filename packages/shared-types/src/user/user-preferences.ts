import type { TContractId } from '../contracts.domain.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import { z } from 'zod';
import type { TUserId } from './user.domain.js';
import { createIdSchema } from '../utils/createIdSchema.js';


//ID
export const SUserPreferencesId = createIdSchema('userPreferences');
export type TUserPreferencesId = `userPreferences_${string}` | z.infer<typeof SUserPreferencesId>;


export type TUserPreferencesDomainModel = {
  id: TUserPreferencesId;
  user_id: TUserId;
  preferences: {
    theme: 'light' | 'dark';
    contract_workspace: TContractId;
  }
};

export type TUserPreferencesRecord = TUserPreferencesDomainModel & TRecordMetadata;


//DTO
export type TUpdateUserPreferencesRequestDTO = {
  update: Partial<TUserPreferencesDomainModel>
};