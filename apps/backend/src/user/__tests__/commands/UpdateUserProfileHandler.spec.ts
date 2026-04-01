import { UpdateUserProfileCommand, UpdateUserProfileHandler } from '../../application/commands/UpdateUserProfileCommand.js';
import { userId, makeProfileRecord, mockProfileRepo } from '../test-helpers.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';

describe('UpdateUserProfileHandler', () => {
  const profileRepo = mockProfileRepo();
  const handler = new UpdateUserProfileHandler(profileRepo);

  const ownerId = userId(1);
  const record = makeProfileRecord({ user_id: ownerId });

  beforeEach(() => jest.clearAllMocks());

  it('should rename profile when actor is owner', async () => {
    profileRepo.findOne.mockResolvedValue(record);
    profileRepo.updateOne.mockResolvedValue({ ...record, first_name: 'Updated', last_name: 'Name' } as any);

    const cmd = new UpdateUserProfileCommand({ actor_id: ownerId }, ownerId, {
      first_name: 'Updated',
      last_name: 'Name',
    });

    const result = await handler.execute(cmd);

    expect(profileRepo.findOne).toHaveBeenCalledWith({ filter: { user_id: ownerId } });
    expect(profileRepo.updateOne).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw when profile not found', async () => {
    profileRepo.findOne.mockResolvedValue(null);

    const cmd = new UpdateUserProfileCommand({ actor_id: ownerId }, ownerId, {
      first_name: 'A',
      last_name: 'B',
    });

    await expect(handler.execute(cmd)).rejects.toThrow(BusinessError);
  });

  it('should throw when actor is not the profile owner', async () => {
    profileRepo.findOne.mockResolvedValue(record);
    const otherId = userId(2);

    const cmd = new UpdateUserProfileCommand({ actor_id: otherId }, ownerId, {
      first_name: 'A',
      last_name: 'B',
    });

    await expect(handler.execute(cmd)).rejects.toThrow(DomainError);
  });

  it('should return existing record if no changes detected', async () => {
    const rec = makeProfileRecord({ user_id: ownerId, first_name: 'Same', last_name: 'Name' });
    profileRepo.findOne.mockResolvedValue(rec);

    const cmd = new UpdateUserProfileCommand({ actor_id: ownerId }, ownerId, {
      first_name: 'Same',
      last_name: 'Name',
    });

    const result = await handler.execute(cmd);

    expect(profileRepo.updateOne).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
