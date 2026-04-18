import type { ConfigService } from '@nestjs/config';
import { ForgotPasswordCommand, ForgotPasswordHandler } from '../ForgotPasswordCommand.js';

describe('ForgotPasswordHandler', () => {
  const mockUser = {
    id: 'user_test-forgot' as any,
    email: 'test@test.com',
    password: 'hashed',
    active: true,
  };

  const mockProfile = {
    id: 'userProfile_test-forgot',
    user_id: mockUser.id,
    first_name: 'Ada',
    last_name: 'Lovelace',
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

  const userProfileRepo = {
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

  const mailer = {
    enabled: true,
    send: jest.fn().mockResolvedValue(undefined),
  };

  const config = {
    get: jest.fn((key: string) => (key === 'frontendUrl' ? 'https://app.test' : undefined)),
  } as unknown as ConfigService;

  let handler: ForgotPasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    userProfileRepo.findOne.mockResolvedValue(mockProfile);
    mailer.send.mockResolvedValue(undefined);
    handler = new ForgotPasswordHandler(
      userCredRepo as any,
      userProfileRepo as any,
      resetTokenRepo as any,
      mailer as any,
      config,
    );
  });

  it('creates a hashed reset token and dispatches the email when user exists', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);

    await handler.execute(new ForgotPasswordCommand('test@test.com'));

    // Should delete previous tokens
    expect(resetTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: mockUser.id });

    // Should save a new token
    expect(resetTokenRepo.save).toHaveBeenCalledTimes(1);
    const saved = resetTokenRepo.save.mock.calls[0][0];
    expect(saved.user_id).toBe(mockUser.id);
    expect(saved.token).toHaveLength(64); // SHA-256 hex
    expect(saved.usedAt).toBeNull();
    expect(saved.expiresAt).toBeInstanceOf(Date);

    // Should dispatch the email with a URL containing the RAW (unhashed) token
    expect(mailer.send).toHaveBeenCalledTimes(1);
    const payload = mailer.send.mock.calls[0][0];
    expect(payload.to).toBe(mockUser.email);
    expect(payload.template).toBe('password-reset');
    expect(payload.data.firstName).toBe('Ada');
    expect(payload.data.resetUrl).toContain('https://app.test/reset-password?token=');
    expect(payload.data.resetUrl).toContain(encodeURIComponent(saved.id));
    expect(payload.data.expiresAt).toBe(saved.expiresAt);
  });

  it('falls back to a neutral greeting when the profile is missing', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    userProfileRepo.findOne.mockResolvedValue(null);

    await handler.execute(new ForgotPasswordCommand('test@test.com'));

    expect(mailer.send.mock.calls[0][0].data.firstName).toBe('there');
  });

  it('silently succeeds when user does not exist (no email enumeration)', async () => {
    userCredRepo.findOne.mockResolvedValue(null);

    // Should NOT throw
    await handler.execute(new ForgotPasswordCommand('unknown@test.com'));

    // Should NOT create any token and NOT send anything
    expect(resetTokenRepo.save).not.toHaveBeenCalled();
    expect(resetTokenRepo.deleteMany).not.toHaveBeenCalled();
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('silently succeeds when user is deactivated', async () => {
    userCredRepo.findOne.mockResolvedValue({ ...mockUser, active: false });

    await handler.execute(new ForgotPasswordCommand('test@test.com'));

    expect(resetTokenRepo.save).not.toHaveBeenCalled();
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('swallows mailer failures so the public endpoint cannot leak existence', async () => {
    userCredRepo.findOne.mockResolvedValue(mockUser);
    mailer.send.mockRejectedValue(new Error('Resend outage'));

    // Must resolve — any throw here would surface as a different HTTP shape
    // than the "unknown user" branch and enable email enumeration.
    await expect(
      handler.execute(new ForgotPasswordCommand('test@test.com')),
    ).resolves.toBeUndefined();

    // Token IS still persisted — a retry can pick up with resend-verification
    expect(resetTokenRepo.save).toHaveBeenCalledTimes(1);
  });

  it('defaults the frontend URL to localhost when config is missing', async () => {
    const fallbackConfig = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const handlerNoFE = new ForgotPasswordHandler(
      userCredRepo as any,
      userProfileRepo as any,
      resetTokenRepo as any,
      mailer as any,
      fallbackConfig,
    );
    userCredRepo.findOne.mockResolvedValue(mockUser);

    await handlerNoFE.execute(new ForgotPasswordCommand('test@test.com'));

    expect(mailer.send.mock.calls[0][0].data.resetUrl).toContain('http://localhost:4200');
  });
});
