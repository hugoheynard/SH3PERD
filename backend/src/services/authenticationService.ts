import type {Collection} from "mongodb";
import {type AuthTokenDecoded} from "../tools/login/JWT_Module";
import type {User} from "../interfaces/User";

export interface AuthServiceInput {
    collection: Collection<User>,
    verifyPasswordFunction: (input: { password: string, storedHash: string }) => Promise<boolean>,
    generateTokenFunction: (input: { payload: { id: string; email: string } }) => Promise<string>;
    checkAuthTokenValidityFunction: (input: { jwt: string }) => AuthTokenDecoded,
}

export interface AuthService {
    login: (input: LoginInput) => Promise<string>;
    autoLog: (input: { jwt: string }) => boolean;
}

interface LoginInput {
    email: string;
    password: string;
}

export const authenticationService = (input: AuthServiceInput): AuthService => {
    const {collection, verifyPasswordFunction, generateTokenFunction, checkAuthTokenValidityFunction} = input;

    const userExists = async (input:{ email: string }): Promise<User>  => {
        try {
            const user = await collection.findOne({'email': input.email});

            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (err: any) {
            if (err.message.includes('User not found')) {
                throw new Error(err.message);
            }
            console.error('Database or unexpected error:', err.message);
            throw new Error('Error checking user existence');
        }
    };

    return {
        async login(input) {
            try {
                const user = await userExists({ email: input.email });
                const storedPass = user.login.inApp.password;

                const validPassword = await verifyPasswordFunction({ password: input.password, storedHash: storedPass });

                if (!validPassword) {
                    throw new Error('Invalid password');
                }

                return await generateTokenFunction({
                    payload: {
                        id: user._id.toString(),
                        email: user.email
                    }
                });
            } catch (err: any) {
                throw new Error(`Authentication failed: ${err.message}`);
            }
        },

        autoLog(input) {
            return checkAuthTokenValidityFunction({ jwt: input.jwt }).isValid;
        }
    };
}