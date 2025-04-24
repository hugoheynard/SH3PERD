import { jest } from '@jest/globals';
import type {
    TComparePassword,
    TCreateAuthSession,
    TFindUserByEmail,
    TLoginRequestDTO,
    TLoginResponseDTO,
    TLoginUseCaseDeps,
    TUserDomainModel
} from "@sh3pherd/shared-types";
import {createLoginUseCase} from "../createLoginUseCase.js";

describe('loginUseCase', () => {
    const mockUser: TUserDomainModel = {
        user_id: 'user_user123',
        email: 'test@example.com',
        password: 'hashed-password',
        created_at: new Date(),
        updated_at: new Date(),
    };

    const findUserByEmailFn = jest.fn<TFindUserByEmail>().mockResolvedValue(mockUser);
    const comparePasswordFn= jest.fn<TComparePassword>().mockResolvedValue({ isValid: true, wasRehashed: false });
    const createAuthSessionFn = jest.fn<TCreateAuthSession>().mockResolvedValue({
        authToken: 'jwt-token',
        refreshToken: 'refreshToken_test',
    });

    const deps: TLoginUseCaseDeps = {
        findUserByEmailFn,
        comparePasswordFn,
        createAuthSessionFn,
    };

    const useCase = createLoginUseCase(deps);

    it('should return tokens and user_id if credentials are valid', async () => {
        const request: TLoginRequestDTO = {
            email: 'test@example.com',
            password: 'my-password',
        };

        const result: TLoginResponseDTO = await useCase(request);

        expect(result).toEqual({
            authToken: 'jwt-token',
            refreshToken: 'refreshToken_test',
            user_id: 'user_user123'
        });

        expect(deps.findUserByEmailFn).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(deps.comparePasswordFn).toHaveBeenCalledWith({
            password: 'my-password',
            hashedPassword: 'hashed-password'
        });
        expect(deps.createAuthSessionFn).toHaveBeenCalledWith({ user_id: 'user_user123' });
    });

    it('should throw if user is not found', async () => {
        deps.findUserByEmailFn = jest.fn<TFindUserByEmail>().mockResolvedValue(null);

        await expect(useCase({ email: 'not@found.com', password: 'x' }))
            .rejects
            .toThrow('Invalid credentials');
    });

    it('should throw if password is invalid', async () => {
        deps.findUserByEmailFn = jest.fn<TFindUserByEmail>().mockResolvedValue(mockUser);
        deps.comparePasswordFn = jest.fn<TComparePassword>().mockResolvedValue({ isValid: false, wasRehashed: false });

        await expect(useCase({ email: 'test@example.com', password: 'wrong' }))
            .rejects
            .toThrow('Invalid credentials');
    });
});
