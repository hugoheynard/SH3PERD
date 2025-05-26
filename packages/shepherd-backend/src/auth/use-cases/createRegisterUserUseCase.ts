import type {TRegisterUserUseCase, TRegisterUserUseCaseDeps} from "../types/auth.core.useCase.js";
import {BusinessError} from "../../utils/errorManagement/errorClasses/BusinessError.js";


/**
 * createRegisterUserUseCase - Handles user registration logic.
 *
 * This use case is responsible for orchestrating the full registration process:
 * - Verifies email uniqueness
 * - Generates a user ID
 * - Hashes the password
 * - Constructs a domain user object
 * - Persists the user in the database
 *
 * @param deps - All injected dependencies required to perform the registration:
 *   - `findUserByEmailFn`: checks if the email is already in use
 *   - `hashPasswordFn`: hashes the provided password securely
 *   - `createUserFn`: builds the user domain model
 *   - `saveUserFn`: persists the user into the database
 *   - `generateUserIdFn`: generates a unique typed user ID
 *
 * @returns An async function that takes user credentials and returns the new user ID
 *
 * @throws `BusinessError` if the email is already used
 *
 * @example
 * const useCase = createRegisterUserUseCase(deps);
 * const { user_id } = await useCase({ email: 'a@test.com', password: 'secure' });
 */
export const createRegisterUserUseCase = (deps: TRegisterUserUseCaseDeps): TRegisterUserUseCase =>

    async (request) => {
        const { findUserByEmailFn, hashPasswordFn, createUserFn, saveUserFn, generateUserIdFn } = deps;

        const existing = await findUserByEmailFn({ email: request.email });

        if (existing) {
            throw new BusinessError('Email already in use', 'USER_ALREADY_EXISTS', 409);
        }

        const user = createUserFn({
            user_id: generateUserIdFn(),
            email: request.email,
            password: await hashPasswordFn({ password: request.password }),
        });

        await saveUserFn({ user });

        return { user_id: user.user_id };
};
