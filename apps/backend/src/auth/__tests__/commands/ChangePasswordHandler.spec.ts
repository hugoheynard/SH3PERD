import {
  ChangePasswordCommand,
  ChangePasswordHandler,
} from '../../application/commands/ChangePasswordCommand.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

describe('ChangePasswordHandler', () => {
  const mockUserId = 'user_test-change-pw' as any;
  const mockUser = {
    id: mockUserId,
    email: 'test@test.com',
    password: 'hashed_old_password',
    active: true,
  };

  const userCredRepo = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };
  const passwordService = {
    comparePassword: jest.fn(),
    hashPassword: jest.fn(),
  };
  const refreshTokenRepo = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  let handler: ChangePasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ChangePasswordHandler(
      userCredRepo as any,
      passwordService as any,
      refreshTokenRepo as any,
    );
  });

  it('should change password and wipe all sessions', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    passwordService.comparePassword.mockResolvedValue({ isValid: true });
    passwordService.hashPassword.mockResolvedValue('hashed_new_password');
    userCredRepo.updateOne.mockResolvedValue(true);
    refreshTokenRepo.deleteMany.mockResolvedValue(true);

    await handler.execute(new ChangePasswordCommand(mockUserId, 'OldPass1', 'NewPass1'));

    // Verify current password was checked
    expect(passwordService.comparePassword).toHaveBeenCalledWith({
      password: 'OldPass1',
      hashedPassword: 'hashed_old_password',
    });

    // Verify new password was hashed
    expect(passwordService.hashPassword).toHaveBeenCalledWith({ password: 'NewPass1' });

    // Verify password was persisted
    expect(userCredRepo.updateOne).toHaveBeenCalledWith({
      filter: { id: mockUserId },
      update: { $set: { password: 'hashed_new_password' } },
    });

    // Verify all sessions were invalidated
    expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: mockUserId });
  });

  it('should throw if user not found', async () => {
    userCredRepo.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new ChangePasswordCommand(mockUserId, 'OldPass1', 'NewPass1')),
    ).rejects.toThrow(BusinessError);
  });

  it('should throw if current password is wrong', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    passwordService.comparePassword.mockResolvedValue({ isValid: false });

    await expect(
      handler.execute(new ChangePasswordCommand(mockUserId, 'WrongPass1', 'NewPass1')),
    ).rejects.toThrow(BusinessError);

    // Must NOT invalidate sessions on failed attempt
    expect(refreshTokenRepo.deleteMany).not.toHaveBeenCalled();
  });

  it('should not persist new password if current password check fails', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    passwordService.comparePassword.mockResolvedValue({ isValid: false });

    await expect(
      handler.execute(new ChangePasswordCommand(mockUserId, 'WrongPass1', 'NewPass1')),
    ).rejects.toThrow();

    expect(passwordService.hashPassword).not.toHaveBeenCalled();
    expect(userCredRepo.updateOne).not.toHaveBeenCalled();
  });
});
