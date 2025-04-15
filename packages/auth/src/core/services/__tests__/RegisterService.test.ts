import {jest} from '@jest/globals';
import {RegisterService} from "../RegisterService";
import type {TSaveUserResult, TUserDomainModel, UserId} from "@sh3pherd/user";


describe('RegistrationService', () => {
    const mockGenerateUserId = jest.fn((): UserId  => 'user_fake-id-123');
    const mockHashPassword = jest.fn(async ({ password }): Promise<string> => `hashed-${password}`);
    const mockCreateUser = jest.fn(({ email, password, user_id }): TUserDomainModel => ({
        email,
        password,
        user_id,
        created_at: new Date(),
        updated_at: new Date(),
    }));
    const mockSaveUser = jest.fn(async (): Promise<TSaveUserResult> => {
        return { success: true };
    });
    const mockFindUser = jest.fn(async ({ email }): Promise<TUserDomainModel> => ({
        email,
        user_id: 'user_fake-id-123',
        password: 'hashed-securepassword',
        created_at: new Date(),
        updated_at: new Date(),
    }));

    const registrationService = new RegisterService({
        generateUserIdFn: mockGenerateUserId,
        hashPasswordFn: mockHashPassword,
        createUserFn: mockCreateUser,
        saveUserFn: mockSaveUser,
        findUserByEmailFn: mockFindUser,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registerUser should hash password, create and save user, and return user_id', async () => {
        const result = await registrationService.registerUser({
            email: 'test@example.com',
            password: 'securepassword',
        });

        expect(mockHashPassword).toHaveBeenCalledWith({ password: 'securepassword' });
        expect(mockGenerateUserId).toHaveBeenCalled();
        expect(mockCreateUser).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'hashed-securepassword',
            user_id: 'user_fake-id-123',
        });
        expect(mockSaveUser).toHaveBeenCalled();
        expect(result).toEqual({ user_id: 'user_fake-id-123' });
    });

    it('getUserLoginByEmail should call findUserByEmailFunction and return user', async () => {
        const result = await registrationService.getUserByEmail({
            email: 'test@example.com',
        });

        expect(mockFindUser).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(result).toEqual({ email: 'test@example.com', user_id: 'user_fake-id-123' });
    });
});
