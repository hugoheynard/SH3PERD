import type { TUserId, TUserProfileRecord } from '@sh3pherd/shared-types';




// Repo Functions Type
export type TSaveUserProfileFn = (input: TUserProfileRecord) => Promise<boolean>;
export type TFindUserProfileByUserIdFn = (input: { user_id: TUserId }) => Promise<TUserProfileRecord | null>;

