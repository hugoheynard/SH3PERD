import type { TUserDomainModel } from './user.domain.types.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';

export type TSaveUserFn = (input: { user: TUserDomainModel }) => Promise<boolean>;
export type TFindUserByEmailFn = (filter: { email: string }) => Promise<TUserDomainModel | null>;

export type TUserMongoRepositoryDeps = TBaseMongoRepoDeps;

export type IUserRepository = {
  saveUser: TSaveUserFn;
  findUserByEmail: TFindUserByEmailFn;
};
