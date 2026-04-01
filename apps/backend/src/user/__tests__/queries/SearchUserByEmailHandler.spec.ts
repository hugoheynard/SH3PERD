import { SearchUserByEmailQuery, SearchUserByEmailHandler } from '../../application/query/SearchUserByEmailQuery.js';
import { userId, makeCredentialsRecord, makeProfileRecord, mockCredsRepo, mockProfileRepo } from '../test-helpers.js';

describe('SearchUserByEmailHandler', () => {
  const credsRepo = mockCredsRepo();
  const profileRepo = mockProfileRepo();
  const handler = new SearchUserByEmailHandler(credsRepo, profileRepo);

  const email = 'found@example.com';
  const uid = userId();

  beforeEach(() => jest.clearAllMocks());

  it('should return user search result when email exists', async () => {
    const creds = makeCredentialsRecord({ id: uid, email });
    const profile = makeProfileRecord({ user_id: uid, first_name: 'Jane', last_name: 'Doe' });

    credsRepo.findOne.mockResolvedValue(creds);
    profileRepo.findOne.mockResolvedValue(profile);

    const result = await handler.execute(new SearchUserByEmailQuery(email));

    expect(result).toEqual({
      user_id: uid,
      email,
      first_name: 'Jane',
      last_name: 'Doe',
    });
  });

  it('should return null when email not found', async () => {
    credsRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new SearchUserByEmailQuery('nope@example.com'));

    expect(result).toBeNull();
    expect(profileRepo.findOne).not.toHaveBeenCalled();
  });

  it('should return result with undefined names when profile not found', async () => {
    const creds = makeCredentialsRecord({ id: uid, email });
    credsRepo.findOne.mockResolvedValue(creds);
    profileRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new SearchUserByEmailQuery(email));

    expect(result).toEqual({
      user_id: uid,
      email,
      first_name: undefined,
      last_name: undefined,
    });
  });
});
