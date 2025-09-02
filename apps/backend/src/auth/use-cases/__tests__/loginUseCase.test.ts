import { jest } from '@jest/globals';

import { createLoginUseCase } from '../createLoginUseCase.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';
import type { TUserCredentialsRecord } from '../../../user/types/user.domain.types';
import type { TCreateAuthSessionResult } from '../../types/auth.domain.tokens';
import type { TLoginRequestDTO } from '../../../../dist/auth/zodSchemas/loginRequestDTOSchema';
import type { TFindUserCredentialsByEmailFn } from '../../../user/types/user.credentials.contracts.js';
import type { TComparePassword, TCreateAuthSessionFn } from '../../types/auth.core.contracts';
import type { TLoginUseCaseDeps } from '../../types/auth.core.useCase';

describe('createLoginUseCase', () => {
  const mockUser: TUserCredentialsRecord = {
    user_id: 'user_123',
    email: 'test@example.com',
    password: 'hashed-password',
    created_at: new Date(),
    updated_at: new Date(),
    active: true,
    email_verified: true,
  };

  const mockSession: TCreateAuthSessionResult = {
    authToken: 'jwt-token',
    refreshToken: 'refreshToken_refresh-token',
    refreshTokenSecureCookie: {
      name: 'sh3pherd_refreshToken',
      value: 'refreshToken_refresh-token',
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 604800,
      },
    },
  };

  const request: TLoginRequestDTO = {
    email: 'test@example.com',
    password: 'clear-password',
  };

  const findUserByEmailFn = jest.fn<TFindUserCredentialsByEmailFn>();
  const comparePasswordFn = jest.fn<TComparePassword>();
  const createAuthSessionFn = jest.fn<TCreateAuthSessionFn>();

  const deps: TLoginUseCaseDeps = {
    findUserByEmailFn,
    comparePasswordFn,
    createAuthSessionFn,
  };

  const useCase = createLoginUseCase(deps);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return auth session if user and password are valid', async () => {
    findUserByEmailFn.mockResolvedValueOnce(mockUser);
    comparePasswordFn.mockResolvedValueOnce({ isValid: true, wasRehashed: false });
    createAuthSessionFn.mockResolvedValueOnce(mockSession);

    const result = await useCase(request);

    expect(result).toEqual({
      authToken: 'jwt-token',
      user_id: 'user_123',
      refreshTokenSecureCookie: mockSession.refreshTokenSecureCookie,
    });

    expect(findUserByEmailFn).toHaveBeenCalledWith({ email: request.email });
    expect(comparePasswordFn).toHaveBeenCalledWith({
      password: request.password,
      hashedPassword: mockUser.password,
    });
    expect(createAuthSessionFn).toHaveBeenCalledWith({ user_id: mockUser.user_id });
  });

  it('should throw BusinessError if user is not found', async () => {
    findUserByEmailFn.mockResolvedValueOnce(null);

    await expect(useCase(request)).rejects.toThrow(BusinessError);
    await expect(useCase(request)).rejects.toThrow('Invalid credentials');
  });

  it('should throw BusinessError if password is invalid', async () => {
    findUserByEmailFn.mockResolvedValueOnce(mockUser);
    comparePasswordFn.mockResolvedValueOnce({ isValid: false, wasRehashed: false });

    await expect(useCase(request)).rejects.toThrow(BusinessError);
    await expect(useCase(request)).rejects.toThrow('Invalid credentials');
  });
});
