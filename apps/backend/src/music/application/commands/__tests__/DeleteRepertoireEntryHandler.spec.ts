import {
  DeleteRepertoireEntryCommand,
  DeleteRepertoireEntryHandler,
} from '../DeleteRepertoireEntryCommand.js';
import {
  entryId,
  makeAggregate,
  makeAnalyzedTrack,
  makeVersion,
  refId,
  trackId,
  userId,
  versionId,
} from '../../../domain/__tests__/test-helpers.js';
import {
  mockAggregateRepo,
  mockAnalytics,
  mockQuotaService,
  mockStorage,
} from './handler-test-helpers.js';
import type { IMusicRepertoireRepository } from '../../../repositories/MusicRepertoireRepository.js';
import type {
  TMusicRepertoireEntryDomainModel,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

function analysedWithSize(id: ReturnType<typeof trackId>, bytes: number): TVersionTrackDomainModel {
  return { ...makeAnalyzedTrack(id), sizeBytes: bytes };
}

function mockRepRepo(): jest.Mocked<
  Pick<IMusicRepertoireRepository, 'findOneByEntryId' | 'deleteOneByEntryId'>
> {
  return {
    findOneByEntryId: jest.fn(),
    deleteOneByEntryId: jest.fn(),
  };
}

function setup(
  opts: {
    entry?: TMusicRepertoireEntryDomainModel | null;
    tracks?: TVersionTrackDomainModel[];
    deletePersist?: boolean;
  } = {},
) {
  const repRepo = mockRepRepo();
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  const owner = userId();

  const defaultEntry = {
    id: entryId(1),
    owner_id: owner,
    musicReference_id: refId(),
  } as TMusicRepertoireEntryDomainModel;

  repRepo.findOneByEntryId.mockResolvedValue(opts.entry === undefined ? defaultEntry : opts.entry);
  repRepo.deleteOneByEntryId.mockResolvedValue(opts.deletePersist ?? true);

  const v = makeVersion({ id: versionId(1), owner_id: owner });
  for (const t of opts.tracks ?? []) v.addTrack(t);
  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByOwnerAndReference.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new DeleteRepertoireEntryHandler(
    repRepo as never,
    aggregateRepo,
    storage as never,
    quota as never,
    analytics as never,
  );

  return { handler, repRepo, aggregateRepo, storage, quota, analytics, owner };
}

describe('DeleteRepertoireEntryHandler', () => {
  it('throws REPERTOIRE_ENTRY_NOT_FOUND when the entry is missing', async () => {
    const { handler, aggregateRepo, storage } = setup({ entry: null });

    await expect(
      handler.execute(new DeleteRepertoireEntryCommand(userId(), entryId(1))),
    ).rejects.toMatchObject({ name: 'BusinessError', code: 'REPERTOIRE_ENTRY_NOT_FOUND' });

    expect(aggregateRepo.loadByOwnerAndReference).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('throws REPERTOIRE_ENTRY_NOT_OWNED when the actor does not own the entry', async () => {
    const otherOwnerEntry = {
      id: entryId(1),
      owner_id: userId(2),
      musicReference_id: refId(),
    } as TMusicRepertoireEntryDomainModel;

    const { handler, aggregateRepo, storage } = setup({ entry: otherOwnerEntry });

    await expect(
      handler.execute(new DeleteRepertoireEntryCommand(userId(999), entryId(1))),
    ).rejects.toMatchObject({ name: 'BusinessError', code: 'REPERTOIRE_ENTRY_NOT_OWNED' });

    expect(aggregateRepo.loadByOwnerAndReference).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('cascades: saves aggregate, deletes entry row, cleans S3, credits quotas', async () => {
    const { handler, repRepo, aggregateRepo, storage, quota, owner } = setup({
      tracks: [analysedWithSize(trackId(1), 1500), analysedWithSize(trackId(2), 2500)],
    });

    const result = await handler.execute(new DeleteRepertoireEntryCommand(owner, entryId(1)));

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(repRepo.deleteOneByEntryId).toHaveBeenCalledWith(entryId(1));
    expect(storage.delete).toHaveBeenCalledTimes(2);
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', -4000);
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'repertoire_entry', -1);
    expect(result).toBe(true);
  });

  it('skips storage_bytes credit when no track has sizeBytes', async () => {
    const { handler, quota, owner } = setup({ tracks: [makeAnalyzedTrack(trackId(1))] });

    await handler.execute(new DeleteRepertoireEntryCommand(owner, entryId(1)));

    expect(quota.recordUsage).not.toHaveBeenCalledWith(owner, 'storage_bytes', expect.any(Number));
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'repertoire_entry', -1);
  });

  it('swallows S3 deletion failures and still returns success', async () => {
    const { handler, storage, owner } = setup({
      tracks: [analysedWithSize(trackId(1), 100), analysedWithSize(trackId(2), 100)],
    });
    storage.delete.mockRejectedValueOnce(new Error('S3 down'));

    const result = await handler.execute(new DeleteRepertoireEntryCommand(owner, entryId(1)));

    expect(result).toBe(true);
    expect(storage.delete).toHaveBeenCalledTimes(2);
  });

  it('emits repertoire_entry_deleted with counts only when the entry was truly deleted', async () => {
    const { handler, analytics, owner } = setup({
      tracks: [analysedWithSize(trackId(1), 200), analysedWithSize(trackId(2), 300)],
    });

    await handler.execute(new DeleteRepertoireEntryCommand(owner, entryId(1)));

    expect(analytics.track).toHaveBeenCalledWith(
      'repertoire_entry_deleted',
      owner,
      expect.objectContaining({
        entry_id: entryId(1),
        reference_id: refId(),
        version_count: 1,
        total_size_bytes: 500,
      }),
    );
  });

  it('does not emit analytics when the entry row delete returns false', async () => {
    const { handler, analytics, owner } = setup({
      tracks: [analysedWithSize(trackId(1), 100)],
      deletePersist: false,
    });

    const result = await handler.execute(new DeleteRepertoireEntryCommand(owner, entryId(1)));

    expect(result).toBe(false);
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
