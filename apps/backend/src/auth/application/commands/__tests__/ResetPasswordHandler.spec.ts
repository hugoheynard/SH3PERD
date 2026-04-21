import { ResetPasswordCommand, ResetPasswordHandler } from '../ResetPasswordCommand.js';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';
import { hashToken } from '../../../core/token-manager/hashToken.js';

describe('ResetPasswordHandler', () => {
  const mockUserId = 'userCredential_test-reset' as any;
  const rawToken = 'pwReset_abc-123';
  const hashedToken = hashToken(rawToken);

  const validRecord = {
    id: rawToken,
    token: hashedToken,
    user_id: mockUserId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h from now
    createdAt: new Date(),
    usedAt: null,
  };

  const resetTokenRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    updateOne: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    startSession: jest.fn(),
  };

  const userCredRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    updateOne: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    startSession: jest.fn(),
  };

  const passwordService = {
    hashPassword: jest.fn().mockResolvedValue('new-hashed-password'),
    comparePassword: jest.fn(),
  };

  const refreshTokenRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
  };

  let handler: ResetPasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ResetPasswordHandler(
      resetTokenRepo as any,
      userCredRepo as any,
      passwordService as any,
      refreshTokenRepo as any,
    );
  });

  it('should reset password and wipe sessions with a valid token', async () => {
    resetTokenRepo.findOne.mockResolvedValue(validRecord);

    await handler.execute(new ResetPasswordCommand(rawToken, 'NewPass123'));

    // Should hash new password
    expect(passwordService.hashPassword).toHaveBeenCalledWith({ password: 'NewPass123' });

    // Should persist new password + reset lockout
    expect(userCredRepo.updateOne).toHaveBeenCalledWith({
      filter: { id: mockUserId },
      update: {
        $set: { password: 'new-hashed-password', failed_login_count: 0, locked_until: null },
      },
    });

    // Should mark token as used
    expect(resetTokenRepo.updateOne).toHaveBeenCalledWith({
      filter: { token: hashedToken },
      update: { $set: { usedAt: expect.any(Date) } },
    });

    // Should wipe all sessions
    expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: mockUserId });
  });

  it('should throw INVALID_RESET_TOKEN when token not found', async () => {
    resetTokenRepo.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new ResetPasswordCommand('pwReset_invalid', 'NewPass123')),
    ).rejects.toThrow(BusinessError);
  });

  it('should throw RESET_TOKEN_EXPIRED when token is expired', async () => {
    resetTokenRepo.findOne.mockResolvedValue({
      ...validRecord,
      expiresAt: new Date(Date.now() - 1000), // expired
    });

    try {
      await handler.execute(new ResetPasswordCommand(rawToken, 'NewPass123'));
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(BusinessError);
      expect((e as BusinessError).code).toBe('RESET_TOKEN_EXPIRED');
    }
  });

  it('should throw RESET_TOKEN_USED when token was already consumed', async () => {
    resetTokenRepo.findOne.mockResolvedValue({
      ...validRecord,
      usedAt: new Date(), // already used
    });

    try {
      await handler.execute(new ResetPasswordCommand(rawToken, 'NewPass123'));
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(BusinessError);
      expect((e as BusinessError).code).toBe('RESET_TOKEN_USED');
    }
  });

  it('should NOT persist password if token validation fails', async () => {
    resetTokenRepo.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new ResetPasswordCommand(rawToken, 'NewPass123')),
    ).rejects.toThrow();

    expect(passwordService.hashPassword).not.toHaveBeenCalled();
    expect(userCredRepo.updateOne).not.toHaveBeenCalled();
    expect(refreshTokenRepo.deleteMany).not.toHaveBeenCalled();
  });
});
