import type {TLoginUseCase, TLoginUseCaseDeps} from "../types/auth.core.useCase.js";
import {BusinessError} from "../../utils/errorManagement/errorClasses/BusinessError.js";


/**
 * loginUseCase - Handles user authentication using email and password.
 *
 * This function orchestrates the login process:
 * - Looks up the user by email
 * - Verifies the password using the injected hashing service
 * - Creates a full authentication session (access + refresh tokens)
 *
 * @param deps - The injected dependencies:
 *   - findUserByEmailFn: retrieves a user by email
 *   - comparePasswordFn: verifies password against hash
 *   - createAuthSessionFn: generates access and refresh tokens
 *
 * @returns A function that takes a LoginRequestDTO and returns a LoginResponseDTO
 *
 * @throws Error if credentials are invalid (email not found or password mismatch)
 *
 * @example
 * const useCase = loginUseCase({ findUserByEmailFn, comparePasswordFn, createAuthSessionFn });
 * const result = await useCase({ email: 'a@test.com', password: 'secret' });
 */
export const createLoginUseCase = (deps: TLoginUseCaseDeps): TLoginUseCase =>

    async (request) => {
        const { email, password } = request;

        const user = await deps.findUserByEmailFn({ email });
        if (!user) {
            throw new BusinessError('Invalid credentials', 'INVALID_CREDENTIALS', 400);
        }

        const { isValid } = await deps.comparePasswordFn({
            password,
            hashedPassword: user.password
        });
        if (!isValid) {
            throw new BusinessError('Invalid credentials', 'INVALID_CREDENTIALS', 400);
        }

        const session = await deps.createAuthSessionFn({ user_id: user.user_id });

        return {
            authToken: session.authToken,
            user_id: user.user_id,
            refreshTokenSecureCookie: session.refreshTokenSecureCookie,
        };
};