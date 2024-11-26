import { JWT_module } from "../tools/login/JWT_Module.js";
export const authenticationService = (input) => {
    const { collection, verifyPasswordFunction, generateTokenFunction, checkAuthTokenValidityFunction } = input;
    const userExists = async (input) => {
        try {
            const user = await collection.findOne({ 'email': input.email });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (err) {
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
            }
            catch (err) {
                throw new Error(`Authentication failed: ${err.message}`);
            }
        },
        async autoLog(input) {
            return checkAuthTokenValidityFunction(input.authToken).isValid;
        }
    };
};
//# sourceMappingURL=authenticationService.js.map