import type { TLoginUseCaseFactory } from "@sh3pherd/shared-types";

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
export const createLoginUseCase: TLoginUseCaseFactory = (deps) =>

    async (request) => {

        const user = await deps.findUserByEmailFn({ email: request.email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await deps.comparePasswordFn({
            password: request.password,
            hashedPassword: user.password
        });
        if (isPasswordValid.isValid === false) {
            throw new Error('Invalid credentials');
        }

        const session = await deps.createAuthSessionFn({ user_id: user.user_id });

        return {
            authToken: session.authToken,
            refreshToken: session.refreshToken,
            user_id: user.user_id
        };
};