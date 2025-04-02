export type UserDomainModel = {
    user_id: UserId;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

export type UserId = `user_${string}`;

export type CreateUserInput = {
    email: string;
    password: string; // hashed
    user_id: UserId;
};

export type CreateUserFunction = (input: CreateUserInput) => UserDomainModel;
export type TSaveUserResult = {
    success: boolean;
    reason?: string;
}
export type TSaveUserFunction = (input: { user: UserDomainModel }) => Promise<TSaveUserResult>;
export type TFindUserByEmailFunction = (input: { email: string }) => Promise<UserDomainModel | null>;

export interface IUserRepository {
    saveUser: TSaveUserFunction;
    findUserByEmail: TFindUserByEmailFunction;
}



