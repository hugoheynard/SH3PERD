import type {TUserDomainModel, TUserId} from "./user.domain.types.js";

export type TCreateUserInput = {
    email: string;
    password: string; // hashed
    user_id: TUserId;
};

export type TCreateUserFn = (input: TCreateUserInput) => TUserDomainModel;

