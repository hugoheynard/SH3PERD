import {jest} from '@jest/globals';
import {RegisterService} from "../RegisterService";
import type {UserId} from "@sh3pherd/domain-user/dist/types/types";

describe('RegistrationService', () => {
    const mockGenerateUserId = jest.fn((): UserId  => 'user_fake-id-123');
    const mockHashPassword = jest.fn(async ({ password }) => `hashed-${password}`);
    const mockCreateUser = jest.fn(({ email, password, user_id }) => ({
        email,
        password,
        user_id,
        created_at: new Date(),
        updated_at: new Date(),
    }));
    const mockSaveUser = jest.fn(async () => {});
    const mockFindUser = jest.fn(async ({ email }) => ({ email, user_id: 'user_fake-id-123' }));

    const registrationService = new RegisterService({
        generateUserIdFunction: mockGenerateUserId,
        hashPasswordFunction: mockHashPassword,
        createUserFunction: mockCreateUser,
        saveUserFunction: mockSaveUser,
        findUserByEmailFunction: mockFindUser,
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
