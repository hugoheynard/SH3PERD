import { LoginCommand, LoginHandler } from '../../application/commands/LoginCommand';
import {
  userId,
  mockUserCredentialsRepo,
  mockPasswordService,
  mockAuthService,
  makeSessionResult,
} from '../test-helpers';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

describe('LoginHandler', () => {
  function createHandler() {
    const userCredRepo = mockUserCredentialsRepo();
    const passwordService = mockPasswordService();
    const authService = mockAuthService();

    const handler = new (LoginHandler as any)(userCredRepo, passwordService, authService) as LoginHandler;
    return { handler, userCredRepo, passwordService, authService };
  }

  const validUser = {
    id: userId(),
    email: 'test@example.com',
    password: 'hashed-password',
    active: true,
    email_verified: true,
  };

  describe('execute', () => {
    it('should return auth token and user_id on successful login', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      const result = await handler.execute(
        new LoginCommand({ email: 'test@example.com', password: 'correct' }),
      );

      expect(result.authToken).toBeDefined();
      expect(result.user_id).toBe(validUser.id);
      expect(result.refreshTokenSecureCookie).toBeDefined();
    });

    it('should throw INVALID_CREDENTIALS when user is not found', async () => {
      const { handler, userCredRepo } = createHandler();
      userCredRepo.findOne.mockResolvedValue(null);

      await expect(
        handler.execute(new LoginCommand({ email: 'unknown@test.com', password: 'any' })),
      ).rejects.toThrow(BusinessError);

      try {
        await handler.execute(new LoginCommand({ email: 'unknown@test.com', password: 'any' }));
      } catch (e) {
        expect((e as BusinessError).errorCode).toBe('INVALID_CREDENTIALS');
        expect((e as BusinessError).statusCode).toBe(400);
      }
    });

    it('should throw USER_DEACTIVATED when user account is inactive', async () => {
      const { handler, userCredRepo } = createHandler();
      userCredRepo.findOne.mockResolvedValue({ ...validUser, active: false });

      try {
        await handler.execute(
          new LoginCommand({ email: 'test@example.com', password: 'correct' }),
        );
        fail('Should have thrown');
      } catch (e) {
        expect((e as BusinessError).errorCode).toBe('USER_DEACTIVATED');
        expect((e as BusinessError).statusCode).toBe(403);
      }
    });

    it('should throw INVALID_CREDENTIALS when password is wrong', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: false, wasRehashed: false });

      try {
        await handler.execute(
          new LoginCommand({ email: 'test@example.com', password: 'wrong' }),
        );
        fail('Should have thrown');
      } catch (e) {
        expect((e as BusinessError).errorCode).toBe('INVALID_CREDENTIALS');
      }
    });

    it('should create auth session with the user id', async () => {
      const { handler, userCredRepo, passwordService, authService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      await handler.execute(
        new LoginCommand({ email: 'test@example.com', password: 'correct' }),
      );

      expect(authService.createAuthSession).toHaveBeenCalledWith({ user_id: validUser.id });
    });
  });
});
