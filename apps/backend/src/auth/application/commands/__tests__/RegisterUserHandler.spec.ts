import { RegisterUserCommand, RegisterUserHandler } from '../RegisterUserCommand.js';
import {
  mockPasswordService,
  mockUserCredentialsRepo,
  mockUserProfileRepo,
  mockPlatformContractRepo,
} from '../../../__tests__/test-helpers.js';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';

describe('RegisterUserHandler', () => {
  function createHandler() {
    const passwordService = mockPasswordService();
    const userCredsRepo = mockUserCredentialsRepo();
    const userProfileRepo = mockUserProfileRepo();
    const platformContractRepo = mockPlatformContractRepo();
    const eventBus = { publish: jest.fn() };

    // Simulate startSession + withTransaction
    const mockSession = {
      withTransaction: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
      endSession: jest.fn(),
    };
    (userCredsRepo.startSession as jest.Mock).mockReturnValue(mockSession);

    const handler = new (RegisterUserHandler as any)(
      passwordService,
      userCredsRepo,
      userProfileRepo,
      platformContractRepo,
      eventBus,
    ) as RegisterUserHandler;

    return {
      handler,
      passwordService,
      userCredsRepo,
      userProfileRepo,
      platformContractRepo,
      eventBus,
      mockSession,
    };
  }

  const validPayload = {
    email: 'new@example.com',
    password: 'StrongPass123!',
    first_name: 'John',
    last_name: 'Doe',
    account_type: 'artist' as const,
  };

  describe('execute — success', () => {
    it('should hash the password and save credentials + profile in a transaction', async () => {
      const { handler, passwordService, userCredsRepo, userProfileRepo, mockSession } =
        createHandler();
      userCredsRepo.findOne.mockResolvedValue(null); // no existing user

      const result = await handler.execute(new RegisterUserCommand(validPayload));

      // Password was hashed
      expect(passwordService.hashPassword).toHaveBeenCalledWith({
        password: validPayload.password,
      });

      // Transaction was used
      expect(userCredsRepo.startSession).toHaveBeenCalled();
      expect(mockSession.withTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      // Both repos received save calls
      expect(userCredsRepo.save).toHaveBeenCalled();
      expect(userProfileRepo.save).toHaveBeenCalled();

      // Result contains user credentials domain model
      expect(result).toBeDefined();
      expect(result.email).toBe(validPayload.email);
      expect(result.id).toMatch(/^userCredential_/);
    });

    it('should emit UserRegisteredEvent after successful registration', async () => {
      const { handler, userCredsRepo, eventBus } = createHandler();
      userCredsRepo.findOne.mockResolvedValue(null);

      await handler.execute(new RegisterUserCommand(validPayload));

      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      const event = eventBus.publish.mock.calls[0][0];
      expect(event.email).toBe(validPayload.email);
      expect(event.firstName).toBe(validPayload.first_name);
      expect(event.lastName).toBe(validPayload.last_name);
      expect(event.userId).toMatch(/^userCredential_/);
    });
  });

  describe('execute — duplicate email', () => {
    it('should throw USER_ALREADY_EXISTS (409)', async () => {
      const { handler, userCredsRepo } = createHandler();
      userCredsRepo.findOne.mockResolvedValue({ id: 'user_existing', email: validPayload.email });

      try {
        await handler.execute(new RegisterUserCommand(validPayload));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).code).toBe('USER_ALREADY_EXISTS');
        expect((e as BusinessError).status).toBe(409);
      }
    });

    it('should NOT hash password or save anything when email exists', async () => {
      const { handler, userCredsRepo, passwordService, userProfileRepo, eventBus } =
        createHandler();
      userCredsRepo.findOne.mockResolvedValue({ id: 'user_existing', email: validPayload.email });

      try {
        await handler.execute(new RegisterUserCommand(validPayload));
      } catch {
        // expected
      }

      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(userCredsRepo.save).not.toHaveBeenCalled();
      expect(userProfileRepo.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
});
