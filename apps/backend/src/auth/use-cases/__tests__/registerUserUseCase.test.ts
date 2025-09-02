import { jest } from '@jest/globals';
import type { TUserCredentialsRecord, TUserId } from '../../../user/types/user.domain.types';
import type { TRegisterUserUseCaseDeps } from '../../types/auth.core.useCase';
import type {
  TCreateUserCredentialRecordFn,
  TFindUserCredentialsByEmailFn,
  TSaveUserCredentialsFn,
} from '../../../user/types/user.credentials.contracts.js';
import type { THashPasswordFn } from '../../types/auth.core.contracts';
import { createRegisterUserUseCase } from '../createRegisterUserUseCase';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';

describe('createRegisterUserUseCase', () => {
  const email = 'new@example.com';
  const password = 'securePassword';
  const hashedPassword = 'hashed_password';
  const generatedUserId: TUserId = 'user_123';

  const domainUser: TUserCredentialsRecord = {
    user_id: generatedUserId,
    email,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const deps: TRegisterUserUseCaseDeps = {
    findUserByEmailFn: jest.fn<TFindUserCredentialsByEmailFn>().mockResolvedValue(null),
    hashPasswordFn: jest.fn<THashPasswordFn>().mockResolvedValue(hashedPassword),
    createUserFn: jest.fn<TCreateUserCredentialRecordFn>().mockReturnValue(domainUser),
    saveUserFn: jest.fn<TSaveUserCredentialsFn>().mockResolvedValue(false),
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
    deps.findUserByEmailFn = jest.fn<TFindUserCredentialsByEmailFn>().mockResolvedValue(domainUser);
    const useCaseWithTakenEmail = createRegisterUserUseCase(deps);

    await expect(useCaseWithTakenEmail({ email, password })).rejects.toThrow(
      new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409),
    );
  });
});
