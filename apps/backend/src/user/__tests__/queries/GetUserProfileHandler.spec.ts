import { GetUserProfileQuery, GetUserProfileHandler } from '../../application/query/GetUserProfileQuery.js';
import { userId, makeProfileRecord, mockProfileRepo } from '../test-helpers.js';

describe('GetUserProfileHandler', () => {
  const profileRepo = mockProfileRepo();
  const handler = new GetUserProfileHandler(profileRepo);

  const uid = userId();

  beforeEach(() => jest.clearAllMocks());

  it('should return profile when found', async () => {
    const profile = makeProfileRecord({ user_id: uid });
    profileRepo.findOne.mockResolvedValue(profile);

    const result = await handler.execute(new GetUserProfileQuery({ actor_id: uid }, uid));

    expect(profileRepo.findOne).toHaveBeenCalledWith({ filter: { user_id: uid } });
    expect(result).toEqual(profile);
  });

  it('should return null when profile not found', async () => {
    profileRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new GetUserProfileQuery({ actor_id: uid }, uid));

    expect(result).toBeNull();
  });
});
