export type CreateUserInput = {
    email: string;
    password: string; // hashed
    generateUserId: () => string;
};

export type User = {
    user_id: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};