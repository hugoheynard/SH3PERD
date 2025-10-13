import { jest } from '@jest/globals';
import { logoutUseCaseFactory } from '../logoutUseCaseFactory.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';

describe('createLogoutUseCase', () => {
  const deleteRefreshTokenFn = jest.fn();
  const deleteAllRefreshTokensForUserFn = jest.fn();

  const logout = logoutUseCaseFactory({
    deleteOneFn: deleteRefreshTokenFn,
    deleteManyFn: deleteAllRefreshTokensForUserFn,
  });

  const validRefreshToken = 'refreshToken_valid';
  const invalidRefreshToken = 'refreshToken_invalid';
  const userId = 'user_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should revoke a valid refresh token', async () => {
    deleteRefreshTokenFn.mockResolvedValueOnce(true);

    await expect(logout({ refreshToken: validRefreshToken })).resolves.toBe(true);

    expect(deleteRefreshTokenFn).toHaveBeenCalledWith({ refreshToken: validRefreshToken });
    expect(deleteAllRefreshTokensForUserFn).not.toHaveBeenCalled();
  });

  it('should fallback to delete all tokens if refresh token is invalid but user_id is provided', async () => {
    deleteRefreshTokenFn.mockResolvedValueOnce(false);
    deleteAllRefreshTokensForUserFn.mockResolvedValueOnce(true);

    await expect(logout({ refreshToken: invalidRefreshToken, user_id: userId })).resolves.toBe(
      true,
    );

    expect(deleteRefreshTokenFn).toHaveBeenCalledWith({ refreshToken: invalidRefreshToken });
    expect(deleteAllRefreshTokensForUserFn).toHaveBeenCalledWith({ user_id: userId });
  });

  it('should throw if refresh token is invalid and user_id is missing', async () => {
    deleteRefreshTokenFn.mockResolvedValueOnce(false);

    await expect(logout({ refreshToken: invalidRefreshToken })).rejects.toThrow(BusinessError);

    expect(deleteAllRefreshTokensForUserFn).not.toHaveBeenCalled();
  });

  it('should delete all refresh tokens for a user if only user_id is provided', async () => {
    deleteAllRefreshTokensForUserFn.mockResolvedValueOnce(true);

    await expect(logout({ user_id: userId })).resolves.toBe(true);

    expect(deleteRefreshTokenFn).not.toHaveBeenCalled();
    expect(deleteAllRefreshTokensForUserFn).toHaveBeenCalledWith({ user_id: userId });
  });

  it('should throw if neither refreshToken nor user_id is provided', async () => {
    await expect(logout({} as any)).rejects.toThrow(BusinessError);

    expect(deleteRefreshTokenFn).not.toHaveBeenCalled();
    expect(deleteAllRefreshTokensForUserFn).not.toHaveBeenCalled();
  });
});
