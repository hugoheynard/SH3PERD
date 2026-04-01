import {
  GetCurrentUserViewModelQuery,
  GetCurrentUserViewModelHandler,
} from '../../application/query/GetCurrentUserViewModel.js';
import {
  userId,
  makeCredentialsRecord,
  makeProfileRecord,
  makePreferencesRecord,
  mockCredsRepo,
  mockProfileRepo,
  mockPrefsRepo,
} from '../test-helpers.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

describe('GetCurrentUserViewModelHandler', () => {
  const credsRepo = mockCredsRepo();
  const profileRepo = mockProfileRepo();
  const prefsRepo = mockPrefsRepo();

  const handler = new GetCurrentUserViewModelHandler(credsRepo, profileRepo, prefsRepo);

  const uid = userId();

  beforeEach(() => jest.clearAllMocks());

  it('should return a composed view model from all 3 repos', async () => {
    const creds = makeCredentialsRecord({ id: uid });
    const profile = makeProfileRecord({ user_id: uid });
    const prefs = makePreferencesRecord({ user_id: uid });

    credsRepo.findOne.mockResolvedValue(creds);
    profileRepo.findOne.mockResolvedValue(profile);
    prefsRepo.findOne.mockResolvedValue(prefs);

    const result = await handler.execute(new GetCurrentUserViewModelQuery(uid));

    expect(result.id).toBe(uid);
    expect(result.profile).toEqual(profile);
    expect(result.preferences).toEqual(prefs);
  });

  it('should throw if credentials not found', async () => {
    credsRepo.findOne.mockResolvedValue(null);

    await expect(handler.execute(new GetCurrentUserViewModelQuery(uid)))
      .rejects.toThrow(BusinessError);
  });

  it('should return undefined profile/preferences when they dont exist', async () => {
    credsRepo.findOne.mockResolvedValue(makeCredentialsRecord({ id: uid }));
    profileRepo.findOne.mockResolvedValue(null);
    prefsRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new GetCurrentUserViewModelQuery(uid));

    expect(result.id).toBe(uid);
    expect(result.profile).toBeUndefined();
    expect(result.preferences).toBeUndefined();
  });

  it('should query all 3 repos in parallel with correct filters', async () => {
    credsRepo.findOne.mockResolvedValue(makeCredentialsRecord({ id: uid }));
    profileRepo.findOne.mockResolvedValue(null);
    prefsRepo.findOne.mockResolvedValue(null);

    await handler.execute(new GetCurrentUserViewModelQuery(uid));

    expect(credsRepo.findOne).toHaveBeenCalledWith({ filter: { id: uid } });
    expect(profileRepo.findOne).toHaveBeenCalledWith({ filter: { user_id: uid } });
    expect(prefsRepo.findOne).toHaveBeenCalledWith({ filter: { user_id: uid } });
  });
});
