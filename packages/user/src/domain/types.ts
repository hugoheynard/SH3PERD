export type TUserId = `user_${string}`;

export type TUserDomainModel = {
    user_id: TUserId;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

export type CreateUserInput = {
    email: string;
    password: string; // hashed
    user_id: TUserId;
};

export type CreateUserFunction = (input: CreateUserInput) => TUserDomainModel;
export type TSaveUserResult = {
    success: boolean;
    reason?: string;
}
export type TSaveUser = (input: { user: TUserDomainModel }) => Promise<TSaveUserResult>;
export type TFindUserByEmail = (input: { email: string }) => Promise<TUserDomainModel | null>;

export interface IUserRepository {
    saveUser: TSaveUser;
    findUserByEmail: TFindUserByEmail;
}



