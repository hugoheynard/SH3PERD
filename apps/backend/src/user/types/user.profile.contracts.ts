import type {
  TUserId,
  TUserProfileRecord
} from '@sh3pherd/shared-types';


// USER PROFILE
export type TCreateUserProfileFn = any;

// Repo Functions Type
export type TSaveUserProfileFn = (input: TUserProfileRecord) => Promise<boolean>;
export type TFindUserProfileByUserIdFn = (input: { user_id: TUserId }) => Promise<TUserProfileRecord | null>;

export interface IUserProfileRepository {
  saveUserProfile: TSaveUserProfileFn;
  findUserProfileByUserId: TFindUserProfileByUserIdFn;
}