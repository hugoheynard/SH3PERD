import { jest } from '@jest/globals';
import type { TUserCredentialsRecord, TUserId } from '../../../user/types/user.domain.types';
import type {
  TCreateUserCredentialRecordFn,

} from '../../../user/types/user.credentials.contracts.js';
import type { THashPasswordFn } from '../../types/auth.core.contracts';
import { registerUserUseCaseFactory, type TRegisterUserUseCaseDeps } from '../old/registerUserUseCaseFactory.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';
import type {
  TFindUserCredentialsByEmailFn,
  TSaveUserCredentialsFn,
} from '../../../user/credentials/UserCredentialsMongoRepo.repository.js';

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
    findOneFn: jest.fn<TFindUserCredentialsByEmailFn>().mockResolvedValue(null),
    hashPasswordFn: jest.fn<THashPasswordFn>().mockResolvedValue(hashedPassword),
    createUserFn: jest.fn<TCreateUserCredentialRecordFn>().mockReturnValue(domainUser),
    saveFn: jest.fn<TSaveUserCredentialsFn>().mockResolvedValue(false),
    generateUserIdFn: jest.fn<any>().mockReturnValue(generatedUserId),
  };

  const useCase = registerUserUseCaseFactory(deps);

  it('should register user successfully when email is unique', async () => {
    const request: TRegisterRequestDTO = { email, password };

    const result = await useCase(request);

    expect(deps.findOneFn).toHaveBeenCalledWith({ email });
    expect(deps.hashPasswordFn).toHaveBeenCalledWith({ password });
    expect(deps.createUserFn).toHaveBeenCalledWith({
      user_id: generatedUserId,
      email,
      password: hashedPassword,
    });
    expect(deps.saveFn).toHaveBeenCalledWith({ user: domainUser });
    expect(result).toEqual({ user_id: generatedUserId });
  });

  it('should throw BusinessError if email already exists', async () => {
    deps.findOneFn = jest.fn<TFindUserCredentialsByEmailFn>().mockResolvedValue(domainUser);
    const useCaseWithTakenEmail = registerUserUseCaseFactory(deps);

    await expect(useCaseWithTakenEmail({ email, password })).rejects.toThrow(
      new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409),
    );
  });
});
