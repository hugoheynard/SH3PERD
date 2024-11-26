import type {Collection} from "mongodb";
import {type AuthTokenDecoded, JWT_module} from "../tools/login/JWT_Module";

export interface AuthService {
    collection: Collection,
    verifyPasswordFunction: (input: { password: string, storedHash: string }) => Promise<boolean>,
    generateTokenFunction: (input: { payload: { id: string; email: string } }) => Promise<string>;
    checkAuthTokenValidityFunction: (input: { authToken: string }) => AuthTokenDecoded,
}

interface LoginInput {
    email: string;
    password: string;
}

export const authenticationService = (input: AuthService): any => {
    const {collection, verifyPasswordFunction, generateTokenFunction, checkAuthTokenValidityFunction} = input;

    const userExists = async (input: { email: string }): Promise<any> => {
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
        async login(input: LoginInput): Promise<string> {
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

        async autoLog(input: { authToken: string }): boolean {
            return checkAuthTokenValidityFunction(input.authToken).isValid;
        }
    };
}