export interface IRegistrationService{
    input: {
        generateUserIdFunction: () => string;
        hashPasswordFunction: (input: { password: string }) => Promise<string>;
        createUserFunction: (input: {}) => Promise<void>; // ou Result<User>
        saveUserFunction: (input: {
            user_id: string;
            email: string;
            hashedPassword: string;
            created_at: Date;
            updated_at: Date;
        }) => Promise<void>; // ou Result<User>
        findUserByEmailFunction: (input: { email: string }) => Promise<any>; // ou Result<User>

    },
    output: {
        getUserLoginByEmail: (input: { email: string }) => Promise<any>;
        registerUser: (input: { email: string; password: string }) => Promise<{ user_id: string }>;
        //manualRegistration: (input: { email: string; password: string; }) => Promise<InsertOneResult>;
    }
}