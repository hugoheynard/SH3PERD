export type TUserId = `user_${string}`;

export type TUserDomainModel = {
    user_id: TUserId;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

