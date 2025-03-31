export type User = {
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

export type CreateUserFunction = (input: CreateUserInput) => User;

