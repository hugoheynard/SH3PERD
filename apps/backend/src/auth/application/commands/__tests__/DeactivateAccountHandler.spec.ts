import { DeactivateAccountCommand, DeactivateAccountHandler } from '../DeactivateAccountCommand.js';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';

describe('DeactivateAccountHandler', () => {
  const mockUserId = 'userCredential_test-deactivate' as any;
  const mockUser = {
    id: mockUserId,
    email: 'test@test.com',
    password: 'hashed_password',
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

  let handler: DeactivateAccountHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new DeactivateAccountHandler(
      userCredRepo as any,
      passwordService as any,
      refreshTokenRepo as any,
    );
  });

  it('should set active=false and wipe all sessions when password is correct', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    passwordService.comparePassword.mockResolvedValue({ isValid: true });
    userCredRepo.updateOne.mockResolvedValue(true);
    refreshTokenRepo.deleteMany.mockResolvedValue(true);

    await handler.execute(new DeactivateAccountCommand(mockUserId, 'CorrectPass1'));

    // Verify password was checked
    expect(passwordService.comparePassword).toHaveBeenCalledWith({
      password: 'CorrectPass1',
      hashedPassword: 'hashed_password',
    });

    // Verify account was deactivated
    expect(userCredRepo.updateOne).toHaveBeenCalledWith({
      filter: { id: mockUserId },
      update: { $set: { active: false } },
    });

    // Verify all sessions were invalidated
    expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: mockUserId });
  });

  it('should throw INVALID_PASSWORD when password is wrong', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    passwordService.comparePassword.mockResolvedValue({ isValid: false });

    await expect(
      handler.execute(new DeactivateAccountCommand(mockUserId, 'WrongPass1')),
    ).rejects.toThrow(BusinessError);

    // Must NOT deactivate or wipe sessions
    expect(userCredRepo.updateOne).not.toHaveBeenCalled();
    expect(refreshTokenRepo.deleteMany).not.toHaveBeenCalled();
  });

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    userCredRepo.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new DeactivateAccountCommand(mockUserId, 'AnyPass1')),
    ).rejects.toThrow(BusinessError);

    expect(passwordService.comparePassword).not.toHaveBeenCalled();
    expect(userCredRepo.updateOne).not.toHaveBeenCalled();
  });
});
