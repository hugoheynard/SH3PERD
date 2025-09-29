import type { TUserCredentialsRecord, TUserId, TUserMeViewModel} from '@sh3pherd/shared-types';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';

export type TSaveUserCredentialsFn = (input: { user: TUserCredentialsRecord }) => Promise<boolean>;
export type TFindUserCredentialsByEmailFn = (filter: { email: string }) => Promise<TUserCredentialsRecord | null>;

export type TUserCredentialsMongoRepositoryDeps = TBaseMongoRepoDeps;

export type IUserCredentialsRepository = {
  saveUser: TSaveUserCredentialsFn;
  findUserByEmail: TFindUserCredentialsByEmailFn;
  getUserMe: (user_id: TUserId) => Promise<TUserMeViewModel>;
};

export type TCreateUserCredentialsInput = {
  email: string;
  password: string;
  user_id: TUserId;
};

export type TCreateUserCredentialRecordFn = (input: TCreateUserCredentialsInput) => TUserCredentialsRecord;