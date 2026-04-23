import {
  CreateRepertoireEntryCommand,
  CreateRepertoireEntryHandler,
} from '../CreateRepertoireEntryCommand.js';
import { refId, userId } from '../../../domain/__tests__/test-helpers.js';
import { mockAnalytics, mockQuotaService } from './handler-test-helpers.js';
import type { IMusicRepertoireRepository } from '../../../repositories/MusicRepertoireRepository.js';
import type {
  TCreateRepertoireEntryPayload,
  TMusicRepertoireEntryDomainModel,
} from '@sh3pherd/shared-types';

const payload: TCreateRepertoireEntryPayload = {
  musicReference_id: refId(),
};

function mockRepRepo(): jest.Mocked<
  Pick<IMusicRepertoireRepository, 'findByOwnerAndReference' | 'saveOne'>
> {
  return {
    findByOwnerAndReference: jest.fn(),
    saveOne: jest.fn(),
  };
}

function setup(
  opts: { existing?: TMusicRepertoireEntryDomainModel | null; persist?: boolean } = {},
) {
  const repRepo = mockRepRepo();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  repRepo.findByOwnerAndReference.mockResolvedValue(opts.existing ?? null);
  repRepo.saveOne.mockResolvedValue(opts.persist ?? true);

  const handler = new CreateRepertoireEntryHandler(
    repRepo as never,
    quota as never,
    analytics as never,
  );
  return { handler, repRepo, quota, analytics };
}

describe('CreateRepertoireEntryHandler', () => {
  it('returns the existing entry when user already has one for the reference', async () => {
    const existing = {
      id: 'repEntry_existing',
      owner_id: userId(),
      musicReference_id: refId(),
    } as TMusicRepertoireEntryDomainModel;

    const { handler, repRepo, quota, analytics } = setup({ existing });

    const result = await handler.execute(new CreateRepertoireEntryCommand(userId(), payload));

    expect(result).toBe(existing);
    expect(repRepo.saveOne).not.toHaveBeenCalled();
    expect(quota.ensureAllowed).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('gates on repertoire_entry quota before saving when no existing entry', async () => {
    const { handler, repRepo, quota } = setup();

    await handler.execute(new CreateRepertoireEntryCommand(userId(), payload));

    expect(quota.ensureAllowed).toHaveBeenCalledWith(userId(), 'repertoire_entry');
    expect(repRepo.saveOne).toHaveBeenCalledTimes(1);
  });

  it('persists the entry, records quota, emits repertoire_entry_created', async () => {
    const { handler, quota, analytics } = setup();

    const result = await handler.execute(new CreateRepertoireEntryCommand(userId(), payload));

    expect(result.owner_id).toBe(userId());
    expect(result.musicReference_id).toBe(refId());
    expect(quota.recordUsage).toHaveBeenCalledWith(userId(), 'repertoire_entry');
    expect(analytics.track).toHaveBeenCalledWith(
      'repertoire_entry_created',
      userId(),
      expect.objectContaining({ reference_id: refId() }),
    );
  });

  it('throws REPERTOIRE_ENTRY_CREATION_FAILED when persistence returns false', async () => {
    const { handler, quota, analytics } = setup({ persist: false });

    await expect(
      handler.execute(new CreateRepertoireEntryCommand(userId(), payload)),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'REPERTOIRE_ENTRY_CREATION_FAILED',
    });

    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('stops at quota — no save, no analytics', async () => {
    const { handler, repRepo, quota, analytics } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(new CreateRepertoireEntryCommand(userId(), payload)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(repRepo.saveOne).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
