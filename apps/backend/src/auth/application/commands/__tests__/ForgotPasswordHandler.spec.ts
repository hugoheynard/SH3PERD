import { ForgotPasswordCommand, ForgotPasswordHandler } from '../ForgotPasswordCommand.js';

describe('ForgotPasswordHandler', () => {
  const mockUser = {
    id: 'user_test-forgot' as any,
    email: 'test@test.com',
    password: 'hashed',
    active: true,
  };

  const userCredRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    startSession: jest.fn(),
  };

  const resetTokenRepo = {
    findOne: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
    findMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
  };

  let handler: ForgotPasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ForgotPasswordHandler(userCredRepo as any, resetTokenRepo as any);
  });

  it('should create a hashed reset token when user exists', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);

    await handler.execute(new ForgotPasswordCommand('test@test.com'));

    // Should delete previous tokens
    expect(resetTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: mockUser.id });

    // Should save a new token
    expect(resetTokenRepo.save).toHaveBeenCalledTimes(1);
    const saved = resetTokenRepo.save.mock.calls[0][0];
    expect(saved.user_id).toBe(mockUser.id);
    expect(saved.token).toBeDefined();
    expect(saved.token).toHaveLength(64); // SHA-256 hex
    expect(saved.usedAt).toBeNull();
    expect(saved.expiresAt).toBeInstanceOf(Date);
  });

  it('should silently succeed when user does not exist (no email enumeration)', async () => {
    userCredRepo.findOne.mockResolvedValue(null);

    // Should NOT throw
    await handler.execute(new ForgotPasswordCommand('unknown@test.com'));

    // Should NOT create any token
    expect(resetTokenRepo.save).not.toHaveBeenCalled();
    expect(resetTokenRepo.deleteMany).not.toHaveBeenCalled();
  });

  it('should silently succeed when user is deactivated', async () => {
    userCredRepo.findOne.mockResolvedValue({ ...mockUser, active: false });

    await handler.execute(new ForgotPasswordCommand('test@test.com'));

    expect(resetTokenRepo.save).not.toHaveBeenCalled();
  });
});
