import type {
    TRegisterUserUseCaseDeps,
    TUserDomainModel,
    TUserId, TFindUserByEmailFn, THashPasswordFn, TSaveUserFn, TCreateUserFn, TRegisterRequestDTO
} from '@sh3pherd/shared-types';
import { BusinessError } from '@sh3pherd/shared-utils';
import { jest } from '@jest/globals';
import {createRegisterUserUseCase} from "../createRegisterUserUseCase.js";

describe('createRegisterUserUseCase', () => {
    const email = 'new@example.com';
    const password = 'securePassword';
    const hashedPassword = 'hashed_password';
    const generatedUserId: TUserId = 'user_123';

    const domainUser: TUserDomainModel = {
        user_id: generatedUserId,
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const deps: TRegisterUserUseCaseDeps = {
        findUserByEmailFn: jest.fn<TFindUserByEmailFn>().mockResolvedValue(null),
        hashPasswordFn: jest.fn<THashPasswordFn>().mockResolvedValue(hashedPassword),
        createUserFn: jest.fn<TCreateUserFn>().mockReturnValue(domainUser),
        saveUserFn: jest.fn<TSaveUserFn>().mockResolvedValue(false),
        generateUserIdFn: jest.fn<any>().mockReturnValue(generatedUserId),
    };

    const useCase = createRegisterUserUseCase(deps);

    it('should register user successfully when email is unique', async () => {
        const request: TRegisterRequestDTO = { email, password };

        const result = await useCase(request);

        expect(deps.findUserByEmailFn).toHaveBeenCalledWith({ email });
        expect(deps.hashPasswordFn).toHaveBeenCalledWith({ password });
        expect(deps.createUserFn).toHaveBeenCalledWith({
            user_id: generatedUserId,
            email,
            password: hashedPassword,
        });
        expect(deps.saveUserFn).toHaveBeenCalledWith({ user: domainUser });
        expect(result).toEqual({ user_id: generatedUserId });
    });

    it('should throw BusinessError if email already exists', async () => {
        deps.findUserByEmailFn = jest.fn<TFindUserByEmailFn>().mockResolvedValue(domainUser);
        const useCaseWithTakenEmail = createRegisterUserUseCase(deps);

        await expect(useCaseWithTakenEmail({ email, password }))
            .rejects
            .toThrow(new BusinessError('Email already in use', 'USER_ALREADY_EXISTS', 409));
    });
});
