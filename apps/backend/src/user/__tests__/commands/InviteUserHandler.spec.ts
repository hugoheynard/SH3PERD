import { InviteUserCommand, InviteUserHandler } from '../../application/commands/InviteUserCommand.js';
import {
  userId,
  makeCredentialsRecord,
  mockCredsRepo,
  mockProfileRepo,
  mockPasswordService,
} from '../test-helpers.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

describe('InviteUserHandler', () => {
  const credsRepo = mockCredsRepo();
  const profileRepo = mockProfileRepo();
  const passwordService = mockPasswordService();

  const handler = new InviteUserHandler(passwordService, credsRepo, profileRepo);

  const dto = { email: 'new@example.com', first_name: 'Jane', last_name: 'Doe' };
  const actorId = userId(99);

  beforeEach(() => jest.clearAllMocks());

  it('should create credentials and profile in a transaction', async () => {
    const mockSession = { withTransaction: jest.fn((cb: any) => cb()), endSession: jest.fn() };
    credsRepo.startSession.mockResolvedValue(mockSession as any);
    credsRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new InviteUserCommand(dto, actorId));

    expect(credsRepo.findOne).toHaveBeenCalledWith({ filter: { email: dto.email } });
    expect(passwordService.hashPassword).toHaveBeenCalled();
    expect(mockSession.withTransaction).toHaveBeenCalled();
    expect(credsRepo.save).toHaveBeenCalled();
    expect(profileRepo.save).toHaveBeenCalled();
    expect(result.email).toBe(dto.email);
    expect(result.first_name).toBe(dto.first_name);
    expect(result.last_name).toBe(dto.last_name);
    expect(result.user_id).toMatch(/^userCredential_/);
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should throw if email already exists', async () => {
    credsRepo.findOne.mockResolvedValue(makeCredentialsRecord({ email: dto.email }));

    await expect(handler.execute(new InviteUserCommand(dto, actorId)))
      .rejects.toThrow(BusinessError);
  });

  it('should not save anything if email already exists', async () => {
    credsRepo.findOne.mockResolvedValue(makeCredentialsRecord({ email: dto.email }));

    try { await handler.execute(new InviteUserCommand(dto, actorId)); } catch {}

    expect(credsRepo.save).not.toHaveBeenCalled();
    expect(profileRepo.save).not.toHaveBeenCalled();
  });

  it('should end session even if transaction fails', async () => {
    const mockSession = {
      withTransaction: jest.fn().mockRejectedValue(new Error('tx fail')),
      endSession: jest.fn(),
    };
    credsRepo.startSession.mockResolvedValue(mockSession as any);
    credsRepo.findOne.mockResolvedValue(null);

    await expect(handler.execute(new InviteUserCommand(dto, actorId)))
      .rejects.toThrow('tx fail');

    expect(mockSession.endSession).toHaveBeenCalled();
  });
});
