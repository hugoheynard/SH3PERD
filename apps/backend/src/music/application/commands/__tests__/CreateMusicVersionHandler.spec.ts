import {
  CreateMusicVersionCommand,
  CreateMusicVersionHandler,
} from '../CreateMusicVersionCommand.js';
import {
  makeAggregate,
  refId,
  userId,
  GENRE,
  VERSION_TYPE,
} from '../../../domain/__tests__/test-helpers.js';
import {
  mockAggregateRepo,
  mockQuotaService,
  mockAnalytics,
  mockTransactionRunner,
} from './handler-test-helpers.js';
import { TechnicalError } from '../../../../utils/errorManagement/TechnicalError.js';
import type { TMusicRating, TCreateMusicVersionPayload } from '@sh3pherd/shared-types';

const basePayload: TCreateMusicVersionPayload = {
  musicReference_id: refId(),
  label: 'Acoustic',
  genre: GENRE.Pop,
  type: VERSION_TYPE.Cover,
  bpm: 120,
  pitch: null,
  mastery: 3 as TMusicRating,
  energy: 3 as TMusicRating,
  effort: 2 as TMusicRating,
};

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const tx = mockTransactionRunner();

  const handler = new CreateMusicVersionHandler(
    aggregateRepo,
    quota as never,
    analytics as never,
    tx as never,
  );

  const aggregate = makeAggregate({ owner: userId() });
  aggregateRepo.loadByOwnerAndReference.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  return { handler, aggregateRepo, quota, analytics, tx, aggregate };
}

describe('CreateMusicVersionHandler', () => {
  it('creates the version, persists via a transaction, records quota and emits analytics', async () => {
    const { handler, aggregateRepo, quota, analytics, tx } = setup();

    const result = await handler.execute(new CreateMusicVersionCommand(userId(), basePayload));

    expect(quota.ensureAllowed).toHaveBeenCalledWith(userId(), 'track_version');
    expect(aggregateRepo.loadByOwnerAndReference).toHaveBeenCalledWith(userId(), refId());
    expect(tx.run).toHaveBeenCalledTimes(1);
    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(quota.recordUsage).toHaveBeenCalledWith(userId(), 'track_version');
    expect(analytics.track).toHaveBeenCalledWith(
      'music_version_created',
      userId(),
      expect.objectContaining({
        reference_id: refId(),
        genre: GENRE.Pop,
        type: VERSION_TYPE.Cover,
      }),
    );
    expect(result.label).toBe('Acoustic');
    expect(result.owner_id).toBe(userId());
  });

  it('stops at quota check — no aggregate load, no save, no analytics', async () => {
    const { handler, aggregateRepo, quota, analytics } = setup();
    const quotaErr = new Error('QUOTA_EXCEEDED');
    quota.ensureAllowed.mockRejectedValueOnce(quotaErr);

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), basePayload)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByOwnerAndReference).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('wraps unknown persistence errors in a TechnicalError carrying context', async () => {
    const { handler, aggregateRepo, quota, analytics } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), basePayload)),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_CREATION_REPO_FAIL',
      context: expect.objectContaining({
        actorId: userId(),
        musicReference_id: refId(),
        operation: 'CreateMusicVersion.save',
      }),
    });

    expect(analytics.track).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('wraps any runner failure (even an upstream TechnicalError) with handler context', async () => {
    const { handler, aggregateRepo } = setup();
    const inner = new TechnicalError('Transaction failed', {
      code: 'TRANSACTION_FAILED',
      cause: new Error('replset timeout'),
    });
    aggregateRepo.save.mockRejectedValueOnce(inner);

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), basePayload)),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_CREATION_REPO_FAIL',
      cause: inner,
      context: expect.objectContaining({
        actorId: userId(),
        musicReference_id: refId(),
        operation: 'CreateMusicVersion.save',
      }),
    });
  });

  it('does not call aggregate.save when entity invariant rejects the payload', async () => {
    const { handler, aggregateRepo } = setup();

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), { ...basePayload, label: '   ' })),
    ).rejects.toThrow('MUSIC_VERSION_LABEL_REQUIRED');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });

  it('throws REPERTOIRE_ENTRY_NOT_FOUND (404) when the user has no entry for that reference', async () => {
    const { handler, aggregateRepo } = setup();
    aggregateRepo.loadByOwnerAndReference.mockResolvedValueOnce(null);

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), basePayload)),
    ).rejects.toMatchObject({
      name: 'BusinessError',
      code: 'REPERTOIRE_ENTRY_NOT_FOUND',
      status: 404,
    });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });
});
