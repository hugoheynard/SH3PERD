import type {TFindUserByEmail, TUserDomainModel} from '@sh3pherd/user';
import { jest } from '@jest/globals';
import type {LoginRequestDTO, LoginResponseDTO, LoginUseCaseDeps} from "../loginUseCase";
import {loginUseCase} from "../loginUseCase";
import type {TCreateAuthSession} from "packages/auth/src/domain/authFunctions.types";
import type {TComparePassword} from "@sh3pherd/auth";

describe('loginUseCase', () => {
    const mockUser: TUserDomainModel = {
        user_id: 'user_user123',
        email: 'test@example.com',
        password: 'hashed-password',
        created_at: new Date(),
        updated_at: new Date(),
    };

    const findUserByEmailFn: TFindUserByEmail = jest.fn().mockResolvedValue(mockUser);
    const comparePasswordFn: TComparePassword = jest.fn().mockResolvedValue(true);
    const createAuthSessionFn: TCreateAuthSession = jest.fn().mockResolvedValue({
        authToken: 'jwt-token',
        refreshToken: 'refresh-token',
    });

    const deps: LoginUseCaseDeps = {
        findUserByEmailFn,
        comparePasswordFn,
        createAuthSessionFn,
    };

    const useCase = loginUseCase(deps);

    it('should return tokens and user_id if credentials are valid', async () => {
        const request: LoginRequestDTO = {
            email: 'test@example.com',
            password: 'my-password'
        };

        const result: LoginResponseDTO = await useCase(request);

        expect(result).toEqual({
            authToken: 'jwt-token',
            refreshToken: 'refresh-token',
            user_id: 'user123'
        });

        expect(deps.findUserByEmailFn).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(deps.comparePasswordFn).toHaveBeenCalledWith({
            password: 'my-password',
            hashedPassword: 'hashed-password'
        });
        expect(deps.createAuthSessionFn).toHaveBeenCalledWith({ user_id: 'user123' });
    });

    it('should throw if user is not found', async () => {
        deps.findUserByEmailFn = jest.fn().mockResolvedValue(null);

        await expect(useCase({ email: 'not@found.com', password: 'x' }))
            .rejects
            .toThrow('Invalid credentials');
    });

    it('should throw if password is invalid', async () => {
        deps.findUserByEmailFn = jest.fn().mockResolvedValue(mockUser);
        deps.comparePasswordFn = jest.fn().mockResolvedValue(false);

        await expect(useCase({ email: 'test@example.com', password: 'wrong' }))
            .rejects
            .toThrow('Invalid credentials');
    });
});
